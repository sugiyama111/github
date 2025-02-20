import { Toast } from "./Toast";

export class TwaPortMessenger {
	private static instance:TwaPortMessenger | null = null;		// クラスの唯一のインスタンス
	private static port:MessagePort;

		public static getInstance(
				event:MessageEvent) {
				//onMessageCallback:((this: MessagePort, ev: MessageEvent<any>)=>any)): TwaPortMessenger {
	
		if (!TwaPortMessenger.instance) {
			TwaPortMessenger.port = event.ports[0];
			navigator.serviceWorker.controller?.postMessage({ type: 'twaMessagePort', port: TwaPortMessenger.port }, [TwaPortMessenger.port]);

			// TWAから受け取った場合の処理
			TwaPortMessenger.port.onmessage = function (event) {
				if (event.data.type === 'pageTransition') {
					console.log('Received port from Service Worker');
					console.log(event.data.port);
					// swに保持しておいたMessagePortを取得
					TwaPortMessenger.port = event.data.port;
				}
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
