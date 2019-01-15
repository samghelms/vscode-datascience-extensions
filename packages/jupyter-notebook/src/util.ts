import { ContentsManager, ServerConnection, Contents } from '@jupyterlab/services';
import * as Url from 'url-parse';

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

export const createTestJupyterServerConn = async (serverUrl) => {
    const contentsManager = await createContentsManager(serverUrl);
    try {
        await contentsManager.get('');
    } catch(err) {
        return 'false';
    }
}