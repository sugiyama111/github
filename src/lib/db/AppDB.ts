import Dexie, { type EntityTable, type IndexableType } from 'dexie';
import MemberEntity from './MemberEntity';
import LogEntity from './LogEntity';
import RecordEntity from './RecordEntity';
import type { TimingPoint } from '$lib/api/TimingPoint';
import type { TimingEvent } from '$lib/api/TimingEvent';
import { dayjs } from '$lib/type/Dayjs';
import TestEntity from './TestEntity';

export default class AppDB extends Dexie {

	public members!: EntityTable<MemberEntity, 'member_code'>;
	public logs!: EntityTable<LogEntity, 'log_id'>;
	//public records!: EntityTable<RecordEntity, 'seq'>;
	public records!: Dexie.Table<RecordEntity, number>; // 第二引数はプライマリキーの型

	public tests!: EntityTable<TestEntity, 'id'>;


	constructor() {
		super('qrt');

  /**
   * @see https://dexie.org/docs/Version/Version.stores()
   *  ++	Auto-incremented primary key
   *  &	Unique index
   *  *	Multi-entry index
   *  [A+B]	Compound index or primary key
   */

    this.version(1).stores({
      // events: '&event_code',
      // configs: '&terminal_id',
      // points: '&point_code, &point_id, sort_order',     // point_id, point_code それぞれがユニークインデックス
      members: '&member_code, bib_number, name, division, category, gender, age, nation, start_time',
			// 初期化したいため、log_idはオートインクリメントでない
      logs: '&log_id, event_code, point_id, point_code, point_name, log_start_time, record_count, sent_count, is_trial',
			// 初期化したいため、seqはオートインクリメントでない
      records: '&[log_id+seq], [log_id+sent], member_code, member_name, race_num, time, method, mode',
			tests: '&id',
    });

		this.members.mapToClass(MemberEntity);
		this.logs.mapToClass(LogEntity);
		this.records.mapToClass(RecordEntity);
		this.tests.mapToClass(TestEntity);

  }

	// メンバーを番号で取得
	async asyncFetchMemberByNumber(number:string) {
    return this.members
      .where('bib_number')
      .equals(number)
	}

	// メンバーをコードで取得
	async asyncFetchMemberByCode(code:string) {
    return this.members
      .where('member_code')
      .equals(code);
	}

	async asyncFetchMemberUnreadOnLog(logId:number) {
		const recordList = await this.records
			.where({log_id:logId}).toArray();

		// レコードのあるメンバーコードの一覧（重複除外）
		const readMemberCodeList = recordList.map((rec:RecordEntity)=>rec.member_code)
			.filter((value, index, self) => self.indexOf(value) === index);

		// 上記のメンバーコードを除くメンバー一覧を取得
		const allMemberQuery = await this.members.toCollection();
		readMemberCodeList.forEach(readMemberCode=>{
			allMemberQuery.and(member => member.member_code !== readMemberCode)
		});

		return allMemberQuery.toArray();
	}

	// ログを次に切り替え
	async asyncSwitchNextLog(event:TimingEvent, point:TimingPoint, isTrial:boolean):Promise<number> {
		const newLogId = await this.asyncFetchNewLogId()

		await this.logs.add({
			log_id: newLogId,
			event_code: event.eventCode,
			point_id  : point.pointId,
			point_code: point.pointCode,
			point_name: point.pointTitle,
			log_start_time: dayjs().format('YYYY/MM/DD HH:mm:ss'),
			record_count: 0,
			sent_count: 0,
			is_trial: isTrial === true ? 1 : 0,
		});

		return newLogId;
	}

	// 新しいログIDを取得
	async asyncFetchNewLogId() {
    const lastLog = await this.logs.orderBy('log_id').last();
		const nextLogId = (typeof lastLog === 'undefined') ? 1 : lastLog.log_id + 1;

		return nextLogId;
	}

	// ログ1件を取得
	async asyncFetchLog(log_id:number):Promise<LogEntity | null> {
		const log:LogEntity|undefined = await this.logs.get(log_id);

		// undefinedはnullに変換して返す
		return log ?? null;
	}

	// ログの一覧を取得
	async asyncFetchLogList():Promise<Array<LogEntity>> {
		return this.logs.orderBy('log_id')
			.reverse().toArray();
	}


	// 新しいレコードのSEQを取得
	async asyncFetchNewRecordSeq(logId:number) {
		//const lastRecord = await this.records.where({log_id:logId}).sortBy('seq');
    //const nextReq = (typeof lastRecord === 'undefined') ? 1 : lastRecord.seq + 1;
		const records = await this.records.where({log_id:logId}).reverse().sortBy('seq');
		const nextReq = (records.length > 0) ? records[0].seq + 1 : 1;

		return nextReq;
	}

	// 指定ログIDのレコードをすべて取得
	async asyncFetchRecord(logId:number): Promise<Array<RecordEntity>> {
		return this.records
			.where({log_id:logId})
			.reverse()
			.sortBy('seq');
	}

	// 未送信のレコード一覧を取得
	async asyncFetchUnsentRecord(logId:number): Promise<Array<RecordEntity>> {
//		const key:[number, number]  = [logId, 0];
    return this.records
			.where({log_id:logId, sent:0})
			.toArray()
	}

	// 未送信のレコードの件数を取得
	async asyncFetchUnsentRecordCount(logId:number): Promise<number> {
		//console.log('fetch unsent count on logid: ' + logId);
		const key:[number, number]  = [logId, 0];

    return this.records
			.where({log_id:logId, sent:0})
			.count();
	}

	// 未送信のレコードを送信済みに更新
	async asyncUpdateRecordToSent(logId:number, seqList:Array<number>) {
		
		seqList.forEach((seq:number)=>{
			this.records.where({log_id:logId, seq:seq}).modify({sent:1});
		});

	}

	// recordsのレコード1件を登録
	async asyncRegisterRecord(log_id:number, rec:RecordEntity) {
		try {
			await this.transaction('rw', [this.records, this.logs], 
				async () => {
					// レコードの追加
					console.log(rec);
					const updateA = this.records.add(rec);

					// ログの読み取り件数を1追加
					// const updateB = this.logs.update(log_id, {
					// 	record_count: (record_count) => record_count + 1;
					// });
					const updateB = this.logs.where({log_id:log_id}).modify(log => {
						log.record_count += 1;
					});
					
					await Promise.all([updateA, updateB]);
					
					console.log('transaction completed');
				}
			);

		} catch(err) {
			console.error('failed:', err);
			throw err;
		}
	}

}
