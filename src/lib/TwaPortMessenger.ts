import { Toast } from "./Toast";

export class TwaPortMessenger {
	private static instance:TwaPortMessenger | null = null;		// クラスの唯一のインスタンス
	private static port:MessagePort;

		public static getInstance(
				port:MessagePort) {
				//onMessageCallback:((this: MessagePort, ev: MessageEvent<any>)=>any)): TwaPortMessenger {
	
		if (!TwaPortMessenger.instance) {
			TwaPortMessenger.port = port;

			// TWAから受け取った場合の処理
			TwaPortMessenger.port.onmessage = function (event) {
				
				console.log("[PostMessage1] Got message" + event.data);
				
			};

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
