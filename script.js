'use strict';
const params = new URLSearchParams(location.search);
const preview = params.get('mode') === 'preview';
let town, scene, night = false, size = 1;
const $ = id => document.getElementById(id);
function status(text, found=false){$('status-text').textContent=text;$('indicator').classList.toggle('found',found);}
function start() {
  if(!window.AFRAME || !AFRAME.THREE || (!preview && !AFRAME.systems.arjs)){
    $('startup-message').textContent='ライブラリを読み込めませんでした。通信環境を確認して再読み込みしてください。';return;
  }
  if(!preview && (!window.isSecureContext || !navigator.mediaDevices)){
    $('startup-message').textContent='カメラにはHTTPS接続（またはlocalhost）が必要です。';return;
  }
  $('welcome').hidden=true;$('controls').hidden=false;document.body.classList.add('running');
  scene=entity('a-scene',{'embedded':'','vr-mode-ui':'enabled: false','device-orientation-permission-ui':'enabled: false',renderer:'antialias: true; alpha: true; colorManagement: true'},null);
  if(!preview)scene.setAttribute('arjs','sourceType: webcam; debugUIEnabled: false; detectionMode: mono; patternRatio: 0.5');
  const light=entity('a-entity',{id:'ambient',light:'type: ambient; color: #ffffff; intensity: 1'},scene);
  entity('a-entity',{id:'sun',light:'type: directional; color: #fff1d2; intensity: 1.1',position:'-2 5 3'},scene);
  if(preview){
    scene.setAttribute('background','color: #e8ecdf');
    town=buildTown(scene);
    // 見下ろすカメラ。ドラッグで視線を変更できる。
    entity('a-camera',{position:'4.5 4.8 6.5',rotation:'-31 35 0','look-controls':'enabled: true','wasd-controls':'enabled: false'},scene);
    status('3Dプレビュー / カメラ未使用',true);$('hint').textContent='ドラッグで視線を変更。＋ / − で街の大きさを調整。';
  }else{
    const marker=entity('a-marker',{type:'pattern',url:'assets/mini-house.patt',emitevents:'true',smooth:'true','smooth-count':'5'},scene);
    town=buildTown(marker);entity('a-entity',{camera:''},scene);
    marker.addEventListener('markerFound',()=>status('ミニハウスを表示しています',true));
    marker.addEventListener('markerLost',()=>status('マーカーを探しています'));
    scene.addEventListener('camera-error',()=>{status('カメラを開始できませんでした');$('hint').textContent='ブラウザのカメラ権限・HTTPS接続を確認し、再読み込みしてください。';});
    scene.addEventListener('camera-init',()=>status('マーカー全体を映してください'));
  }
  $('stage').appendChild(scene);
}
$('start').addEventListener('click',start);
$('daynight').addEventListener('click',()=>{
  night=!night;$('daynight').textContent=night?'昼にする':'夜にする';$('daynight').setAttribute('aria-pressed',String(night));
  $('ambient').setAttribute('light','intensity',night?.3:1);
  $('sun').setAttribute('light','intensity',night?.2:1.1);
  scene.querySelectorAll('.window').forEach(el=>el.setAttribute('material',`color: ${night?'#ffd77c':'#8cb7ba'}; emissive: ${night?'#ffd77c':'#000000'}; emissiveIntensity: ${night?.8:0}`));
  if(preview)scene.setAttribute('background','color',night?'#243644':'#e8ecdf');
});
function resize(delta){size=Math.min(1.6,Math.max(.4,size+delta));town.setAttribute('scale',`${size} ${size} ${size}`);}
$('smaller').addEventListener('click',()=>resize(-.1));$('larger').addEventListener('click',()=>resize(.1));
if(preview)start();
