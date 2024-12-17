import { ScanInput } from '$lib/type/ScanInput';
import { ValidationResult, ValidationResultState } from '$lib/type/ValidationResult';

/**
 * スキャン入力情報が登録可能か確認するためのバリデーター。
 * 入力文字そのものの異常確認以外に、読み取り済みでないか、名簿に存在するかを確認する。
 */
export class ScanInputValidator {
	private input:ScanInput;

	constructor(input:ScanInput) {
		this.input = input;
	}

	/** バリデーションを行う */
	public async asyncValidate(): Promise<ValidationResultState> {
		
    // 何らかのエラー
    if (typeof(this.input.val) !== "string") {
			return new ValidationResultState(ValidationResult.INVALID_FORMAT);
    }

    const valSet = this.input.val.split(',');

    // カンマが2つでない
    if (valSet.length !== 3) {
      //return ValidationResultCode.INVALID_FORMAT;
			return new ValidationResultState(ValidationResult.INVALID_FORMAT);
    }

    // 大会IDが異なる
    if (valSet[0] != this.input.eventId) {
			return new ValidationResultState(ValidationResult.EVENT_ID_NOT_MATCH);
    }

    // 名簿に存在しない
//     const dba = new Dba();
//     const memberCollection = await dba.getMemberByMemberCodeAsync(valSet[1]);
//     if (await memberCollection.count() < 1) {
//     //    const memberList = await memberCollection.toArray();
// //    if (memberList.length < 1) {
//       return ValidationResultCode.MEMBER_NOT_FOUND;
//     }
  
    // 読み取り済み
    // if (重複エラー設定) {
    // const dba = new Dba();
    // dba.取得
    // if (既に存在する場合) {
    //  return ValidationResult.CODE_DUPLICATE;  
    // }
    // }

    // 正常
    //return ValidationResultCode.VALID;
		return new ValidationResultState(ValidationResult.VALID);
  }

}
