import { toast } from '@zerodevx/svelte-toast';
import ToastBase from '$lib/components/ToastBase.svelte';

type ActiveToastKey = {
	trial_mode:number|null;
};

export class ToastExtended {
	
	static ActiveToasts:ActiveToastKey = {trial_mode:null};

	static TrialMode = (message:string) => {
		
    // すでに表示中のトーストを消す
    if (ToastExtended.ActiveToasts.trial_mode) {
      toast.pop(ToastExtended.ActiveToasts.trial_mode);
    }

		const id = toast.push({
			component: {
				// @ts-ignore: 型エラーを無視
				src: ToastBase,
				props: {
					icon: 'material-symbols:warning-rounded',
					message: message,
					iconColor: '#222',
				},
			},
			duration: 7000,
			theme: {
				'--toastBorderRadius': '5px',
				'--toastMinHeight': '1rem',
				'--toastWidth': 'auto',
				'--toastBackground': '#FFF833',
				'--toastColor': '#222',
				'--toastBarBackground': 'gray',
				'--toastBarHeight': '2px',
			}
		});

		ToastExtended.ActiveToasts.trial_mode = id;
	}

	static Close = () => {
		toast.pop(ToastExtended.ActiveToasts.trial_mode);
	}
}
