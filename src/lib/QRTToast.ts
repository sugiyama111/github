import { toast } from 'svelte-sonner';

export const QRTToastType = {
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
} as const;
export type QRTToastType = (typeof QRTToastType)[keyof typeof QRTToastType];


export class QRTToast {
	
	success = (message:string) => {
		this.showToast(message, QRTToastType.SUCCESS);
	}

	error = (message:string) => {
		this.showToast(message, QRTToastType.ERROR);
	}

	warning = (message:string) => {
		this.showToast(message, QRTToastType.WARNING);
	}

	info = (message:string) => {
		this.showToast(message, QRTToastType.INFO);
	}

	showToast = (message:string, type:QRTToastType) => {

		switch (type) {
			case QRTToastType.SUCCESS:
				toast.success(message, {
					duration: 5000,
				});
				break;
			case QRTToastType.ERROR:
				toast.error(message, {
					duration: 7000,
				});
				break;
			case QRTToastType.WARNING:
				toast.warning(message, {
					duration: 5000,
				});
				break;
			case QRTToastType.INFO:
				toast.info(message, {
					duration: 4000,
				});
				break;
		}

	}

}
