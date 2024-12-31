//import { Dayjs } from 'dayjs';
import { TimingPoint } from '$lib/api/TimingPoint';

type TimingEventParams = {
	eventCode: string;
	eventDate: string;	//Dayjs;
	eventTitle: string;
	eventUpdatedAt: string;	//Dayjs;
	points: TimingPoint[];
}

export class TimingEvent {
	public eventCode: string;
	public eventDate: string;	//Dayjs;
	public eventTitle: string;
	public eventUpdatedAt: string;	//Dayjs;
	public points: TimingPoint[];

	constructor({eventCode, eventDate, eventTitle, eventUpdatedAt, points }: TimingEventParams) {
		this.eventCode = eventCode;
		this.eventDate = eventDate;
		this.eventTitle = eventTitle;
		this.eventUpdatedAt = eventUpdatedAt;
		this.points = points;
	}
	
}
