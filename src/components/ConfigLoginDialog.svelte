<script lang="ts">
  import { QRTToast } from '$lib/QRTToast';
	import { showsConfigDialog, showsConfigLoginDialog } from '../stores';
	import { Button, Input, Modal } from "flowbite-svelte";

	let password='neo5179';//:string;

	const login = () => {
		if (password == 'neo5179') {
			password = '';
			//goto('/config');
			$showsConfigDialog = true;
			$showsConfigLoginDialog = false;
		} else {
			password = '';
			new QRTToast().error('パスワードが違います');
		}
	}

</script>

<Modal title="管理者用パスワード入力" bind:open={$showsConfigLoginDialog} autoclose outsideclose>

	<Input type="password" id="password" bind:value={password} />

	<svelte:fragment slot="footer">
		<Button color="alternative">キャンセル</Button>
		<Button on:click={login}>OK</Button>
  </svelte:fragment>
	
</Modal>
