/* 授業資料の基本構成：a-scene / a-marker / a-entity camera。
 * 外部3Dモデルは使用せず、A-Frameの基本図形から街を作成する。 */
'use strict';
const params = new URLSearchParams(location.search);
const preview = params.get('mode') === 'preview';
let town, scene, night = false, size = 1;
const $ = id => document.getElementById(id);
function entity(tag, attrs, parent) {
  const el = document.createElement(tag);
  Object.entries(attrs).forEach(([key, value]) => el.setAttribute(key, value));
  if (parent) parent.appendChild(el);
  return el;
}
function box(parent, position, width, height, depth, color, extra = {}) {
  return entity('a-box', {position, width, height, depth, color, ...extra}, parent);
}
function buildTown(parent) {
  const root = entity('a-entity', {id:'town'}, parent);
  box(root,'0 -0.08 0',3.5,.16,3.5,'#879f74');
  box(root,'0 0.006 0',2.65,.025,2.65,'#d5d1ba');
  // 四辺の道路。中央の住宅区画を囲む。
  [-1.28,1.28].forEach(v => {
    box(root,`0 .03 ${v}`,3.22,.025,.4,'#536266');
    box(root,`${v} .03 0`,.4,.025,2.2,'#536266');
    for(let i=-3;i<=3;i++){
      box(root,`${i*.4} .046 ${v}`,.17,.006,.025,'#eee5cf');
      box(root,`${v} .046 ${i*.3}`, .025,.006,.13,'#eee5cf');
    }
  });
  box(root,'0 .035 0',2.08,.03,2.08,'#adc38c');
  // 主役のミニハウス：玄関が手前(+z)、切妻屋根。
  const house = entity('a-entity',{position:'-.16 0 .15'},root);
  box(house,'0 .12 0',1.08,.2,.92,'#d4b997');
  box(house,'0 .48 0',.92,.58,.78,'#fff0d4');
  const roofShape = new AFRAME.THREE.Shape();
  roofShape.moveTo(-.57,0);roofShape.lineTo(.57,0);roofShape.lineTo(0,.42);roofShape.closePath();
  const roofGeometry = new AFRAME.THREE.ExtrudeGeometry(roofShape,{depth:.98,bevelEnabled:false});
  const roof = entity('a-entity',{position:'0 .77 -.49'},house);
  roof.setObject3D('mesh',new AFRAME.THREE.Mesh(roofGeometry,new AFRAME.THREE.MeshStandardMaterial({color:'#b95440',roughness:.85})));
  box(house,'.29 1.02 -.17',.13,.4,.15,'#b2947c');
  box(house,'-.19 .38 .398',.19,.35,.025,'#6e8b7b');
  entity('a-sphere',{position:'-.135 .39 .419',radius:.016,color:'#d6b36c'},house);
  [[.23,.5,.4],[-.468,.5,.02],[.23,.5,-.4]].forEach(([x,y,z]) => {
    const side = x<-.4;
    box(house,`${x} ${y} ${z}`,side?.024:.23,.22,side?.23:.024,'#e8c777',{'class':'window'});
    box(house,`${x} ${y} ${z+(z>0?.015:z<0?-.015:0)}`,side?.03:.018,.23,side?.018:.03,'#fff8df');
  });
  for(let i=0;i<3;i++)box(root,`-.35 .065 ${.76+i*.12}`,.24,.025,.075,'#eadfca');
  // 背後の店舗と集合住宅。中央の家の視認性を保つ。
  const shop=entity('a-entity',{position:'-.66 0 -.72'},root);
  box(shop,'0 .27 0',.48,.49,.4,'#d9ad79');box(shop,'0 .54 0',.56,.07,.47,'#688e8d');
  box(shop,'0 .26 .21',.32,.24,.025,'#88b4b2',{'class':'window'});
  box(shop,'0 .44 .27',.55,.055,.2,'#f1dfb9');
  const apartment=entity('a-entity',{position:'.64 0 -.68'},root);
  box(apartment,'0 .42 0',.43,.8,.42,'#c5cfd0');box(apartment,'0 .84 0',.48,.05,.47,'#6d8086');
  [.25,.49,.69].forEach(y=>[-.11,.11].forEach(x=>box(apartment,`${x} ${y} .22`,.11,.13,.025,'#7cabb4',{'class':'window'})));
  // 木々：幹と葉を別の図形で構成。
  [[-.82,.6],[.78,.55],[.79,-.08],[-.87,-.1],[.05,-.83]].forEach(([x,z],i)=>{
    const tree=entity('a-entity',{position:`${x} 0 ${z}`},root);
    entity('a-cylinder',{position:'0 .24 0',radius:.045,height:.44,color:'#937255'},tree);
    entity('a-sphere',{position:'0 .55 0',radius:i%2?.22:.26,scale:'1 1.2 1',color:i%2?'#5e8c61':'#759b5b','segments-width':10,'segments-height':7},tree);
  });
  // 横断歩道と小さな車。
  for(let i=0;i<5;i++)box(root,`${-.22+i*.11} .05 1.28`,.065,.008,.33,'#f4eddb');
  const car=entity('a-entity',{position:'1.28 .09 .5'},root);
  box(car,'0 .08 0',.19,.13,.34,'#d59055');box(car,'0 .17 -.015',.16,.1,.17,'#ecdfb9');
  [-.1,.1].forEach(x=>[-.105,.105].forEach(z=>entity('a-cylinder',{position:`${x} .025 ${z}`,rotation:'0 0 90',radius:.047,height:.025,color:'#344247'},car)));
  return root;
}
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
    entity('a-camera',{position:'3.6 3.8 5.2',rotation:'-31 35 0','look-controls':'enabled: true','wasd-controls':'enabled: false'},scene);
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
