export const RegisterMode = {

	CHECK: {
		code: 'check',
		value: '1',
		color: 'white',
		text: 'チェック',
		icon: 'material-symbols:check-circle-outline',
	},
	RETIRE: {
		code: 'retire',
		value: '2',
		color: '#faa',
		text: 'リタイア',
		icon: 'material-symbols:close',
	},
	SKIP: {
		code: 'skip',
		value: '3',
		color: '#8cf',
		text: 'スキップ',
		icon: 'material-symbols:step-over',
	},
	
} as const;

export type RegisterMode = (typeof RegisterMode)[keyof typeof RegisterMode];


export class RegisterModeState {
	private mode: RegisterMode;

	constructor(mode: RegisterMode) {
			this.mode = mode;
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

	getCode(): string {
		return this.mode.code
	}
	getText(): string {
		return this.mode.text
	}
	

	setMode(newMode: RegisterMode): void {
			this.mode = newMode;
	}
}