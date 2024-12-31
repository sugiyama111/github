<script lang="ts">
  import { Button, Modal } from 'flowbite-svelte';
	import { showsRegisterConfirmDialog } from '$lib/stores';
	import type MemberEntity from '$lib/db/MemberEntity';

	// const { memberCollection, onMemberSelected } = $props();
	const { member, onRegisterConfirmed } = $props();
	// let selectedMemberCode:string = $state('');

	const confirmRegistering = (member:MemberEntity) => {
		//$selectedPoint = member;
		onRegisterConfirmed(member);
	}
</script>

<Modal title="以下で登録してよいですか" size="xs" bind:open={$showsRegisterConfirmDialog}>
	<div class="w-100 divide-y divide-gray-200 dark:divide-gray-600">

		<article class="flex flex-col">
			<div class="text-sm">
				No. { member.bib_number }：
				{member.division}
			</div>
			<div class="text-lg">
				{ member.name }
			</div>
		</article>

	</div>
	<svelte:fragment slot="footer">
		<Button on:click={()=>$showsRegisterConfirmDialog=false} color="alternative">キャンセル</Button>
		<Button on:click={()=>{confirmRegistering(member); $showsRegisterConfirmDialog=false;}} class="text-primary">OK</Button>
	</svelte:fragment>

</Modal>
