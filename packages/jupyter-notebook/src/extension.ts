import * as vscode from 'vscode';
import CatCodingPanel from './jupyterPanel'
import * as vscode_helpers from 'vscode-helpers';
import {createTestJupyterServerConn} from './util';

export function activate(context: vscode.ExtensionContext) {

    context.subscriptions.push(vscode.commands.registerCommand('catCoding.start', async () => {
        // if (initialized) {
        //     return;
        // }
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

        // initialized = true;
        CatCodingPanel.createOrShow(context.extensionPath);
        CatCodingPanel.currentPanel.doConnectToJupyter(urlValue);
    }));

    context.subscriptions.push(vscode.commands.registerCommand('catCoding.doRefactor', () => {
        if (CatCodingPanel.currentPanel) {
            CatCodingPanel.currentPanel.doRefactor();
        }
    }));

    if (vscode.window.registerWebviewPanelSerializer) {
        // Make sure we register a serilizer in activation event
        vscode.window.registerWebviewPanelSerializer(CatCodingPanel.viewType, {
            async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
                console.log(`Got state: ${state}`);
                CatCodingPanel.revive(webviewPanel, context.extensionPath);
            }
        });
    }
}