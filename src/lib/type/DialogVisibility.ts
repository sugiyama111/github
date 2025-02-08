

export class DialogVisibility {
	public configLogin: boolean = false;
	public eventLoad: boolean = false;
	public pointSelect: boolean = false;
	public memberLoad: boolean = false;
	public memberSelect: boolean = false;
	public registerConfirm: boolean = false;
	public trialModeConfirm: boolean = false;
	public cameraSelect: boolean = false;

	constructor() {};

	closeAll = () => {
		this.configLogin = false;
		this.eventLoad = false;
		this.pointSelect = false;
		this.memberLoad = false;
		this.memberSelect = false;
		this.registerConfirm = false;
		this.trialModeConfirm = false;
		this.cameraSelect = false;
	}
}
