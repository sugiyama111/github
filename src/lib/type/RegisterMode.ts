export const RegisterMode = {

	CHECK: {
		code: 'check',
		value: '1',
		color: 'white',
		text: 'チェック',
	},
	RETIRE: {
		code: 'retire',
		value: '2',
		color: '#faa',
		text: 'リタイア',
	},
	SKIP: {
		code: 'skip',
		value: '3',
		color: '#8cf',
		text: 'スキップ',
	},
	
} as const;

export type RegisterMode = (typeof RegisterMode)[keyof typeof RegisterMode];


export class RegisterModeState {
	private mode: RegisterMode;

	constructor(mode: RegisterMode) {
			this.mode = mode;
	}

	getMode(): RegisterMode {
			return this.mode;
	}

	isCheck(): boolean {
			return this.mode.code === RegisterMode.CHECK.code;
	}

	isRetire(): boolean {
			return this.mode.code === RegisterMode.RETIRE.code;
	}

	isSkip(): boolean {
			return this.mode.code === RegisterMode.SKIP.code;
	}

	setMode(newMode: RegisterMode): void {
			this.mode = newMode;
	}
}