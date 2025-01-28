<script lang="ts">
  import { goto } from '$app/navigation';
	import { showsConfigLoginDialog, showsPointSelectDialog } from '$lib/stores';
	import Icon from '@iconify/svelte';
	import { Drawer, CloseButton, Sidebar, SidebarWrapper, SidebarGroup, SidebarItem, SidebarBrand, Button, Modal } from 'flowbite-svelte';
	import { sineIn } from 'svelte/easing';

	export let hidden = true;

	let spanClass = 'flex-1 ms-3 whitespace-nowrap';
	let transitionParams = {
		x: -220,
		duration: 200,
		easing: sineIn
	};

	const goBackToMain = () => {
		hidden = true;
		//history.back;
		goto('/');
	}
</script>

<style lang="postcss">
</style>

<Drawer class="" transitionType="fly" {transitionParams} bind:hidden={hidden} id="sidebar2">
  <div class="flex items-center">
    <h5 id="drawer-navigation-label-3" class="font-semibold text-3xl dark:text-dark-text">QR-Timing3</h5>
    <CloseButton on:click={() => hidden=true} class="mb-4 dark:text-dark-text" />
  </div>
  <Sidebar>
    <SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded">
      <SidebarGroup>
				
				<SidebarItem label="計測画面" {spanClass}
					on:click={goBackToMain}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:motion-play-outline" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>

				<SidebarItem label="参照画面" {spanClass}
					on:click={(e)=>{console.log('ref'); hidden=true; e.preventDefault(); goto('/ref');}}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:data-table" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>

				<hr style="margin-top:20px; margin-bottom:20px;" />
				
				<SidebarItem label="地点選択" {spanClass}
					on:click={()=>{$showsPointSelectDialog = true; hidden=true;}}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:location-on" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>
				
				<SidebarItem label="管理者設定" {spanClass}
					on:click={()=>{$showsConfigLoginDialog = true; hidden=true;}}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:settings" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>
				

      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>

