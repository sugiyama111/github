import { Howl } from 'howler';

// 音声の種類を定義
const soundTypes = {
  READ_OK: '/sound/ok1.mp3',
  NOT_FOUND: '/sound/ng49.mp3',
  // 他の音を追加する場合はここに追加
} as const;

// 音声キーの型
type SoundKey = keyof typeof soundTypes;

// 音声を管理するクラス
class SoundManager {
  // 音声ファイルを保存するオブジェクト
  readonly soundList: Record<SoundKey, Howl>;

  constructor() {
    // 音声ファイルを一度だけプリロードし、インスタンスを作成
    this.soundList = {} as Record<SoundKey, Howl>;

		Object.entries(soundTypes).forEach(([key, src]) => {
      this.soundList[key as SoundKey] = new Howl({
        src: [src],
        preload: true,
        onload: () => {
          console.log(`Sound ${key} preloaded!`);
        },
        onloaderror: (id, error) => {
          console.error(`Failed to preload sound ${key}:`, error);
        },
      });
    });
  }

  // 音声を再生するメソッド
  play(sound: Howl): void {
    sound.play();
  }
}

// SoundManagerインスタンスを作成
const soundManager = new SoundManager();

// Soundオブジェクトに音声ファイルインスタンスをエクスポート
export const Sound = {
  ...soundManager.soundList,
  Play: (sound: Howl): void => {
    soundManager.play(sound);
  },
};

// 外部での使用例
// Sound.play(Sound.READ_OK); といった形式で使用できます。
