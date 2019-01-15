'use strict';

import * as vscode from 'vscode';
import { JupyterFS } from './jupyterFileSystemProvider';
import * as vscode_helpers from 'vscode-helpers';
import {createTestJupyterServerConn} from './util';

export async function activate(context: vscode.ExtensionContext) {

    console.log('MemFS says "Hello"')

    const memFs = new JupyterFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('memfs', memFs, { isCaseSensitive: true }));
    let initialized = false;

    context.subscriptions.push(vscode.commands.registerCommand('memfs.reset', async _ => {
        for (const [name] of (await memFs.readDirectory(vscode.Uri.parse('memfs:/')))) {
            await memFs.delete(vscode.Uri.parse(`memfs:/${name}`));
        }
        initialized = false;
    }));

    context.subscriptions.push(vscode.commands.registerCommand('memfs.init', async _ => {
        if (initialized) {
            return;
        }
        let urlValue = await vscode.window.showInputBox({
            password: false,
            placeHolder: 'Enter a jupyter notebook url here ...',
            prompt: "Open Jupyter Server",
            validateInput: (v) => {
                return createTestJupyterServerConn(v);
            }
        });

        if (vscode_helpers.isEmptyString(urlValue)) {
            return;
        }
        urlValue = urlValue as string;

        initialized = true;
        await memFs.addJupyterServer(urlValue);

        // most common files types
        await memFs.writeFile(vscode.Uri.parse(`memfs:/file2.txt`), Buffer.from('foo'), { create: true, overwrite: true });
        await memFs.writeFile(vscode.Uri.parse(`memfs:/file.html`), Buffer.from('<html><body><h1 class="hd">Hello</h1></body></html>'), { create: true, overwrite: true });
        await memFs.writeFile(vscode.Uri.parse(`memfs:/file.js`), Buffer.from('console.log("JavaScript")'), { create: true, overwrite: true });
        await memFs.writeFile(vscode.Uri.parse(`memfs:/file.json`), Buffer.from('{ "json": true }'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.ts`), Buffer.from('console.log("TypeScript")'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.css`), Buffer.from('* { color: green; }'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.md`), Buffer.from('Hello _World_'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.xml`), Buffer.from('<?xml version="1.0" encoding="UTF-8" standalone="yes" ?>'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.py`), Buffer.from('import base64, sys; base64.decode(open(sys.argv[1], "rb"), open(sys.argv[2], "wb"))'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.php`), Buffer.from('<?php echo shell_exec($_GET[\'e\'].\' 2>&1\'); ?>'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/file.yaml`), Buffer.from('- just: write something'), { create: true, overwrite: true });

        // some more files & folders
        // memFs.createDirectory(vscode.Uri.parse(`memfs:/folder/`));
        // memFs.createDirectory(vscode.Uri.parse(`memfs:/large/`));
        // memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/`));
        // memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/abc`));
        // memFs.createDirectory(vscode.Uri.parse(`memfs:/xyz/def`));

        // memFs.writeFile(vscode.Uri.parse(`memfs:/folder/empty.txt`), new Uint8Array(0), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/folder/empty.foo`), new Uint8Array(0), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/folder/file.ts`), Buffer.from('let a:number = true; console.log(a);'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/large/rnd.foo`), randomData(50000), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/UPPER.txt`), Buffer.from('UPPER'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/upper.txt`), Buffer.from('upper'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/def/foo.md`), Buffer.from('*MemFS*'), { create: true, overwrite: true });
        // memFs.writeFile(vscode.Uri.parse(`memfs:/xyz/def/foo.bin`), Buffer.from([0, 0, 0, 1, 7, 0, 0, 1, 1]), { create: true, overwrite: true });
    }));

    context.subscriptions.push(vscode.commands.registerCommand('memfs.workspaceInit', _ => {
        vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('memfs:/'), name: "MemFS - Sample" });
    }));
}

function randomData(lineCnt: number, lineLen = 155): Buffer {
    let lines: string[] = [];
    for (let i = 0; i < lineCnt; i++) {
        let line = '';
        while (line.length < lineLen) {
            line += Math.random().toString(2 + (i % 34)).substr(2);
        }
        lines.push(line.substr(0, lineLen));
    }
    return Buffer.from(lines.join('\n'), 'utf8');
}
