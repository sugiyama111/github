<script lang="ts">
	import { goto } from "$app/navigation";
  import { Button, Checkbox, Modal, Range, Toggle } from 'flowbite-svelte';
	import { inputPassword, selectedEvent, selectedPoint, lastRegistered, config, 
		showsEventLoadDialog, showsPointSelectDialog, showsMemberLoadDialog, 
        selectedLogId, isSending, 
        selectedRegisterMode } from "../../lib/stores";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
	import { onMount, onDestroy, getContext } from "svelte";
	import { dayjs } from '$lib/type/Dayjs';
	import EventLoadDialog from "$lib/components/EventLoadDialog.svelte";
	import { Toast } from "$lib/Toast";
	import MemberLoadDialog from "$lib/components/MemberLoadDialog.svelte";
	import axios from "axios";
	import { Member } from "$lib/api/Member";
	import { db } from "$lib/db/db";
	import Icon from "@iconify/svelte";
    import { derived } from "svelte/store";

	const loggedIn = $inputPassword == 'neo5179';
	let showsConfigClearConfirm = $state(false);
	let showsMembersClearConfirm = $state(false);
	
	onMount(()=>{
		if (!loggedIn) goto('/');		// ログインしていない場合はメイン画面に戻す
	});

	onDestroy(()=>{
		$inputPassword = null;		// 一旦別画面に遷移するとログイン状態を解除
	});

	const disablesSending = derived(config, $config=>!$config.allowsSending);

	// モードのチェック切り替え
	const toggleModeCheck = (e:Event & { target: HTMLInputElement }, changedMode:RegisterMode) => {
		const index = $config.availableRegisterModes.findIndex(m => m.code == changedMode.code);
		if (index === -1) {
			// 新しいモードを追加
			//$config.availableRegisterModes = [...$config.availableRegisterModes, changedMode];　← ×：後からチェックしたものが後に来る

			// CHECK->RETIRE->SKIPの順で優先的に選択させるため、その並び順で$config.avaiableRegisterModeを指定する。
			const modes:Array<RegisterMode> = [];
			[RegisterMode.CHECK, RegisterMode.RETIRE, RegisterMode.SKIP].forEach((orderedMode)=>{
				if (changedMode.code == orderedMode.code
				 || $config.availableRegisterModes.findIndex(availableMode => availableMode.code == orderedMode.code) !== -1) {
					modes.push(orderedMode);
				}
			});
			$config.availableRegisterModes = modes;

		} else {
			// モードを削除

			// ただし、結果的に0件になる場合は、チェック変更を拒否する
			if ($config.availableRegisterModes.length <= 1) {
				e.target.checked = true;
				return;
			}

			// チェックしたものを外す
			$config.availableRegisterModes = $config.availableRegisterModes.filter(m => m.code !== changedMode.code);
		}
	}

	const restartSendingTicker:Function = getContext('restartSendingTicker');
	const stopSendingTicker:Function = getContext('stopSendingTicker');

	// イベントのクリア
	const asyncClearConfig = async () => {

		// 送信処理中止
		stopSendingTicker();
		
		// storeのクリア
		$selectedEvent = null;
		$selectedPoint = null;
		$selectedLogId = null;
		$lastRegistered = {check:null, retire:null, skip:null};
		$selectedRegisterMode = new RegisterModeState(RegisterMode.CHECK);

		// DBのクリア
		await Promise.all([
			db.members.clear(),
			db.records.clear(),
			db.logs.clear(),
		]);
		$config.memberCount = null;


		Toast.Success('イベントを初期化しました');
	}
	// 名簿のクリア
	const asyncClearMembers = async () => {
		db.members.clear();
		$config.memberCount = null;
		Toast.Success('名簿を初期化しました');

		// 送信処理中止
		stopSendingTicker();
	}

	// 名簿の取り込み
	const asyncLoadMember = async () => {
		if (!$selectedEvent) return;

		$showsMemberLoadDialog = true;

		// @TODO PWA化時にenvの内容がundefinedになってしまう
		const serverName:string = 'https://stg56.qr-timing.jp';//import.meta.env.VITE_API_BASE_URL;
		
		try {
			const apiData = await axios.get(`${serverName}/api/v1/members/${$selectedEvent.eventCode}`);
			const apiMemberList = await apiData.data.members;
			console.log(apiMemberList);

			const memberList:Member[] = apiMemberList.map((member:any)=>
				new Member({
					memberCode: member.chip_code,
					bibNumber: member.bib_number,
					name: member.name,
					divisionName: member.division,
					categoryName: member.category,
					gender: member.gender,
					age: member.age,
					nation: member.nation,
					startTime: member.start_time,
          // ↓ APIから返ってこない
          // club: member.club,
          // yomi: member.yomi,
          // yobi1: member.yobi1,
          // yobi2: member.yobi2,
          // yobi3: member.yobi3,
				})
			);
      
			
console.log('MEMBERLIST')
console.log(memberList)
			
			// DBのmembersを一度空にする
      await db.members.clear();
			const dbMemberList = memberList.map((member:Member)=>member.toEntity());
			db.members.bulkAdd(dbMemberList);

			$config.memberCount = memberList.length;
      Toast.Success(`${$config.memberCount}件の名簿を取得しました`);

//       // 表示上のmembers件数を更新
//       this.applyCountMemberAsync();
		} catch (e) {
			Toast.Error(`取得できませんでした`);
		}

		$showsMemberLoadDialog = false;
	}

	const handleAllowsSendingClick = () => {
		if (!$config.allowsSending) {		// ← 更新前の値を指定する
			restartSendingTicker();
		} else {
			stopSendingTicker();
		}
	}

	const handleChangeSendingInterval = () => {
		if ($config.allowsSending) {
			restartSendingTicker();
		}
	}

</script>

<style lang="postcss">
	.title {
		@apply w-24;
		@apply ml-2;
		@apply text-gray-500 font-medium;
	}
	.body {
		@apply flex;
		@apply grow;
		@apply text-blue-600 font-medium;
	}
	.row {
		@apply mt-0 mb-0 pt-1 pb-1 pr-1;
		@apply flex items-center;
		@apply h-12 leading-normal;
		border-bottom: 1px solid gray;
	}

	.select-mode article {
		@apply mr-2;
	}
	.check-label {
		@apply text-blue-600 font-medium;
	}
	.alert {
		@apply text-red-500;
	}
</style>

{#if !loggedIn}
	not logged in.
{:else}


<EventLoadDialog />
<MemberLoadDialog />

<Modal size="xs" bind:open={showsConfigClearConfirm}>
	<section>
		すべての設定を初期化して良いですか？
	</section>
	<svelte:fragment slot="footer">
		<Button on:click={()=>showsConfigClearConfirm=false} color="alternative">キャンセル</Button>
		<Button on:click={()=>{asyncClearConfig();showsConfigClearConfirm=false;}} class="text-primary">OK</Button>
	</svelte:fragment>
</Modal>

<Modal size="xs" bind:open={showsMembersClearConfirm}>
	<section>
		名簿を初期化して良いですか？
	</section>
	<svelte:fragment slot="footer">
		<Button on:click={()=>showsMembersClearConfirm=false} color="alternative">キャンセル</Button>
		<Button on:click={()=>{asyncClearMembers();showsMembersClearConfirm=false;}} class="text-primary">OK</Button>
	</svelte:fragment>
</Modal>


{#if $selectedEvent}
<div class="row">
	<Button class="bg-primary" on:click={()=>showsConfigClearConfirm=true}>
		<Icon icon="mdi:settings-off" class="size-5" />
		設定初期化
	</Button>
	<Button class="bg-primary" on:click={()=>showsMembersClearConfirm=true}>
		<Icon icon="mdi:account-multiple-remove" class="size-5" /> 名簿初期化
	</Button>
</div>
{:else}
<div class="row">
	<Button class="bg-primary" on:click={()=>{$showsEventLoadDialog = true;}}>イベントの取得</Button>
</div>
{/if}

{#if !$selectedEvent}
<div class="row">
	<section class="title">イベント情報</section>
	<section class="body grow">
		まだ読み込まれていません
	</section>
</div>

{:else}
<div class="row">
	<section class="title">イベント名</section>
	<section class="body grow">
		{ $selectedEvent.eventTitle }
	</section>
</div>

<div class="row">
	<section class="title">更新日時</section>
	<section class="body grow">
		{ $selectedEvent ? dayjs($selectedEvent.eventUpdatedAt).format('YYYY/MM/DD HH:mm:ss') : '' }
	</section>
</div>

<div class="row">
	<section class="title">計測地点</section>
	<section class="body">
		{ $selectedPoint?.pointTitle }
	</section>
	<Button class="bg-primary" on:click={()=>$showsPointSelectDialog = true}>地点</Button>
</div>

<div class="row">
	<section class="title">重複読込</section>
	<section class="body {$config.allowsDuplicate ? '' : 'alert'}">
		{ $config.allowsDuplicate ? '重複可' : '重複不可' }
	</section>
	<Toggle color="green" bind:checked={$config.allowsDuplicate} />
</div>

<div class="row">
	<section class="title">データ送信</section>
	<section class="body {$config.allowsSending ? '' : 'alert'}">
		{ $config.allowsSending ? '送信可' : '送信不可' }
	</section>
	<Toggle color="green" disabled={$isSending}
		bind:checked={$config.allowsSending} onclick={()=>handleAllowsSendingClick()} />
</div>

<div class="row">
	<section class="title">送信間隔</section>
	<section class="body">
	{#if $config.allowsSending}
		{ $config.sendingIntervalSec == 0 ? 'すぐ送信' : `${$config.sendingIntervalSec}秒間隔` }
	{/if}
	</section>
	<section class="flex items-center" style="line-height:2em;">
		<Range size="sm" min="0" max="60" step="15" disabled={$disablesSending || $isSending}
			bind:value={$config.sendingIntervalSec} onchange={handleChangeSendingInterval} />
	</section>
</div>

<div class="row">
	<section class="title">モード</section>
	<section class="body select-mode">
		<article>
			<Checkbox checked={$config.availableRegisterModes.some(mode => mode.code === RegisterMode.CHECK.code)}
				onchange={(e)=>toggleModeCheck(e, RegisterMode.CHECK)}>
				<span class="check-label">{ RegisterMode.CHECK.text }</span>
			</Checkbox>
		</article>
		<article>
			<Checkbox checked={$config.availableRegisterModes.some(mode => mode.code === RegisterMode.RETIRE.code)}
				onchange={(e)=>toggleModeCheck(e, RegisterMode.RETIRE)}                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                          >
				<span class="check-label">{ RegisterMode.RETIRE.text }</span>
			</Checkbox>
		</article>
		<article>
			<Checkbox checked={$config.availableRegisterModes.some(mode => mode.code === RegisterMode.SKIP.code)}
				onchange={(e)=>toggleModeCheck(e, RegisterMode.SKIP)}>
				<span class="check-label">{ RegisterMode.SKIP.text }</span>
			</Checkbox>
		</article>
	</section>
</div>


<div class="row">
	<section class="title">名簿取込</section>
	<section class="body {$config.memberCount === null ? 'alert' : ''}">
		{ $config.memberCount === null ? '未取込' : `${$config.memberCount}件 取得済`}
	</section>
	<Button class="bg-primary" on:click={asyncLoadMember}>取込</Button>
</div>

{/if}

<div class="row">
	<section class="title">Install ID</section>
	<section class="body grow">
		123456789
	</section>
</div>
{/if}

