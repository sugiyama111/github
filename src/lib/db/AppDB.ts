import Dexie, { type EntityTable } from 'dexie';
import MemberEntity from './MemberEntity';
import LogEntity from './LogEntity';
import RecordEntity from './RecordEntity';
import type { TimingPoint } from '$lib/api/TimingPoint';
import type { TimingEvent } from '$lib/api/TimingEvent';
import { dayjs } from '$lib/type/Dayjs';

export default class AppDB extends Dexie {
	
	public members!: EntityTable<MemberEntity, 'member_code'>;
	public logs!: EntityTable<LogEntity, 'log_id'>;
	public records!: EntityTable<RecordEntity, 'seq'>;

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
    });
		
		this.members.mapToClass(MemberEntity);

  }

	
	async asyncFetchByNumber(number:string) {
		
    return this.members
      .where('bib_number')
      .equals(number)
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

}