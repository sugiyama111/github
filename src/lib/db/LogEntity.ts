
import { Entity } from 'dexie';
import type AppDB from '$lib/db/AppDB';

export default class LogEntity extends Entity<AppDB> {
  log_id!: number;
	event_code!: string;
	point_id!  : string;
	point_code!: string;
	point_name!: string;
	log_start_time!: string;	// dayjs
	record_count!: number;
	sent_count!: number;
}
