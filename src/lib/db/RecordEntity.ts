

export default class RecordEntity {
	log_id!: number;
	seq!: number;
	member_code!: string;
	member_name!: string;
	race_num!: string;
	time!: string;		// dayjs
	method!: string;
	mode!: string;
	sent!: number;		// 0:false, 1:true

	constructor(obj:{log_id:number, seq:number, member_code:string, member_name:string
		race_num:string, time:string, method:string, mode:string, sent:number}) {
			
		this.log_id = obj.log_id;
		this.seq = obj.seq;
		this.member_code = obj.member_code;
		this.member_name = obj.member_name;
		this.race_num = obj.race_num;
		this.time = obj.time;
		this.method = obj.method;
		this.mode = obj.mode;
		this.sent = obj.sent;
	}
}
