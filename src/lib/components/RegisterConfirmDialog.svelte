<script lang="ts">
  import { Button, Modal } from 'flowbite-svelte';
	import { showsRegisterConfirmDialog } from '$lib/stores';
	import type MemberEntity from '$lib/db/MemberEntity';
	import { selectedRegisterMode } from '$lib/stores'

	// const { memberCollection, onMemberSelected } = $props();
	const { member, message, onRegisterConfirmed } = $props();
	// let selectedMemberCode:string = $state('');

	const confirmRegistering = (member:MemberEntity) => {
		//$selectedPoint = member;
		onRegisterConfirmed(member);
	}
</script>

<Modal title={ $selectedRegisterMode.getText() } size="xs"
	classHeader={`bg-${$selectedRegisterMode.getCode()}`}
	classFooter={`bg-${$selectedRegisterMode.getCode()}`}
	class={`bg-${$selectedRegisterMode.getCode()} text-gray-800 font-bold`}
	bind:open={$showsRegisterConfirmDialog}>

	<section class="notice">
		{ message }
	</section>

	<div class="w-100 divide-y divide-gray-200 dark:divide-gray-600 pl-4">

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
		<Button on:click={()=>{confirmRegistering(member); $showsRegisterConfirmDialog=false;}} class="text-primary bg-light-background dark:bg-dark-background">OK</Button>
	</svelte:fragment>

</Modal>
