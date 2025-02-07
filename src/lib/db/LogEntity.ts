
export default class LogEntity {
  log_id!: number;
	event_code!: string;
	point_id!  : string;
	point_code!: string;
	point_name!: string;
	log_start_time!: string;	// dayjs
	record_count!: number;
	sent_count!: number;
	is_trial!: number;		// 0:no, 1:yes
	
	constructor(obj:{log_id:number, event_code:string, point_id:string, point_code:string,
		point_name:string, log_start_time:string, record_count:number, sent_count:number, is_trial:number}) {
			
		this.log_id = obj.log_id;
		this.event_code = obj.event_code;
		this.point_id = obj.point_id;
		this.point_code = obj.point_code;
		this.point_name = obj.point_name;
		this.log_start_time = obj.log_start_time;
		this.record_count = obj.record_count;
		this.sent_count = obj.sent_count;
		this.is_trial = obj.is_trial;
	}
}
