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
}

// export const createTestJupyterServerConn = async (serverUrl) => {
//     const contentsManager = await createContentsManager(serverUrl);
//     try {
//         await contentsManager.get('');
//     } catch(err) {
//         return 'false';
//     }
// }

export const getJupyterNewReq = (uri: string, type: 'notebook' | 'file' | 'directory'): Contents.ICreateOptions => {
    const extSplit = uri.split('.');
    const ext = extSplit[extSplit.length - 1];
    const uriSplit = uri.split('/');
    const path = uriSplit.slice(0, uriSplit.length - 1).join('/');
    return { ext, path, type }
}

// TODO: handle symbolic links
export const vscodeTypeFromJupyterType = (jupyterType: Contents.ContentType): vscode.FileType => {
    if(jupyterType === 'directory') {
        return vscode.FileType.Directory;
    }
    return vscode.FileType.File;
}

// TODO: better error messages here
export const createTestJupyterServerConn = async (serverUrl, notebookPath: string) => {
	const contentsManager = await createContentsManager(serverUrl);
	try {
		await contentsManager.get(notebookPath, {content: false});
	} catch(err) {
		// vscode.window.showErrorMessage(err);
		return 'Cannot connect';
	}
};

export const getOrPromptServer = async (context, notebookPath=""): Promise<string | undefined> => {
	let urlValue: string | undefined = context.globalState.get('jupyterServerUrl');
	const isUp = await createTestJupyterServerConn(urlValue, notebookPath);
	if (isUp === 'Cannot connect') {
		urlValue = await vscode.window.showInputBox({
			password: false,
			placeHolder: 'Enter a jupyter notebook url here ...',
			prompt: "Open Jupyter Server",
			validateInput: (v) => {
				return createTestJupyterServerConn(v, '');
			}
		});
		if (vscode_helpers.isEmptyString(urlValue)) {
			throw "unhandled validation error";
		}
		urlValue = urlValue as string;
	} 
	context.globalState.update('jupyterServerUrl', urlValue);
	return urlValue;
};