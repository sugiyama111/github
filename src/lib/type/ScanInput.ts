import type { RegisterModeState } from '$lib/type/RegisterMode';
import type { RegisterMethodState } from '$lib/type/RegisterMethod';

/**
 * スキャン入力情報の一式を表すクラス。
 * スキャンした文字以外に、スキャン時刻、スキャン方法、スキャンモード、イベントIDを含む。
 */
export class ScanInput {
	val: string;
	time: string;
	method: RegisterMethodState;
	mode: RegisterModeState;
	eventId: string;

	/**
	 * 
	 * @param val スキャン入力文字列
	 * @param time スキャン時刻
	 * @param method スキャン方法
	 * @param mode スキャンモード
	 * @param eventId イベントID
	 */
	constructor(val:string, time:string, method:RegisterMethodState, mode:RegisterModeState, eventId:string) {
		this.val = val;
		this.time = time;
		this.method = method;
		this.mode = mode;
		this.eventId = eventId;
	}

	
	
}
