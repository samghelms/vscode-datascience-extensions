/**
 * Manages cat coding webview panels
 */
import * as path from 'path';
import * as vscode from 'vscode';

export default class JupyterPanel {
	/**
	 * Track the currently panel. Only allow a single panel to exist at a time.
	 */
	public static currentPanel: JupyterPanel | undefined;

	public static readonly viewType = 'ipythonView';

	private readonly _panel: vscode.WebviewPanel;
	private readonly _extensionPath: string;
	private readonly _notebookPath: string;
	private _disposables: vscode.Disposable[] = [];

	constructor(
		extensionPath: string,
		notebookPath: string,
		urlValue: string,
		webviewPanel: any = null
	) {
		const column = vscode.window.activeTextEditor ? vscode.window.activeTextEditor.viewColumn : undefined;

		if(webviewPanel) {
			this._panel = webviewPanel;
		} else {
			this._panel = vscode.window.createWebviewPanel(JupyterPanel.viewType, notebookPath, column || vscode.ViewColumn.One, {
				// Enable javascript in the webview
				enableScripts: true,
				retainContextWhenHidden: true,

				// And restric the webview to only loading content from our extension's `media` directory.
				localResourceRoots: [
					vscode.Uri.file(path.join(extensionPath, 'media'))
				]
			});
		}
		this._extensionPath = extensionPath;
		this._notebookPath = notebookPath;
		// Set the webview's initial html content 
		this._update(notebookPath);

		// Listen for when the panel is disposed
		// This happens when the user closes the panel or when the panel is closed programatically
		this._panel.onDidDispose(() => this.dispose(), null, this._disposables);

		// Update the content based on view changes
		// this._panel.onDidChangeViewState(e => {
		// 	if (this._panel.visible) {
				// this._update(notebookPath);
				// this.open(urlValue, notebookPath);
			// }
		// }, null, this._disposables);

		// Handle messages from the webview
		this._panel.webview.onDidReceiveMessage(message => {
			switch (message.command) {
				case 'alert':
					vscode.window.showErrorMessage(message.text);
					return;
			}
		}, null, this._disposables);
	}
	
	public open(serverUrl, notebookPath) {
		this._panel.webview.postMessage({ serverUrl, notebookPath, command: 'connect' });
	}

	public dispose() {
		// Clean up our resources
		this._panel.dispose();

		while (this._disposables.length) {
			const x = this._disposables.pop();
			if (x) {
				x.dispose();
			}
		}
	}

	private _update(title: string) {
		this._panel.title = title;
		this._panel.webview.html = this._getHtmlForWebview();
	}

	private _getHtmlForWebview() {

		// Local path to main script run in the webview
		const scriptPathOnDisk = vscode.Uri.file(path.join(this._extensionPath, 'media', 'dist/bundle.js'));

		// And the uri we use to load this script in the webview
		const scriptUri = scriptPathOnDisk.with({ scheme: 'vscode-resource' });

		// Use a nonce to whitelist which scripts can be run
		// const nonce = getNonce();

		return `<!doctype html>
<html lang="en">
  <head>
  <meta charset="UTF-8">
	<!--
	Use a content security policy to only allow loading images from https or from our extension directory,
	and only allow scripts that have a specific nonce.
	-->
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Notebook Demo</title>
  </head>
  <body>
    <div id="root"> </div>
	<script src="${scriptUri}"></script>
  </body>
</html>`;
	}
}

// <meta http-equiv="Content-Security-Policy" content="default-src 'none'; unsafe-inline img-src vscode-resource: https:; script-src 'nonce-${nonce}';">



// function getNonce() {
// 	let text = "";
// 	const possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
// 	for (let i = 0; i < 32; i++) {
// 		text += possible.charAt(Math.floor(Math.random() * possible.length));
// 	}
// 	return text;
// }