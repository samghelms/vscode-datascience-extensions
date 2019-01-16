import * as vscode from 'vscode';
import JupyterPanel from './jupyterPanel';
import {getOrPromptServer} from './util';

const startup = async (context, notebookPath: string) => {
	const urlValue = await getOrPromptServer(context, notebookPath);
	const jp = new JupyterPanel(context.extensionPath, notebookPath, urlValue);
	await jp.open(urlValue, notebookPath);
};

export function activate(context: vscode.ExtensionContext) {

	context.subscriptions.push(vscode.commands.registerCommand('ipython.showPreview', async () => {
		const notebookPath = vscode.workspace.asRelativePath(vscode.window.activeTextEditor.document.uri);
		vscode.commands.executeCommand('workbench.action.closeActiveEditor');
		vscode.window.showInformationMessage("Warning: if you edit the source file for this notebook in vscode, your changes may be overriden and you could corrupt your notebook.");
		await startup(context, notebookPath);
	}));

	if (vscode.window.registerWebviewPanelSerializer) {
		// Make sure we register a serializer in activation event
		vscode.window.registerWebviewPanelSerializer(JupyterPanel.viewType, {
			async deserializeWebviewPanel(webviewPanel: vscode.WebviewPanel, state: any) {
				const urlValue = await getOrPromptServer(context, webviewPanel.title);
				const jp = new JupyterPanel(context.extensionPath, webviewPanel.title, urlValue, webviewPanel);
				return await jp.open(urlValue, webviewPanel.title);
			}
		});
	}
}