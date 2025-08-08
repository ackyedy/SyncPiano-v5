
export const dict={
  ja:{
    filesGroup:'ファイル',effectsGroup:'エフェクト',keysGroup:'鍵盤',bgRenderGroup:'背景/出力',modeGroup:'モード',
    importBtn:'ファイルをインポート',recent:'最近使ったファイル',library:'ライブラリ',dragHint:'ライブラリからタイムラインにドラッグ＆ドロップで配置できます。',
    colorPresets:'色プリセット',particles:'パーティクル',enable:'有効化',lights:'ライト',glare:'グレア',keysPanel:'鍵盤',primary:'メイン',secondary:'サブ',
    background:'背景',media:'メディア',render:'書き出し',chooseDir:'保存先を選択',format:'形式',resolution:'解像度',fps:'フレームレート',export:'書き出し',
    dropMidi:'ここにMIDIをドロップ',dropAudio:'ここにオーディオをドロップ',dropVideo:'ここに動画をドロップ'
  },
  en:{
    filesGroup:'Files',effectsGroup:'Effects',keysGroup:'Keys',bgRenderGroup:'BG/Render',modeGroup:'Mode',
    importBtn:'Import files',recent:'Recent',library:'Library',dragHint:'Drag items from the Library onto the timeline.',
    colorPresets:'Color Presets',particles:'Particles',enable:'Enable',lights:'Lights',glare:'Glare',keysPanel:'Keys',primary:'Primary',secondary:'Secondary',
    background:'Background',media:'Media',render:'Render',chooseDir:'Choose directory',format:'Format',resolution:'Resolution',fps:'FPS',export:'Export',
    dropMidi:'Drop MIDI here',dropAudio:'Drop audio here',dropVideo:'Drop video here'
  }
};
export function applyLang(lang='ja'){
  const d = dict[lang] || dict.ja;
  document.querySelectorAll('[data-i18n]').forEach(el=>{
    const key = el.getAttribute('data-i18n');
    if(d[key]) el.textContent = d[key];
  });
}
