import { toast } from 'svelte-sonner';

export const QRTToastType = {
	SUCCESS: 'success',
	ERROR: 'error',
} as const;
export type QRTToastType = (typeof QRTToastType)[keyof typeof QRTToastType];


export class QRTToast {
	
	success = (message:string) => {
		this.showToast(message, QRTToastType.SUCCESS);
	}

	error = (message:string) => {
		this.showToast(message, QRTToastType.ERROR);
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
		}

	}

}
