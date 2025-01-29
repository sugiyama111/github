//export { type Dayjs , dayjs } from 'svelte-time/dayjs';

import { dayjs } from 'svelte-time/dayjs'; // dayjs 関数をデフォルトインポート
//import type { Dayjs } from 'dayjs';
type Dayjs = ReturnType<typeof dayjs>; // dayjs() の戻り値の型を取得


export { dayjs, type Dayjs };

// TypeScript の dayjs 型を使う


//export { type Dayjs } from 'dayjs';
