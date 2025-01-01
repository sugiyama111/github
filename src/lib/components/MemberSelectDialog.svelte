<script lang="ts">
  import { Modal, Radio } from 'flowbite-svelte';
	import { showsMemberSelectDialog } from '$lib/stores';
	import type MemberEntity from '$lib/db/MemberEntity';
	import { selectedRegisterMode } from '$lib/stores'

	const { message, memberCollection, onMemberSelected } = $props();
	let selectedMemberCode:string = $state('');

	const selectMember = (member:MemberEntity) => {
		onMemberSelected(member);
	}
</script>

<Modal title={ $selectedRegisterMode.getText() } size="xs" 
	classHeader={`bg-${$selectedRegisterMode.getCode()}`}
	class={`bg-${$selectedRegisterMode.getCode()} text-gray-800 font-bold`}
	bind:open={$showsMemberSelectDialog}>
	
	<section class="notice">
		{ message }
	</section>

	<ul class="w-100 divide-y divide-gray-200 dark:divide-gray-600">
{#each memberCollection as member}
	<li>
		<Radio class="pt-3 pb-3 pl-5 hover:bg-gray-300"
			bind:group={ selectedMemberCode } value={ member.member_code }
			on:click={()=>{selectMember(member); $showsMemberSelectDialog = false;}}>
			<article class="flex flex-col">
				<div class="text-sm">
					No. { member.bib_number }：
					{member.division}
				</div>
				<div class="text-lg">
					{ member.name }
				</div>
			</article>
		</Radio>
	</li>
{/each}
	</ul>
</Modal>
