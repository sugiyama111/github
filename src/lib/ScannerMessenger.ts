import { WebSocketConnector } from "./WebSocketConnector";

/**
 * スキャナの操作を行う。
 */
export class ScannerMessenger {
	private static instance:ScannerMessenger | null = null;		// クラスの唯一のインスタンス
	private static connector:WebSocketConnector;	// 共有する接続

	public static async asyncGetInstance(onScanned:Function): Promise<ScannerMessenger> {
		//console.log('ScannerMessenger.asyncGetInstance start');

		if (!ScannerMessenger.instance) {
			ScannerMessenger.connector = new WebSocketConnector('ws://127.0.0.1:12345/')
			await ScannerMessenger.connector.asyncConnect();		// 接続する
			ScannerMessenger.connector.onMessageCallback = onScanned;		// スキャン時のコールバック関数を登録

			ScannerMessenger.instance = new ScannerMessenger();
		}

		//console.log('ScannerMessenger.asyncGetInstance end');
		return ScannerMessenger.instance;
	}

	public async asyncTurnOn() {
		//console.log('ScannerMessenger.asyncTurnOn start');

		const json = {
			"action": "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN",
			"extra_key": "com.symbol.datawedge.api.EXTRA_PARAMETER",
			"extra_value": "ENABLE_PLUGIN"
		}

		await ScannerMessenger.connector.asyncSend(json);

		//console.log('ScannerMessenger.asyncTurnOn end');
	}

	public async asyncTurnOff() {
		console.log('ScannerMessenger.asyncTurnOff start');

		const json = {
			"action": "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN",
			"extra_key": "com.symbol.datawedge.api.EXTRA_PARAMETER",
			"extra_value": "DISABLE_PLUGIN"
		}

		try {
			await ScannerMessenger.connector.asyncSend(json);
		} catch (e) {
			console.log(e);
		}

		console.log('ScannerMessenger.asyncTurnOff end');
	}
}
