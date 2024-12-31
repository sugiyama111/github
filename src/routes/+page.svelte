<script lang="ts">
	import Icon from "@iconify/svelte";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
	import { Tabs, TabItem, Button } from 'flowbite-svelte';
	import Camera from "$lib/components/Camera.svelte";
	import Keypad from "$lib/components/Keypad.svelte";
	import { db } from "$lib/db/db";
	import MemberEntity from "$lib/db/MemberEntity";
	import { QRTToast } from "$lib/QRTToast";
	import { config, selectedLogId, selectedRegisterMode, showsMemberSelectDialog, showsRegisterConfirmDialog } from "$lib/stores";
	import MemberSelectDialog from '$lib/components/MemberSelectDialog.svelte';
	import RegisterConfirmDialog from '$lib/components/RegisterConfirmDialog.svelte';
	import { dayjs, type Dayjs } from '$lib/type/Dayjs';
	
    import { RegisterMethod } from "$lib/type/RegisterMethod";

	let mode:RegisterModeState = $state(new RegisterModeState(RegisterMode.CHECK));
	let inputPanel:'info' | 'camera' | 'keypad' = $state<'info' | 'camera' | 'keypad'>('info');
	let memberCollectionForSelect:MemberEntity[] = $state<MemberEntity[]>([]);
	let memberForConfirm:MemberEntity | null = $state(null);
	let measuringTime:Dayjs | null = null;


	function vib() {
		console.log('vib');
		window.navigator.vibrate([400]); // vibrate for 200ms
		console.log('vib finished');
	}

	// 番号での登録
	const asyncRegisterByNumber = async (inputNumber:string) => {
		const memberList = await (await db.asyncFetchByNumber(inputNumber)).toArray();
		
		measuringTime = dayjs();

		await asyncFilterProcess(memberList, measuringTime, RegisterMethod.KEYPAD);
	}
	
	// 登録プロセス1：メンバー絞り込み
	const asyncFilterProcess = async (memberCollection:MemberEntity[], measuringTime:Dayjs, method:RegisterMethod) => {
console.log('asyncFilterProcess');
console.log(measuringTime);

		// 複数存在する場合は選択ダイアログを表示
		if (memberCollection.length == 0) {
			new QRTToast().warning('名簿にみつかりません');
		} else if (memberCollection.length == 1) {
			// 特定できた場合(→プロセス2へ)
			await asyncConfirmProcess(memberCollection[0], measuringTime, method);
		} else {
			// 複数存在する場合
			memberCollectionForSelect = memberCollection;
			$showsMemberSelectDialog = true;
		}
	}

	// 登録プロセス2：登録是非確認
	const asyncConfirmProcess = async (member:MemberEntity, measuringTime:Dayjs, method:RegisterMethod) => {
		console.log('asyncConfirmProcess');
		console.log(measuringTime);

		if ($selectedRegisterMode.isCheck()) {
			// 確認不要の場合
			await asyncRegisterProcess(member, measuringTime, method);
		} else {
			// 確認必要の場合
			memberForConfirm = member;
			$showsRegisterConfirmDialog = true;
		}
	}

	// 登録プロセス3：登録
	const asyncRegisterProcess = async (member:MemberEntity, measuringTime:Dayjs, method:RegisterMethod) => {
		// 万一、記録対象のログが選ばれていない場合
		if ($selectedLogId === null) {
			new QRTToast().error('ログが選択されていません');
			return;
		}

		const nextSeq = await db.asyncFetchNewRecordSeq();
		console.log(nextSeq);
		console.log(measuringTime);

		// 登録するデータ
		const regRecordObj = {
			seq: nextSeq,
			log_id: $selectedLogId,
			member_code: member.member_code,
			member_name: member.name,
			race_num: member.bib_number,
			time: measuringTime.format('YYYY/MM/DD HH:mm:ss.SSS'),
			method: method.code,
			mode:$selectedRegisterMode.getCode(),
			sent: false,
		};

    // 登録
		try {
			await db.records.add(regRecordObj);

			// 音を鳴らす

			// Toast
			new QRTToast().success('登録しました');

			// モーダルを条件によっては閉じる

		} catch (e) {
			console.error('登録エラー db.records.add');
			console.error(measuringTime);

		}

	}
</script>

<main class={`bg-${$selectedRegisterMode.getCode()} min-h-screen`}>

<MemberSelectDialog memberCollection={memberCollectionForSelect} onMemberSelected={asyncConfirmProcess} />
<RegisterConfirmDialog member={memberForConfirm} onRegisterConfirmed={asyncRegisterProcess} />

<!-- モード切替タブ -->
<Tabs tabStyle="full" contentClass="m-0 p-0" class="bg-gray-500 flex justify-between w-full">

{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.CHECK.code) !== -1}
	<TabItem open={!mode.isRetire() && !mode.isSkip()} class="flex-1"
		onclick={()=>$selectedRegisterMode=new RegisterModeState(RegisterMode.CHECK)}>
		<div slot="title" class="bg-check flex gap-1 -m-4 p-4">
			<Icon icon="material-symbols:check-circle-outline" class="size-5 m-0 p-0" />
			<div class="whitespace-nowrap">チェック</div>
		</div>
		<section class="pt-4 bg-check">
			
			<article id="last-data" class="p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="flex"><Icon icon="material-symbols:check-circle-outline" />チェック</div>
				<div>No. 101</div>
				<div>田中 太郎</div>
				<div><span class="text-sm">2024/</span>7/25 14:47<span class="text-sm">:42</span></div>
			</article>

		</section>
	</TabItem>
{/if}
	
{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.RETIRE.code) !== -1}
  <TabItem open={mode.isRetire()} class="flex-1"
		onclick={()=>$selectedRegisterMode=new RegisterModeState(RegisterMode.RETIRE)}>
    <div slot="title" class="bg-retire flex gap-1 -m-4 p-4">
      <Icon icon="material-symbols:close" class="size-5 p-0" />
			<div class="whitespace-nowrap">リタイア</div>
    </div>

		<section class="pt-4 bg-retire">
			
			<article id="last-data" class="p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="flex"><Icon icon="material-symbols:close" />リタイア</div>
				<div>No. 101</div>
				<div>田中 太郎</div>
				<div><span class="text-sm">2024/</span>7/25 14:47<span class="text-sm">:42</span></div>
			</article>

		</section>
  </TabItem>
{/if}

{#if $config.availableRegisterModes.findIndex(m => m.code == RegisterMode.SKIP.code) !== -1}
  <TabItem open={mode.isSkip()} class="flex-1"
		onclick={()=>$selectedRegisterMode=new RegisterModeState(RegisterMode.SKIP)}>
		<div slot="title" class="bg-skip flex gap-1 -m-4 p-4">
			<Icon icon="material-symbols:step-over" class="size-5 p-0" />
			<div class="whitespace-nowrap">スキップ</div>
		</div>

		<section class="pt-4 bg-skip">
			
			<article id="last-data" class="p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="flex"><Icon icon="material-symbols:step-over" />スキップ</div>
				<div>No. 101</div>
				<div>田中 太郎</div>
				<div><span class="text-sm">2024/</span>7/25 14:47<span class="text-sm">:42</span></div>
			</article>

		</section>
  </TabItem>
{/if}
</Tabs>

<section class="control-panel p-2 ml-auto mr-auto mb-10 bg-yellow-100 shadow-md 
	text-black text-left rounded-md w-3/4 min-h-48 max-w-96">

{#if inputPanel == 'info'}
	<article id="information" class="">
	
		<div>最終送信：<span class="text-sm">2024/</span>7/25 14:49<span class="text-sm">:01</span></div>
		<div id="info-detail">
			端末内　件数　回数
		</div>
	</article>
{:else if inputPanel == 'keypad'}
	<Keypad onClose={()=>inputPanel = 'info'} onRegister={asyncRegisterByNumber} />
{:else if inputPanel == 'camera' }
	<Camera />
{/if}

</section>


<!-- 下部ボタンコンテンツ -->
<!-- layoutでclass="h-lvh"を指定。ここではsize-fullを指定。 -->
<section class="pt-4 size-full"
	class:check={mode.isCheck()}
	class:retire={mode.isRetire()}
	class:skip={mode.isSkip()}>

	<button onclick={vib} class="btn btn-primary w-20 h-20" style="border:1px solid black;">振動</button>

	<!-- 送信ボタン -->
	<button class="p-3 fixed btn btn-circle btn-primary w-40 h-40 bg-primary" style="left:-25px; bottom:-25px;">
		<div style="margin-top:-15px; margin-right:-15px;">
			<Icon icon="ri:send-plane-fill" class="text-white dark:text-white w-24 h-24" />
			<div class="text-lg" style="margin-top:-12px;">すぐ送信</div>
		</div>
		<div class="badge rounded-full h-6 w-6 border-white text-nm" style="position:absolute; right:10px; top:10px;">15</div>
	</button>


	<Button pill={true} class="!p-3 fixed bg-primary" style="right:90px; bottom:10px;"
		on:click={()=>inputPanel = 'camera'}>
		<Icon icon="material-symbols:photo-camera-outline" class="w-10 h-10" />
	</Button>
	<Button pill={true} class="!p-3 fixed bg-primary" style="right:10px; bottom:10px;"
		on:click={()=>inputPanel = 'keypad'}>
		<Icon icon="material-symbols:dialpad" class="w-10 h-10" />
	</Button>

</section>
</main>

<style lang="postcss">
	.btn-circle {
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		@apply text-primary-text;
	}
</style>