'use strict';

import * as vscode from 'vscode';
import { JupyterFS } from './jupyterFileSystemProvider';
import * as vscode_helpers from 'vscode-helpers';
import {getOrPromptServer} from './util';

export async function activate(context: vscode.ExtensionContext) {

    const jupyterFS = new JupyterFS();
    context.subscriptions.push(vscode.workspace.registerFileSystemProvider('jupyterfs', jupyterFS, { isCaseSensitive: true }));
    
    vscode.workspace.updateWorkspaceFolders(0, 0, { uri: vscode.Uri.parse('jupyterfs:/'), name: "MemFS - Sample" });

    context.subscriptions.push(vscode.commands.registerCommand('jupyterfs.workspaceInit', async _ => {
        const serverUrl = await getOrPromptServer(context, "")
        if (serverUrl === undefined) {
            throw "unhandled server url error";
        }
        await jupyterFS.addJupyterServer(serverUrl); 
        await vscode.commands.executeCommand('workbench.files.action.refreshFilesExplorer');
        // await jupyterFS.writeFile(vscode.Uri.parse(`jupyterfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
        
    }));

    context.subscriptions.push(vscode.commands.registerCommand('jupyterfs.test', async _ => {
        await jupyterFS.writeFile(vscode.Uri.parse(`jupyterfs:/file.txt`), Buffer.from('foo'), { create: true, overwrite: true });
    }));
}
