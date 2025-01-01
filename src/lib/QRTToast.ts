import { toast as svelteToast } from 'svelte-sonner';

const QRTToastType = {
	SUCCESS: 'success',
	ERROR: 'error',
	WARNING: 'warning',
	INFO: 'info',
} as const;
type QRTToastType = (typeof QRTToastType)[keyof typeof QRTToastType];

class QRTToast {
	
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
				svelteToast.success(message, {
					duration: 5000,
				});
				break;
			case QRTToastType.ERROR:
				svelteToast.error(message, {
					duration: 7000,
				});
				break;
			case QRTToastType.WARNING:
				svelteToast.warning(message, {
					duration: 5000,
				});
				break;
			case QRTToastType.INFO:
				svelteToast.info(message, {
					duration: 4000,
				});
				break;
		}

	}

}

export const toast = new QRTToast();
