<script lang="ts">
  import { Modal, Radio } from 'flowbite-svelte';
	import { showsMemberSelectDialog } from '$lib/stores';
	import type MemberEntity from '$lib/db/MemberEntity';

	const { memberCollection, onMemberSelected } = $props();
	let selectedMemberCode:string = $state('');

	const selectMember = (member:MemberEntity) => {
		//$selectedPoint = member;
		onMemberSelected(member);
	}
</script>

<Modal title="対象を選択してください" size="xs" bind:open={$showsMemberSelectDialog}>
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
