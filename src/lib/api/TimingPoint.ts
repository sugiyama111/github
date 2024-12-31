
type TimingPointParams = {
	pointCode: string;
	pointId: string;
	pointTitle: string;
	sortOrder: number;
}

export class TimingPoint {
	public pointCode: string;
	public pointId: string;
	public pointTitle: string;
	public sortOrder: number;

	constructor({pointCode, pointId, pointTitle, sortOrder }: TimingPointParams) {
		this.pointCode = pointCode;
		this.pointId = pointId;
		this.pointTitle = pointTitle;
		this.sortOrder = sortOrder;
	}

}
