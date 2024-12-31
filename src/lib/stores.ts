import { writable } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { RegisterMode, RegisterModeState } from '$lib/type/RegisterMode';
import { TimingEvent } from '$lib/api/TimingEvent';
import { TimingPoint } from '$lib/api/TimingPoint';
import { Config } from '$lib/type/Config';

export const selectedRegisterMode = writable<RegisterModeState>(new RegisterModeState(RegisterMode.CHECK));

// ダイアログの表示
//export const showsConfigDialog = writable(false);				// 設定ダイアログ
export const showsConfigLoginDialog = writable(false);		// 設定ダイアログへのログイン
export const showsEventLoadDialog = writable(false);			// イベント取得
export const showsPointSelectDialog = writable(false);		// 地点選択
export const showsMemberLoadDialog = writable(false);			// 名簿取り込み
export const showsMemberSelectDialog = writable(false);		// メンバーを複数から選択
export const showsRegisterConfirmDialog = writable(false);	// 登録確認ダイアログ

//export const selectedEvent = writable<TimingEvent | null>(null);
export const selectedEvent = persisted('selectedEvent', <TimingEvent | null>(null));
export const selectedPoint = persisted('selectedPoint', <TimingPoint | null>(null));
export const inputPassword = persisted('inputPassword', <string | null>null);
export const selectedLogId = persisted('selectedLogId', <number | null>null);

export const config = persisted('config', <Config>(new Config({
	allowsDuplicate: false,
	allowsSending: false, sendingIntervalSec:30,
	//availableRegisterModes: [RegisterMode.CHECK] as RegisterMode[],
	availableRegisterModes: [RegisterMode.CHECK],
	memberCount: 0,
})));

