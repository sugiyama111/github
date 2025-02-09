// Vibrate.ts
// 使用例
// Vibrate.Play(Vibrate.READ_OK);

// 振動パターンを定義
const vibTypes = {
  READ_OK: [150],
  NOT_FOUND: [250, 80, 250],
	KEYPAD: [100],
	TRIAL_MODE: [250, 80, 250],
  // 他の振動パターンを追加する場合はここに追加
} as const;

type VibKey = keyof typeof vibTypes;

export class VibManager {
	readonly vibList: Record<VibKey, number[]>;

	constructor() {
		this.vibList = {} as Record<VibKey, number[]>;

		Object.entries(vibTypes).forEach(([key, src]) => {
			this.vibList[key as VibKey] = [...src];
		});
	}

	// ネイティブの振動を実行する関数
	play(pattern: number | number[]): boolean {
		if ('vibrate' in navigator) {
			return navigator.vibrate(pattern);
		}
		console.warn('Vibration API is not supported on this device.');
		return false;
	}

}


// VibManagerインスタンスを作成
const vibManager = new VibManager();

export const Vibrate = {
	...vibManager.vibList,
	Play: (vibType: number[]): void => {
		vibManager.play(vibType);
	},
}
