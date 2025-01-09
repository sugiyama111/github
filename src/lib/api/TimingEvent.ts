//import { Dayjs } from 'dayjs';
import { TimingPoint } from '$lib/api/TimingPoint';

type TimingEventParams = {
	eventId: number;
	eventCode: string;
	eventDate: string;	//Dayjs;
	eventTitle: string;
	eventUpdatedAt: string;	//Dayjs;
	points: TimingPoint[];
}

export class TimingEvent {
	public eventId: number;
	public eventCode: string;
	public eventDate: string;	//Dayjs;
	public eventTitle: string;
	public eventUpdatedAt: string;	//Dayjs;
	public points: TimingPoint[];

	constructor({eventId, eventCode, eventDate, eventTitle, eventUpdatedAt, points }: TimingEventParams) {
		this.eventId = eventId;
		this.eventCode = eventCode;
		this.eventDate = eventDate;
		this.eventTitle = eventTitle;
		this.eventUpdatedAt = eventUpdatedAt;
		this.points = points;
	}
	
}
