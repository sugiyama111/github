
/**
 * WebSocketのラップクラス
 * コールバック処理をPromiseにするためのクラス
 */
export class WebSocketConnector {
	private url:string;
	private socket:WebSocket | null = null;
	public onMessageCallback:Function | null = null;

	constructor(url:string) {
		this.url = url;
	}

	public async asyncConnect():Promise<WebSocket> {
		return new Promise((resolve, reject) => {
			this.socket = new WebSocket(this.url);

			this.socket.onopen = () => {
				console.log("WebSocket connection established.");
				resolve(this.socket!); // 接続成功時に WebSocket オブジェクトを返す
			};

			this.socket.onerror = (error) => {
				console.error("WebSocket connection failed:", error);
				reject(error); // エラー時に reject
			};

			this.socket.onclose = (event) => {
				if (!event.wasClean) {
					console.error("WebSocket connection unexpectedly closed:", event);
					reject(new Error("WebSocket connection unexpectedly closed"));
				}
			};

			this.socket.onmessage = (event) => {
				console.log('RECEIVED: ' + event.data);
				console.log('this.onMessageCB:' + this.onMessageCallback);
				if (this.onMessageCallback) this.onMessageCallback(event.data);
			}
		});
	}

	public isOpened() {
		return !this.isClosed();
	}

	public isClosed() {
		return (this.socket === null);
	}

	public async asyncSend(json:object) {
		if (this.isClosed()) {
			await this.asyncConnect();
		}

		this.socket!.send(JSON.stringify(json));
	}
}