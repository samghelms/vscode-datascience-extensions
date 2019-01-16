/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/

'use strict';

import * as path from 'path';
import * as vscode from 'vscode';
import { createContentsManager, getJupyterNewReq, vscodeTypeFromJupyterType } from './util';
import { ContentsManager, Contents } from '@jupyterlab/services';

export class File implements vscode.FileStat {

    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    data: Uint8Array;

    constructor(name: string) {
        this.type = vscode.FileType.File;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
    }
}

export class Directory implements vscode.FileStat {

    type: vscode.FileType;
    ctime: number;
    mtime: number;
    size: number;

    name: string;
    entries: Map<string, File | Directory>;

    constructor(name: string) {
        this.type = vscode.FileType.Directory;
        this.ctime = Date.now();
        this.mtime = Date.now();
        this.size = 0;
        this.name = name;
        this.entries = new Map();
    }
}

export type Entry = File | Directory;

export class JupyterFS implements vscode.FileSystemProvider {
    contentsManager: ContentsManager;
    /**
     * Assumes that the jupyterServerUrl is already validated.
     * @param jupyterServerUrl 
     */
    async addJupyterServer(jupyterServerUrl: string) {
        this.contentsManager = await createContentsManager(jupyterServerUrl);
    }

    async stat(uri: vscode.Uri): Promise<vscode.FileStat> {
        const stat = await this._lookup(uri, false)
        return stat;
    }

    async readDirectory(uri: vscode.Uri): Promise<[string, vscode.FileType][]> {
        console.log("reading directory")
        let entry = await this._lookup(uri, false);
        if (entry.type === vscode.FileType.File) {
            throw vscode.FileSystemError.FileNotADirectory(uri);
        }
        let result: [string, vscode.FileType][] = [];
        let folderContent = (await this.contentsManager.get(uri.path)).content;
        for (const content of folderContent) {
            result.push([content.name, vscodeTypeFromJupyterType(content.type)]);
        }
        return result;
    }

    // --- manage file contents

    async readFile(uri: vscode.Uri): Promise<Uint8Array> {
        let entry = await this._lookup(uri, false);
        if (entry.type === vscode.FileType.File) {
            let content = await this.contentsManager.get(uri.path)
            return Buffer.from(content.content, 'utf8');
        }
        throw vscode.FileSystemError.FileIsADirectory(uri);

    }

    async writeFile(uri: vscode.Uri, content: Uint8Array, options: { create: boolean, overwrite: boolean }) {
        let entry;
        let jupyterReqOpts = getJupyterNewReq(uri.path, 'file');
        try {
            entry = await this._lookup(uri, false);
        } catch (err) {
            if (err instanceof vscode.FileSystemError.FileNotFound && !options.create) {
                throw vscode.FileSystemError.FileNotFound(uri);
            }
            if (options.create) {
                await this.contentsManager.save(uri.path, {content: content.toString(), format: 'text'});
                this._fireSoon({ type: vscode.FileChangeType.Created, uri });
                return;
            }
            throw err;
        }
        // At this point we know the file exists
        if (entry.type === vscode.FileType.Directory) {
            throw vscode.FileSystemError.FileIsADirectory(uri);
        }
        if(options.create && !options.overwrite) {
            throw vscode.FileSystemError.FileExists(uri);
        }
        try {
            if (options.create && options.overwrite) {
                await this.contentsManager.delete(uri.path);
                await this.contentsManager.save(uri.path, {content: content.toString(), format: 'text'}); 
            }
        } catch(err) {
            throw err;
        }
        this._fireSoon({ type: vscode.FileChangeType.Changed, uri });
    }

    // --- manage files/folders

    async rename(oldUri: vscode.Uri, newUri: vscode.Uri, options: { overwrite: boolean }) {

        if (!options.overwrite && this._lookup(newUri, true)) {
            throw vscode.FileSystemError.FileExists(newUri);
        }

        await this.contentsManager.rename(oldUri.path, newUri.path);
        this._fireSoon(
            { type: vscode.FileChangeType.Deleted, uri: oldUri },
            { type: vscode.FileChangeType.Created, uri: newUri }
        );
    }

    delete(uri: vscode.Uri): void {
        let dirname = uri.with({ path: path.posix.dirname(uri.path) });
        if (!this._lookup(uri, true)) {
            throw vscode.FileSystemError.FileNotFound(uri);
        }
        this.contentsManager.delete(uri.path);
        this._fireSoon({ type: vscode.FileChangeType.Changed, uri: dirname }, { uri, type: vscode.FileChangeType.Deleted });
    }

    async createDirectory(uri: vscode.Uri) {
        let dirname = uri.with({ path: path.posix.dirname(uri.path) });
        let newDir: Contents.IModel;

        let pass = false;
        const res = await this._lookup(uri, true);
        if (res !== undefined) {
            throw vscode.FileSystemError.FileExists( uri );
        }

        try {
            newDir = await this.contentsManager.newUntitled({path: dirname.path, type: "directory"});
            await this.contentsManager.rename(newDir.path, uri.path);
            // awa
        } catch(err) {
            throw err;
        }

        this._fireSoon({ type: vscode.FileChangeType.Changed, uri: dirname }, { type: vscode.FileChangeType.Created, uri });
    }

    // --- lookup

    // TODO: get file size
    // private _lookup(uri: vscode.Uri, silent: false): Promise<vscode.FileStat>;
    // private _lookup(uri: vscode.Uri, silent: boolean): Promise<vscode.FileStat> | Promise<undefined>;
    private async _lookup(uri: vscode.Uri, silent: boolean): Promise<vscode.FileStat> {
        let ret;
        try {
            const jupyterStat = await this.contentsManager.get(uri.path, {content: false});
            const vsType = vscodeTypeFromJupyterType(jupyterStat.type)
            ret = { 
                type: vsType, 
                size: 0, 
                ctime: new Date(jupyterStat.created).getTime(), 
                mtime: new Date(jupyterStat.last_modified).getTime() 
            }
        } catch (err) {
            if (!silent) {
                throw vscode.FileSystemError.FileNotFound(uri);
            }
        }
        return ret;
    }
    // --- manage file events
    private _emitter = new vscode.EventEmitter<vscode.FileChangeEvent[]>();
    private _bufferedEvents: vscode.FileChangeEvent[] = [];
    private _fireSoonHandle: NodeJS.Timer;

    readonly onDidChangeFile: vscode.Event<vscode.FileChangeEvent[]> = this._emitter.event;

    watch(resource: vscode.Uri, opts): vscode.Disposable {
        // ignore, fires for all changes...
        return new vscode.Disposable(() => { });
    }

    private _fireSoon(...events: vscode.FileChangeEvent[]): void {
        this._bufferedEvents.push(...events);
        clearTimeout(this._fireSoonHandle);
        this._fireSoonHandle = setTimeout(() => {
            this._emitter.fire(this._bufferedEvents);
            this._bufferedEvents.length = 0;
        }, 5);
    }
}
