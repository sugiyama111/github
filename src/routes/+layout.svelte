<script lang="ts">
	import '../app.css';
	import Icon from "@iconify/svelte";
	import { Button } from 'flowbite-svelte';
	import { selectedEvent, selectedPoint } from '$lib/stores';
	import DrawerMenu from '$lib/components/DrawerMenu.svelte';
	import ConfigLoginDialog from '$lib/components/ConfigLoginDialog.svelte';

	import { Toaster } from 'svelte-sonner';
	import { page } from '$app/stores';
	import PointSelectDialog from '$lib/components/PointSelectDialog.svelte';

	let { children } = $props();

console.log('page');
console.log($page.url.href);

	// PWAのためのservice-worker登録
	if ('serviceWorker' in navigator) {
		window.addEventListener('load', function() {
			this.navigator.serviceWorker.register('/service-worker.js', { scope: './' }).then(function (registration) {
				console.log('ServiceWorker registration successfull with scope: ', registration.scope);
			}, function (err) {
				console.log('ServiceWorker registration failed: ', err);
			});
		});
	}


	// drawerの設定
	let drawerHidden = $state(true);

</script>

<style lang="postcss">
</style>

<!-- PWAのためのmanifest.json読込 -->
<svelte:head>
	<link rel="manifest" href="/manifest.json" />
</svelte:head>


<!-- 通常は非表示の全体で共通のコンポーネント -->
<Toaster richColors closeButton />
<DrawerMenu bind:hidden={drawerHidden}></DrawerMenu>
<PointSelectDialog />
<ConfigLoginDialog />


<div class="h-screen flex flex-col ">
<!-- 共通ヘッダ部分 -->
<header class="flex bg-primary h-12">

	<Button on:click={()=>drawerHidden = false} class="p-2">
		<Icon icon="material-symbols:menu-rounded" class="w-8 h-6" />
	</Button>

	<div class="grow">
		<div id="point_name" class="text-primary-text text-xl whitespace-nowrap" style="text-align:left;">{ $selectedPoint?.pointTitle }</div>
		<div id="event_name" class="text-primary-text text-xs whitespace-nowrap" style="text-align:left;">{ $selectedEvent?.eventTitle }</div>
	</div>

<!-- 	
	<Button class="p-2">
		<Icon icon="mdi:dots-vertical" class="w-8 h-6" />
	</Button>
	 -->
</header>

	<!-- メインコンテンツ -->
	{@render children()}

</div>