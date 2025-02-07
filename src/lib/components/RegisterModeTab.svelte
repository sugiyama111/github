<script lang="ts">
import { TabItem } from "flowbite-svelte";
import Icon from "@iconify/svelte";
import { selectedRegisterMode, lastRegistered, lastRegisteredTime} from "$lib/stores";
import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";


const props = $props();
const componentRegisterMode:RegisterMode = props.registerMode;		// このコンポーネントの登録モード

</script>

<TabItem open={$selectedRegisterMode.getCode() == componentRegisterMode.code}
	class="flex-1 rounded-t-lg"
	defaultClass={`w-full tab-class-${componentRegisterMode.code}`}
	onclick={()=>{$selectedRegisterMode=new RegisterModeState(componentRegisterMode);}}>
	<style>
		/* 直書きは有効にならない
		hover:!bg-${componentRegisterMode.code} !bg-${componentRegisterMode.code} */
		.tab-class-check { @apply bg-check; }
		.tab-class-check:hover { @apply bg-check; }
		.tab-class-retire { @apply bg-retire; }
		.tab-class-retire:hover { @apply bg-retire; }
		.tab-class-skip { @apply bg-skip; }
		.tab-class-skip:hover { @apply bg-skip; }
	</style>
	<section slot="title" class="flex gap-1 -m-3 p-3">
		<Icon icon={ componentRegisterMode.icon } class="size-5 m-0 p-0" />
		<div class="whitespace-nowrap">{ componentRegisterMode.text }</div>
	</section>

	<section class={`pt-4 bg-${componentRegisterMode.code}`}>
		<article class="last-data leading-2">
			<div class={`mode-chip bg-${componentRegisterMode.code}`} style="float:right;">
				<Icon icon={ componentRegisterMode.icon } />{ componentRegisterMode.text }
			</div>
			<div class="h-5">No. { $lastRegistered[componentRegisterMode.code]?.race_num}</div>
			<div class="h-5">{ $lastRegistered[componentRegisterMode.code]?.member_name }</div>
			<div class="h-5">
				{#if $lastRegisteredTime[componentRegisterMode.code]}
				<span class="text-sm">{ $lastRegisteredTime[componentRegisterMode.code]?.format('YYYY') }/</span>{ $lastRegisteredTime[componentRegisterMode.code]?.format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime[componentRegisterMode.code]?.format('ss') }</span>
				{/if}
			</div>
		</article>
	</section>
</TabItem>

<style lang="postcss">
	
	.mode-chip {
		@apply flex;
		@apply rounded-xl;
		@apply pl-2 pr-3 pt-1 pb-1;
		width: fit-content;
		line-height: 1.1rem;
		box-shadow: 1px 1px gray;
	}
	
	article.last-data {
		@apply p-2 ml-auto mr-auto mb-4;
		@apply w-3/4 max-w-96;
		@apply rounded-md;
		@apply bg-slate-300 shadow-md;
		@apply text-black text-left;
	}

</style>