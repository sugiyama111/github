export const RegisterMethod = {

	SCANNER: {
		code: 'scanner',
		value: '1',
		text: 'スキャナ',
		serverValue: '2',
		icon: 'material-symbols:point-scan-rounded',
	},
	CAMERA: {
		code: 'camera',
		value: '2',
		text: 'カメラ',
		serverValue: '0',
		icon: 'material-symbols:photo-camera-outline',
	},
	KEYPAD: {
		code: 'keypad',
		value: '3',
		text: 'キーパッド',
		serverValue: '1',
		icon: 'material-symbols:dialpad',
	},
	
} as const;

export type RegisterMethod = (typeof RegisterMethod)[keyof typeof RegisterMethod];


export class RegisterMethodState {
	private method: RegisterMethod;

	constructor(method: RegisterMethod) {
			this.method = method;
	}

	static CodeToMethod(code:string): RegisterMethod | null {
		if (code == 'scanner') return RegisterMethod.SCANNER;
		else if (code == 'camera') return RegisterMethod.CAMERA;
		else if (code == 'keypad') return RegisterMethod.KEYPAD;
		else return null;
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