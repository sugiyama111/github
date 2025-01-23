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
      logs: '&log_id, event_code, point_id, point_code, point_name, log_start_time, record_count, sent_count',
			// 初期化したいため、seqはオートインクリメントでない
      records: '&seq, [log_id+sent], member_code, member_name, race_num, time, method, mode',
			tests: '&id',
    });

		this.members.mapToClass(MemberEntity);
		this.logs.mapToClass(LogEntity);
		this.records.mapToClass(RecordEntity);
		this.tests.mapToClass(TestEntity);

  }


	async asyncFetchByNumber(number:string) {

    return this.members
      .where('bib_number')
      .equals(number)
	}

	async asyncFetchByMembercode(code:string) {

    return this.members
      .where('member_code')
      .equals(code);

	}

	async asyncSwitchNextLog(event:TimingEvent, point:TimingPoint):Promise<number> {
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
		});

		return newLogId;
	}

	async asyncFetchNewLogId() {
    const lastLog = await this.logs.orderBy('log_id').last();
		const nextLogId = (typeof lastLog === 'undefined') ? 1 : lastLog.log_id + 1;

		return nextLogId;
	}

	async asyncFetchNewRecordSeq() {
		const lastRecord = await this.records.orderBy('seq').last();
    const nextReq = (typeof lastRecord === 'undefined') ? 1 : lastRecord.seq + 1;

		return nextReq;
	}


	async asyncFetchUnsentRecord(logId:number): Promise<Array<RecordEntity>> {
		const key:[number, number]  = [logId, 0];

    return this.records
			.where({log_id:logId, sent:0})
			.toArray()
	}
	async asyncFetchUnsentCount(logId:number): Promise<number> {
		console.log('fetch unsent count on logid: ' + logId);
		const key:[number, number]  = [logId, 0];

    return this.records
			.where({log_id:logId, sent:0})
			.count();
	}

	async asyncUpdateRecordToSent(seqList:Array<number>) {
		seqList.forEach((seq)=>{
			this.records.update(seq, {sent:1});
		});
	}
}
