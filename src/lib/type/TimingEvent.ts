import { Dayjs } from 'dayjs';
import type { TimingPoint } from './TimingPoint';

type TimingEventParams = {
	eventCode: string;
	eventDate: Dayjs;
	eventTitle: string;
	eventUpdatedAt: Dayjs;
	points: TimingPoint[];
}

export class TimingEvent {
	public eventCode: string;
	public eventDate: Dayjs;
	public eventTitle: string;
	public eventUpdatedAt: Dayjs;
	public points: TimingPoint[];

	constructor({eventCode, eventDate, eventTitle, eventUpdatedAt, points }: TimingEventParams) {
		this.eventCode = eventCode;
		this.eventDate = eventDate;
		this.eventTitle = eventTitle;
		this.eventUpdatedAt = eventUpdatedAt;
		this.points = points;
	}
	
}
