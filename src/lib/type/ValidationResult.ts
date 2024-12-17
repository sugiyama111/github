export const ValidationResult = {

	VALID: {
		code: 'valid',
		type: 'success',
		message: '登録しました',
	},
	INVALID_FORMAT: {
		code: 'invalid_format',
		type: 'error',
		message: '対応していないQRコードです',
	},
	EVENT_ID_NOT_MATCH: {
		code: 'event_id_not_match',
		type: 'error',
		message: '違うイベントのQRコードです',
	},
	MEMBER_NOT_FOUND: {
		code: 'member_not_found',
		type: 'error',
		message: '名簿に見つかりません',
	},
	DUPLICATE: {
		code: 'duplicate',
		type: 'error',
		message: '読み取り済みです',
	},
	REGISTER_NOT_ALLOWED_YET: {
		code: 'register_not_allowed_yet',
		type: 'error',
		message: '読み取り開始になっていません',
	},
	ERROR: {
		code: 'error',
		type: 'error',
		message: '処理に失敗しました',
	},
	
} as const;

export type ValidationResult = (typeof ValidationResult)[keyof typeof ValidationResult];


export class ValidationResultState {
	private result: ValidationResult;

	constructor(result: ValidationResult) {
			this.result = result;
	}

	getResult(): ValidationResult {
			return this.result;
	}

	isSuccess(): boolean {
			return this.result.type === 'success';
	}

	isError(): boolean {
			return this.result.type === 'error';
	}

	setResult(result: ValidationResult): void {
			this.result = result;
	}
}