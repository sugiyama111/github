
type SecondParams = { milsecPerTick?:number, onTimeout:Function, onTick:Function };

export class TimeoutTicker {

	timeoutTick:number;			// 残り時間の開始値
	leftTick:number;				// 残り時間の値
	milsecPerTick:number;		// 何ミリ秒で1tickするか
	processId:number|null = null;
	onTimeout:Function;		// タイムアウトに至った時の処理
	onTick:Function;			// 1tickしたときの処理

	constructor(timeoutTick:number, {milsecPerTick=1000, onTimeout, onTick}:SecondParams) {
		this.timeoutTick = timeoutTick;
		this.leftTick = timeoutTick;
		this.milsecPerTick = milsecPerTick;
		this.onTimeout = onTimeout;
		this.onTick = onTick;
	}

	start = () => {
		this.leftTick = this.timeoutTick;

		this.tickDown(true);
	}

	// 1tick経過するときの処理
	tickDown = (isFirst:boolean=false) => {
		// 停止されている場合はプロセスIDにnull. 処理しない。
		if (!isFirst && this.processId === null) return;

		// 1tick経過
		this.leftTick--;
		this.onTick();

		// 時間が来た場合
		if (this.leftTick === 0) {
			this.onTimeout();
			return;
		}

		// 指定ミリ秒に次の処理の予約
		this.processId = setTimeout(this.tickDown, this.milsecPerTick);
	}

	stop = () => {
		console.log('ticker stop');
		if (this.processId) clearTimeout(this.processId);
		this.processId = null;
	}

	// 現在の残り時間の割合
	// 引き数には小数点の桁数を指定する
	ratio = (digit:number=1):number => {
		return Number.parseFloat((this.leftTick / this.timeoutTick).toFixed(digit));
	}
}
