import type { RegisterMode } from "./RegisterMode";

type ConfigParams = {
	allowsDuplicate: boolean;
	allowsSending: boolean;
	sendingIntervalSec: number;
	//availableRegisterModes: [keyof typeof RegisterMode],
	availableRegisterModes: (typeof RegisterMode)[keyof typeof RegisterMode][],
	memberCount: number | null;
}

export class Config {
	public allowsDuplicate: boolean;
	public allowsSending: boolean;
	public sendingIntervalSec: number;
	//public availableRegisterModes: [keyof typeof RegisterMode];
	public availableRegisterModes: (typeof RegisterMode)[keyof typeof RegisterMode][];
	public memberCount: number | null;

	constructor({allowsDuplicate, allowsSending, sendingIntervalSec, availableRegisterModes, memberCount }: ConfigParams) {
		this.allowsDuplicate = allowsDuplicate;
		this.allowsSending = allowsSending;
		this.sendingIntervalSec = sendingIntervalSec;
		this.availableRegisterModes = availableRegisterModes;
		this.memberCount = memberCount;
	}
	
}
