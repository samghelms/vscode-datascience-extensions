import { ContentsManager, ServerConnection, Contents } from '@jupyterlab/services';
import * as Url from 'url-parse';
import * as vscode from 'vscode';
import * as vscode_helpers from 'vscode-helpers';

export const createContentsManager = async (serverUrl): Promise<ContentsManager> => {
	const parsedAddress = new Url(serverUrl, null, true);
	const baseUrl = `${parsedAddress.protocol}//${parsedAddress.host}`;
	const wsUrl = `ws://${parsedAddress.host}`;
	const settings = ServerConnection.makeSettings(
		{
			baseUrl: baseUrl,
			wsUrl: wsUrl,
			token: parsedAddress.query["token"]
		}
	);
	const contentsManager = new ContentsManager({serverSettings: settings, defaultDrive: undefined});
	return contentsManager;
};

// TODO: better error messages here
export const createTestJupyterServerConn = async (serverUrl, notebookPath: string) => {
	const contentsManager = await createContentsManager(serverUrl);
	try {
		await contentsManager.get(notebookPath, {content: false});
	} catch(err) {
		// vscode.window.showErrorMessage(err);
		return 'false';
	}
};

export const getOrPromptServer = async (context, notebookPath): Promise<string> => {
	console.log(context.globalState.get('jupyterServerUrl'));
	let urlValue: string = context.globalState.get('jupyterServerUrl');
	const isUp = await createTestJupyterServerConn(urlValue, notebookPath);
	if (isUp === 'false') {
		urlValue = await vscode.window.showInputBox({
			password: false,
			placeHolder: 'Enter a jupyter notebook url here ...',
			prompt: "Open Jupyter Server",
			validateInput: (v) => {
				return createTestJupyterServerConn(v, '');
			}
		});
		if (vscode_helpers.isEmptyString(urlValue)) {
			return;
		}
		urlValue = urlValue as string;
	} 
	context.globalState.update('jupyterServerUrl', urlValue);
	return urlValue;
};