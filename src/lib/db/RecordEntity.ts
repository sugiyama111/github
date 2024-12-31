
import { Entity } from 'dexie';
import type AppDB from '$lib/db/AppDB';

export default class RecordEntity extends Entity<AppDB> {
	seq!: number;
	log_id!: number;
	member_code!: string;
	member_name!: string;
	race_num!: string;
	time!: string;		// dayjs
	method!: string;
	mode!: string;
	sent!: boolean;
}
