
type SecondParams = { milsecPerTick?:number, onTimeout:Function, onTick:Function };

export class TimeoutTicker {

	private _timeoutTick!:number;			// 残り時間の開始値
	leftTick:number;				// 残り時間の値
	milsecPerTick:number;		// 何ミリ秒で1tickするか
	processId:number|null = null;
	onTimeout:Function;		// タイムアウトに至った時の処理
	onTick:Function;			// 1tickしたときの処理

	set timeoutTick(val:number) {
		this._timeoutTick = val < 2 ? 2 : val;
		console.log(`setter: ${this._timeoutTick}`);
	}
	get timeoutTick():number {
		return this._timeoutTick;
	}

	constructor(timeoutTick:number, {milsecPerTick=1000, onTimeout, onTick}:SecondParams) {
		this.timeoutTick = timeoutTick;
		this.leftTick = this.timeoutTick;
		this.milsecPerTick = milsecPerTick;
		this.onTimeout = onTimeout;
		this.onTick = onTick;
	}

	resetLeftTick = () => {
		this.leftTick = this.timeoutTick;
	}

	/**
	 * 開始する。
	 * 開始後に再度呼び出すと、既存の時間経過は停止され、最初からやり直すことになる。
	 */
	start = () => {
		// 開始済みの場合は一度停止する
		this.stop();

		this.resetLeftTick();

		// 一度実行してから次の予約をする
		this.doTick();
		this.tickDown(true);
	}

	// 1tick経過するときの処理
	tickDown = (isTopLevelCall:boolean=false) => {
		// 停止されている場合はプロセスIDにnull. 処理しない。
		if (!isTopLevelCall && this.processId === null) return;

		// 1tick経過
		this.doTick();

		// tickが0になった場合
		if (this.leftTick === 0) {
			this.stop();
			this.onTimeout();
			return;
		}

		// 指定ミリ秒に次の処理の予約
		this.processId = setTimeout(this.tickDown, this.milsecPerTick);
	}

	doTick = () => {
		this.leftTick--;
		this.onTick();
	}

	// tickerを停止する。
	// 開始時にも一度呼ばれる。
	stop = () => {
		if (this.processId) clearTimeout(this.processId);
		this.processId = null;
	}

	// 現在の残り時間の割合
	// 引き数には小数点の桁数を指定する
	ratio = (digit:number=3):number => {
		return Number.parseFloat((this.leftTick / this.timeoutTick).toFixed(digit));
	}

	setTimeoutTick = (timeoutTick:number) => {
		this.timeoutTick = timeoutTick;
	}
}
