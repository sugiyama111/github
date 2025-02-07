import { toast } from '@zerodevx/svelte-toast';
import ToastBase from '$lib/components/ToastBase.svelte';

type ActiveToastKey = {
	success:number|null;
	error:number|null;
	info:number|null;
	caution:number|null;
};

export class Toast {
	
	static ActiveToasts:ActiveToastKey = {success:null, error:null, info:null, caution:null};

	static Success = (message:string) => {
		
    // すでに表示中のトーストを消す
    if (Toast.ActiveToasts.success) {
      toast.pop(Toast.ActiveToasts.success);
    }

		const id = toast.push({
			component: {
				// @ts-ignore: 型エラーを無視
				src: ToastBase,
				props: {
					icon: 'material-symbols:check-circle',
					message: message,
					iconColor: '#090',
				},
			},
			duration: 4000,
			theme: {
				'--toastBorderRadius': '5px',
				'--toastMinHeight': '1rem',
				'--toastWidth': 'auto',
				'--toastBackground': '#F8FFF8',
				'--toastColor': '#090',
				'--toastBarBackground': 'gray',
				'--toastBarHeight': '2px',
			}
		});

		Toast.ActiveToasts.success = id;
	}

	static Error = (message:string) => {
		
    // すでに表示中のトーストを消す
    if (Toast.ActiveToasts.error) {
      toast.pop(Toast.ActiveToasts.error);
    }

		const id = toast.push({
			component: {
				// @ts-ignore: 型エラーを無視
				src: ToastBase,
				props: {
					icon: 'material-symbols:error',
					message: message,
					iconColor: '#F33',
				},
			},
			duration: 7000,
			theme: {
				'--toastBorderRadius': '5px',
				'--toastMinHeight': '1rem',
				'--toastWidth': 'auto',
				'--toastBackground': '#FFF8F8',
				'--toastColor': '#F33',
				'--toastBarBackground': 'gray',
				'--toastBarHeight': '2px',
			}
		});

		Toast.ActiveToasts.error = id;
	}

	static Info = (message:string) => {
    // すでに表示中のトーストを消す
    if (Toast.ActiveToasts.info) {
      toast.pop(Toast.ActiveToasts.info);
    }

		const id = toast.push({
			component: {
				// @ts-ignore: 型エラーを無視
				src: ToastBase,
				props: {
					icon: 'material-symbols:info',
					message: message,
					iconColor: '#33F',
				},
			},
			duration: 4000,
			theme: {
				'--toastBorderRadius': '5px',
				'--toastMinHeight': '1rem',
				'--toastWidth': 'auto',
				'--toastBackground': '#F8F8FF',
				'--toastColor': '#33F',
				'--toastBarBackground': 'gray',
				'--toastBarHeight': '2px',
			}
		});

		Toast.ActiveToasts.info = id;
	}

	static Caution = (message:string) => {
		
    // すでに表示中のトーストを消す
    if (Toast.ActiveToasts.caution) {
      toast.pop(Toast.ActiveToasts.caution);
    }

		const id = toast.push({
			component: {
				// @ts-ignore: 型エラーを無視
				src: ToastBase,
				props: {
					icon: 'material-symbols:warning-rounded',
					message: message,
					iconColor: '#D80',
				},
			},
			duration: 7000,
			theme: {
				'--toastBorderRadius': '5px',
				'--toastMinHeight': '1rem',
				'--toastWidth': 'auto',
				'--toastBackground': '#FFF8F8',
				'--toastColor': '#D80',
				'--toastBarBackground': 'gray',
				'--toastBarHeight': '2px',
			}
		});

		Toast.ActiveToasts.caution = id;
	}

}
