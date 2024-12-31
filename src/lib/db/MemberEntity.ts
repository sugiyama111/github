
import { Entity } from 'dexie';
import type AppDB from '$lib/db/AppDB';

export default class MemberEntity extends Entity<AppDB> {
  member_code!: string;
  bib_number!: string;
	name!: string;
	division!: string;
	category!: string;
	gender!: string;
	age!: number;
	nation!: string;
	start_time!: string;
}
