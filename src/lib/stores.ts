import { writable, derived } from 'svelte/store';
import { persisted } from 'svelte-persisted-store';

import { RegisterMode, RegisterModeState } from '$lib/type/RegisterMode';
import { TimingEvent } from '$lib/api/TimingEvent';
import { TimingPoint } from '$lib/api/TimingPoint';
import { Config } from '$lib/type/Config';
import type RecordEntity from '$lib/db/RecordEntity';
import { dayjs, type Dayjs } from '$lib/type/Dayjs';
import { ScannerMessenger } from './ScannerMessenger';


export const goBackUrl = writable<string|null>(null);

// オブジェクトのため、persistedにはしない(できない)
export const selectedRegisterMode = writable<RegisterModeState>(new RegisterModeState(RegisterMode.CHECK));

// ダイアログの表示
//export const showsConfigDialog = writable(false);				// 設定ダイアログ
export const showsConfigLoginDialog = writable(false);		// 設定ダイアログへのログイン
export const showsEventLoadDialog = writable(false);			// イベント取得
export const showsPointSelectDialog = writable(false);		// 地点選択
export const showsMemberLoadDialog = writable(false);			// 名簿取り込み
export const showsMemberSelectDialog = writable(false);		// メンバーを複数から選択
export const showsRegisterConfirmDialog = writable(false);	// 登録確認ダイアログ
export const showsCameraSelectDialog = writable(false);		// カメラ選択ダイアログ
export const scanner = writable<ScannerMessenger>();

export const sendingProcessId = writable<number|null>(null);	// 定期送信プロセスID
export const isSending = writable<boolean>(false);				// 送信中であるか


//export const selectedEvent = writable<TimingEvent | null>(null);
export const selectedEvent = persisted('selectedEvent', <TimingEvent | null>(null));
export const selectedPoint = persisted('selectedPoint', <TimingPoint | null>(null));
export const inputPassword = persisted('inputPassword', <string | null>null);
export const selectedLogId = persisted('selectedLogId', <number | null>null);
export const unsentCount = persisted('unsentCount', <number>0);

export const selectedCameraId = persisted('selectedCameraId', <string | null>null);
export const isCameraMirrored = persisted('isCameraMirrored', <boolean>false);

// check/retire/skip いずれかをキーとし、それぞれの最終登録RecordEntity(nullable)を扱う型
type Registered = {
	[K in 'check' | 'retire' | 'skip']: RecordEntity | null;
};
export const lastRegistered = persisted('lastRegistered', <Registered>{check:null, retire:null, skip:null});

type RegisteredTime = {
	[K in 'check' | 'retire' | 'skip']: Dayjs | null;
}

export const lastRegisteredTime = derived<typeof lastRegistered, RegisteredTime>(lastRegistered, 
	($lastRegistered) => ({
		check: $lastRegistered?.check?.time != null ? dayjs($lastRegistered.check?.time) : null,
		retire: $lastRegistered?.retire?.time != null ? dayjs($lastRegistered.retire?.time) : null,
		skip: $lastRegistered?.skip?.time != null ? dayjs($lastRegistered.skip?.time) : null,
	})
);

export const config = persisted('config', <Config>(new Config({
	allowsDuplicate: false,
	allowsSending: false,
	sendingIntervalSec:30,
	//availableRegisterModes: [RegisterMode.CHECK] as RegisterMode[],
	availableRegisterModes: [RegisterMode.CHECK],
	memberCount: 0,
})));

