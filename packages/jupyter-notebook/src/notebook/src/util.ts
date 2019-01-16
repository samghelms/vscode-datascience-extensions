import { ServerConnection } from '@jupyterlab/services';
import Url = require('url-parse');

export const createSettings = async (serverUrl: string): Promise<ServerConnection.ISettings> => {
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
	return settings;
};
