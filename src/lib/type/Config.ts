import type { RegisterMode } from "./RegisterMode";

type ConfigParams = {
	allowsDuplicate: boolean;
	allowsSending: boolean;
	sendingIntervalSec: number;
	availableRegisterModes: [keyof typeof RegisterMode],
}

export class Config {
	public allowsDuplicate: boolean;
	public allowsSending: boolean;
	public sendingIntervalSec: number;
	public availableRegisterModes: [keyof typeof RegisterMode];

	constructor({allowsDuplicate, allowsSending, sendingIntervalSec, availableRegisterModes }: ConfigParams) {
		this.allowsDuplicate = allowsDuplicate;
		this.allowsSending = allowsSending;
		this.sendingIntervalSec = sendingIntervalSec;
		this.availableRegisterModes = availableRegisterModes;
	}
	
}
