
export default class LogEntity {
  log_id!: number;
	event_code!: string;
	point_id!  : string;
	point_code!: string;
	point_name!: string;
	log_start_time!: string;	// dayjs
	record_count!: number;
	sent_count!: number;
}
