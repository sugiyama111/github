import { Toast } from "./Toast";

export class TwaPortMessenger {
	private static instance:TwaPortMessenger | null = null;		// クラスの唯一のインスタンス
	private static port:MessagePort;

		public static getInstance(
				event:MessageEvent,
				onMessageCallback:((this: MessagePort, ev: MessageEvent<any>)=>any)): TwaPortMessenger {
	
		if (!TwaPortMessenger.instance) {
			TwaPortMessenger.port = event.ports[0];

			TwaPortMessenger.port.onmessage = onMessageCallback;		// メッセージ受信時のコールバック関数を登録

			TwaPortMessenger.instance = new TwaPortMessenger();
		}

		return TwaPortMessenger.instance;
	}

	public turnOn() {
			console.log('ScannerMessenger.turnOn start');
	
			const json = {
				"action": "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN",
				"extra_key": "com.symbol.datawedge.api.EXTRA_PARAMETER",
				"extra_value": "ENABLE_PLUGIN"
			}
	
			try {
				TwaPortMessenger.port.postMessage(JSON.stringify(json));
			} catch (e:any) {
				Toast.Error(e);
			}
	
			console.log('ScannerMessenger.turnOn end');
	}

	public turnOff() {
		console.log('ScannerMessenger.turnOff start');

		const json = {
			"action": "com.symbol.datawedge.api.ACTION_SCANNERINPUTPLUGIN",
			"extra_key": "com.symbol.datawedge.api.EXTRA_PARAMETER",
			"extra_value": "DISABLE_PLUGIN"
		}

		try {
			TwaPortMessenger.port.postMessage(JSON.stringify(json));
		} catch (e:any) {
			Toast.Error(e);
		}

		console.log('ScannerMessenger.turnOff end');
}
}
