<script lang="ts">
  import { Toast } from '$lib/Toast';
	import { inputPassword, dialogVisibility } from '$lib/stores';
	import { Button, Input, Modal } from "flowbite-svelte";
	import { goto } from '$app/navigation';

	let password='neo5179';//:string;

	const login = () => {
		$inputPassword = password;

		if (password == 'neo5179') {
			password = '';
			goto('/config');
			//$showsConfigDialog = true;
			//$showsConfigLoginDialog = false;

			
		} else {
			password = '';
			Toast.Error('パスワードが違います');
		}
	}

</script>

<Modal title="管理者用パスワード入力" size="xs" placement="center" bind:open={$dialogVisibility.configLogin} autoclose outsideclose>

	<Input type="password" id="password" bind:value={password} />

	<svelte:fragment slot="footer">
		<Button color="alternative">キャンセル</Button>
		<Button on:click={login} class="text-primary dark:text-dark-text">OK</Button>
  </svelte:fragment>
	
</Modal>
