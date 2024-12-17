export const RegisterMethod = {

	SCANNER: {
		code: 'scanner',
		value: '1',
		text: 'スキャナ',
		serverValue: '2',
	},
	CAMERA: {
		code: 'camera',
		value: '2',
		text: 'カメラ',
		serverValue: '0',
	},
	KEYPAD: {
		code: 'keypad',
		value: '3',
		text: 'キーパッド',
		serverValue: '1',
	},
	
} as const;

export type RegisterMethod = (typeof RegisterMethod)[keyof typeof RegisterMethod];


export class RegisterMethodState {
	private method: RegisterMethod;

	constructor(method: RegisterMethod) {
			this.method = method;
	}

	getMethod(): RegisterMethod {
			return this.method;
	}

	isScanner(): boolean {
		return this.method.code === RegisterMethod.SCANNER.code;
	}

	isCamera(): boolean {
			return this.method.code === RegisterMethod.CAMERA.code;
	}

	isKeypad(): boolean {
			return this.method.code === RegisterMethod.KEYPAD.code;
	}

	setMethod(newMethod: RegisterMethod): void {
			this.method = newMethod;
	}
}