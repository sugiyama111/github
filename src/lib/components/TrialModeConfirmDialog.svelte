<script lang="ts">
  import { Button, Modal } from 'flowbite-svelte';
	import { showsTrialModeConfirmDialog, isTrial, selectedPoint } from '$lib/stores';
	import { getContext } from 'svelte';
	import { TrialModeToast } from '$lib/TrialModeToast';

	
	const asyncSwitchLog:Function = getContext('asyncSwitchLog');
	const startTrialAlertRoutine:Function = getContext('startTrialAlertRoutine');
	const stopTrialAlertRoutine:Function = getContext('stopTrialAlertRoutine');

	const switchTrialMode = async () => {
		// $isTrialが切り替え前なのか後なのか分かりづらいので、一度変数に入れる
		const switchesToTrial = !$isTrial;

		switchesToTrial ? startTrialAlertRoutine() : stopTrialAlertRoutine();

		await asyncSwitchLog($selectedPoint, switchesToTrial);

		// お試しモードのトーストを一度表示
		if (switchesToTrial) {
			setTimeout(()=>{TrialModeToast.TrialMode('お試しモード中. 実際には送信されません.');}, 1000);
		}

		// storeの切り替え
		$isTrial = !$isTrial;
	}
</script>

<Modal title="お試しモード" size="xs"
	classHeader="bg-trial"
	classFooter="bg-trial"
	class="bg-trial text-gray-800 font-bold"
	bind:open={$showsTrialModeConfirmDialog}>

	<div class="w-100 divide-y divide-gray-200 dark:divide-gray-600 pl-4">

		<article class="flex flex-col">
			お試しモードに切り替えますか？<br>
			(サーバーへの送信操作も行えますが、実際には送られません)
		</article>

	</div>
	<svelte:fragment slot="footer">
		<Button on:click={()=>$showsTrialModeConfirmDialog=false} color="alternative">キャンセル</Button>
		<Button on:click={()=>{switchTrialMode(); $showsTrialModeConfirmDialog=false;}} class="text-primary bg-light-background dark:bg-dark-background">OK</Button>
	</svelte:fragment>

</Modal>
