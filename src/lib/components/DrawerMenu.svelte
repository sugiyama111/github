<script lang="ts">
	import { showsConfigLoginDialog, showsPointSelectDialog, isTrial, showsTrialModeConfirmDialog } from '$lib/stores';
	import Icon from '@iconify/svelte';
	import { Drawer, CloseButton, Sidebar, SidebarWrapper, SidebarGroup, SidebarItem, SidebarBrand, Button, Modal } from 'flowbite-svelte';
    import { getContext } from 'svelte';
	import { sineIn } from 'svelte/easing';

	export let hidden = true;

	let spanClass = 'flex-1 ms-3 whitespace-nowrap';
	let transitionParams = {
		x: -220,
		duration: 200,
		easing: sineIn
	};

	const stopTrialAlertRoutine:Function = getContext('stopTrialAlertRoutine');
	
	const handleTrialModeSideMenuClick = () => {
		hidden = true;

		console.log($isTrial);
		if (!$isTrial) {
			$showsTrialModeConfirmDialog = true;
		} else {
			stopTrialAlertRoutine();
			$showsTrialModeConfirmDialog = false;
			$isTrial = false;
		}
	}
</script>

<style lang="postcss">
</style>

<Drawer  class={$isTrial ? `bg-trial text-[#222]` : ''} transitionType="fly" {transitionParams} bind:hidden={hidden} id="sidebar2">
  <div class="flex items-center">
    <h5 id="drawer-navigation-label-3" class="font-semibold text-3xl dark:text-dark-text">QR-Timing3</h5>
    <CloseButton on:click={() => hidden=true} class="mb-4 dark:text-dark-text" />
  </div>
  <Sidebar>
    <SidebarWrapper divClass="overflow-y-auto py-4 px-3 rounded">
      <SidebarGroup>
				
				<SidebarItem label="計測" {spanClass} onclick={()=>hidden=true} href="/">
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:motion-play-outline" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>

				<SidebarItem label="記録参照" {spanClass} onclick={()=>hidden=true} href="/ref">
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:data-table" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>

				<hr style="margin-top:20px; margin-bottom:20px;" />
				
				<SidebarItem label="地点選択" {spanClass}
					onclick={()=>{$showsPointSelectDialog = true; hidden=true;}}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:location-on" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>
				
				<SidebarItem label={`お試しモード ${$isTrial ? '終了' : '開始'}`} {spanClass}
					onclick={handleTrialModeSideMenuClick}
					class={$isTrial ? `font-bold` : ''}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:multimodal-hand-eye"
							class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>
				
				<SidebarItem label="管理者設定" {spanClass}
					onclick={()=>{$showsConfigLoginDialog = true; hidden=true;}}>
					<svelte:fragment slot="icon">
						<Icon icon="material-symbols:settings" class="w-5 h-5 text-gray-500 transition duration-75 dark:text-gray-400 group-hover:text-gray-900 dark:group-hover:text-white" />
					</svelte:fragment>
				</SidebarItem>
				

      </SidebarGroup>
    </SidebarWrapper>
  </Sidebar>
</Drawer>

