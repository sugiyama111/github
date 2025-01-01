

export default class RecordEntity {
	seq!: number;
	log_id!: number;
	member_code!: string;
	member_name!: string;
	race_num!: string;
	time!: string;		// dayjs
	method!: string;
	mode!: string;
	sent!: boolean;

	constructor(obj:{seq:number, log_id:number, member_code:string, member_name:string
		race_num:string, time:string, method:string, mode:string, sent:boolean}) {
			
		this.seq = obj.seq;
		this.log_id = obj.log_id;
		this.member_code = obj.member_code;
		this.member_name = obj.member_name;
		this.race_num = obj.race_num;
		this.time = obj.time;
		this.method = obj.method;
		this.mode = obj.mode;
		this.sent = obj.sent;
	}
}
