<script lang="ts">
	import Icon from "@iconify/svelte";
	import { RegisterMode, RegisterModeState } from "$lib/type/RegisterMode";
	import { Tabs, TabItem, Button } from 'flowbite-svelte';
	import Camera from "$lib/components/Camera.svelte";
	import Keypad from "$lib/components/Keypad.svelte";
	import { db } from "$lib/db/db";
	import MemberEntity from "$lib/db/MemberEntity";
	import { toast } from "$lib/QRTToast";
	import { config, selectedEvent, selectedPoint, selectedLogId, selectedRegisterMode, showsMemberSelectDialog, showsRegisterConfirmDialog } from "$lib/stores";
	import { lastRegistered, lastRegisteredTime } from '$lib/stores';
	import MemberSelectDialog from '$lib/components/MemberSelectDialog.svelte';
	import RegisterConfirmDialog from '$lib/components/RegisterConfirmDialog.svelte';
	import { dayjs, type Dayjs } from '$lib/type/Dayjs';

	import { RegisterMethod } from "$lib/type/RegisterMethod";
	import RecordEntity from "$lib/db/RecordEntity";
    import { Sound } from "$lib/Sound";

	let mode:RegisterModeState = $state(new RegisterModeState(RegisterMode.CHECK));
	let inputPanel:'info' | 'camera' | 'keypad' = $state<'info' | 'camera' | 'keypad'>('info');
	let memberCollectionForSelect:MemberEntity[] = $state<MemberEntity[]>([]);
	let memberForConfirm:MemberEntity | null = $state(null);
	let measuringTime:Dayjs | null = null;
	let registerMethod:RegisterMethod | null = null;
	let specifiedMember:MemberEntity | null = null;

	console.log('lastRegisteredTime');
	console.log($lastRegisteredTime);

	function vib() {
		console.log('vib');
		window.navigator.vibrate([400]); // vibrate for 200ms
		console.log('vib finished');
	}

	// 番号での登録
	const asyncRegisterByNumber = async (inputNumber:string) => {
		const memberList = await (await db.asyncFetchByNumber(inputNumber)).toArray();
		
		measuringTime = dayjs();

		registerMethod = RegisterMethod.KEYPAD;
		await asyncFilterProcess(memberList);
	}
	
	// 登録プロセス1：メンバー絞り込み
	const asyncFilterProcess = async (memberCollection:MemberEntity[]) => {
console.log('asyncFilterProcess');
console.log(measuringTime);

		// 複数存在する場合は選択ダイアログを表示
		if (memberCollection.length == 0) {
			// 音とトースト
			toast.error('名簿にみつかりません');
			Sound.Play(Sound.NOT_FOUND);
		} else if (memberCollection.length == 1) {
			// 特定できた場合(→プロセス2へ)
			specifiedMember = memberCollection[0];
			console.log(specifiedMember);
			await asyncConfirmProcess();
		} else {
			// 複数存在する場合
			memberCollectionForSelect = memberCollection;
			$showsMemberSelectDialog = true;
		}
	}

	// 登録プロセス2：登録是非確認
	const asyncConfirmProcess = async () => {
		console.log('asyncConfirmProcess');
		console.log(measuringTime);

		if ($selectedRegisterMode.isCheck()) {
			// 確認不要の場合
			await asyncRegisterProcess();
		} else {
			// 確認必要の場合
			memberForConfirm = specifiedMember;
			$showsRegisterConfirmDialog = true;
		}
	}

	// 登録プロセス3：登録
	const asyncRegisterProcess = async () => {
		// 万一、記録対象のログが選ばれていない場合
		if ($selectedLogId === null) {
			toast.error('ログが選択されていません');
			return;
		}

		if (specifiedMember === null) {
			toast.error('対象メンバーが特定されていません');
			return;
		}
		if (measuringTime === null) {
			toast.error('計測時刻が異常です');
			return;
		}
		if (registerMethod === null) {
			toast.error('計測方法が選択されていません');
			return;
		}

		const nextSeq = await db.asyncFetchNewRecordSeq();
		console.log(nextSeq);
		console.log(measuringTime);

		// 登録するデータ
		const regRecordObj = {
			seq: nextSeq,
			log_id: $selectedLogId,
			member_code: specifiedMember.member_code,
			member_name: specifiedMember.name,
			race_num: specifiedMember.bib_number,
			time: measuringTime.format('YYYY/MM/DD HH:mm:ss.SSS'),
			method: registerMethod.code,
			mode:$selectedRegisterMode.getCode(),
			sent: false,
		};

    // 登録
		try {
			const record = new RecordEntity(regRecordObj);
			await db.records.add(record);

			// 最終登録storeを更新
			$lastRegistered[$selectedRegisterMode.getCode() as keyof typeof $lastRegistered] = record;
			

			// 音を鳴らす
			Sound.Play(Sound.READ_OK);

			// 振動


			// Toast
			toast.success('登録しました');

			// モーダルを条件によっては閉じる

		} catch (e) {
			console.error('登録エラー db.records.add');
			console.error(measuringTime);

		}

	}
</script>

<MemberSelectDialog message="複数見つかりました。対象を選んでください。" memberCollection={memberCollectionForSelect} onMemberSelected={(member:MemberEntity)=>{specifiedMember = member; asyncConfirmProcess();}} />
<RegisterConfirmDialog message="登録してよいですか？" member={memberForConfirm} onRegisterConfirmed={asyncRegisterProcess} />
	
<main class={`bg-${$selectedRegisterMode.getCode()}`} >

{#if !$selectedEvent}
	<section class="flex justify-center p-6 text-lg">
		<Icon icon="mdi:alert-circle-outline" font-size="30" />
		<div>イベントを読み込んでください</div>
	</section>
{:else if !$selectedPoint}
	<section class="flex justify-center p-6 text-lg">
		<Icon icon="mdi:alert-circle-outline" font-size="30" />
		<div>地点を選択してください</div>
	</section>
{:else}
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
			
			<article class="last-data p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="mode-chip"><Icon icon="material-symbols:check-circle-outline" />チェック</div>
				<div>No. { $lastRegistered['check']?.race_num}</div>
				<div>{ $lastRegistered['check']?.member_name }</div>
				<div>
					{#if $lastRegisteredTime['check']}
					<span class="text-sm">{ $lastRegisteredTime['check'].format('YYYY') }/</span>{ $lastRegisteredTime['check'].format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime['check'].format('ss') }</span>
					{/if}
				</div>
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
			
			<article class="last-data p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="mode-chip"><Icon icon="material-symbols:close" />リタイア</div>
				<div>No. { $lastRegistered['retire']?.race_num}</div>
				<div>{ $lastRegistered['retire']?.member_name }</div>
				<div>
					{#if $lastRegisteredTime['retire']}
					<span class="text-sm">{ $lastRegisteredTime['retire'].format('YYYY') }/</span>{ $lastRegisteredTime['retire'].format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime['retire'].format('ss') }</span>
					{/if}
				</div>
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
			
			<article class="last-data p-2 ml-auto mr-auto mb-4 bg-slate-300 shadow-md 
				text-black text-left rounded-md w-3/4 max-w-96">
				<div class="mode-chip"><Icon icon="material-symbols:step-over" />スキップ</div>
				<div>No. { $lastRegistered['skip']?.race_num}</div>
				<div>{ $lastRegistered['skip']?.member_name }</div>
				<div>
					{#if $lastRegisteredTime['skip']}
					<span class="text-sm">{ $lastRegisteredTime['skip'].format('YYYY') }/</span>{ $lastRegisteredTime['skip'].format('MM/DD HH:mm') }<span class="text-sm">:{ $lastRegisteredTime['skip'].format('ss') }</span>
					{/if}
				</div>
			</article>

		</section>
  </TabItem>
{/if}
</Tabs>

<section class="control-panel p-2 ml-auto mr-auto mb-10 bg-yellow-100 shadow-md 
	text-black text-left rounded-md w-3/4 max-w-96">

{#if inputPanel == 'info'}
	<article id="information" class="">
		スキャナはありません<br>
		Scanner Manager アプリが起動していません。<br>
		端末起動直後の場合は起動するまでお待ちください。<br>
		それ以外は、アプリを起動してください。		
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

{/if}
</main>

<style lang="postcss">
	.mode-chip {
		@apply flex bg-light-background;
		@apply rounded-xl;
		@apply pl-2 pr-3 pt-1 pb-1;
		width: fit-content;
		line-height: 1.1rem;
		box-shadow: 1px 1px gray;
	}
	.btn-circle {
		border-radius: 50%;
		display: flex;
		justify-content: center;
		align-items: center;
		@apply text-primary-text;
	}

	article.last-data div {
		height: 1.6em;
	}
</style>