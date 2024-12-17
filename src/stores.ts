import { writable } from 'svelte/store';
import { RegisterMode, RegisterModeState } from '$lib/type/RegisterMode';
import { TimingEvent } from '$lib/type/TimingEvent';
import { TimingPoint } from '$lib/type/TimingPoint';
import { Config } from '$lib/type/Config';

export const selectedRegisterMode = writable<RegisterModeState>(new RegisterModeState(RegisterMode.CHECK));

// ダイアログの表示
export const showsConfigDialog = writable(false);					// 設定ダイアログ
export const showsConfigLoginDialog = writable(false);		// 設定ダイアログへのログイン
export const showsEventLoadDialog = writable(false);			// イベント取得

export const selectedEvent = writable<TimingEvent | null>(null);
export const selectedPoint = writable<TimingPoint | null>(null);

export const config = writable<Config>(new Config({
	allowsDuplicate: false, allowsSending: false, sendingIntervalSec:30,
	availableRegisterModes: [RegisterMode.CHECK] as RegisterMode[],
}));

