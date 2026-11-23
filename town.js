'use strict';

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
  box(root,'0 -0.08 0',4.8,.16,4.8,'#879f74');
  box(root,'0 .015 0',3.6,.03,3.6,'#d5d1ba');
  // 四辺の道路。中央の住宅区画を囲む。
  [-2.05,2.05].forEach(v => {
    box(root,`0 .03 ${v}`,4.6,.05,.5,'#536266');
    box(root,`${v} .03 0`,.5,.05,3.6,'#536266');
    for(let i=-4;i<=4;i++){
      if (!(v>0 && i===-1)) box(root,`${i*.36} .059 ${v}`,.17,.006,.025,'#eee5cf');
      box(root,`${v} .059 ${i*.36}`, .025,.006,.17,'#eee5cf');
    }
  });
  box(root,'0 .035 0',3.28,.03,3.28,'#adc38c');
  // 主役のミニハウス：玄関が手前(+z)、切妻屋根。
  const house = entity('a-entity',{position:'0 0 .25'},root);
  box(house,'0 .12 0',1.08,.2,.92,'#d4b997');
  box(house,'0 .48 0',.92,.58,.78,'#fff0d4');
  const roofShape = new AFRAME.THREE.Shape();
  roofShape.moveTo(-.57,0);roofShape.lineTo(.57,0);roofShape.lineTo(0,.42);roofShape.closePath();
  const roofGeometry = new AFRAME.THREE.ExtrudeGeometry(roofShape,{depth:.98,bevelEnabled:false});
  const roof = entity('a-entity',{position:'0 .77 -.49'},house);
  roof.setObject3D('mesh',new AFRAME.THREE.Mesh(roofGeometry,new AFRAME.THREE.MeshStandardMaterial({color:'#b95440',roughness:.85})));
  box(house,'.29 1.07 -.17',.13,.46,.15,'#b2947c');
  box(house,'.29 1.31 -.17',.19,.045,.21,'#796659');
  // 軒、棟、外壁の継ぎ目。壁面と装飾を離してちらつきを防ぐ。
  box(house,'0 1.195 0',.045,.04,1.02,'#934334');
  [-.56,.56].forEach(x=>box(house,`${x} .77 0`,.035,.055,1.02,'#f0ddbe'));
  [.29,.39,.49,.59,.69].forEach(y=>{
    [-.396,.396].forEach(z=>box(house,`0 ${y} ${z}`,.92,.008,.006,'#e6d5ba'));
    [-.466,.466].forEach(x=>box(house,`${x} ${y} 0`,.006,.008,.78,'#e6d5ba'));
  });
  box(house,'-.19 .38 .398',.19,.35,.025,'#6e8b7b');
  entity('a-sphere',{position:'-.135 .39 .419',radius:.016,color:'#d6b36c'},house);
  [[.23,.51,.4,0],[-.468,.51,0,-90],[.468,.51,0,90],[.23,.51,-.4,180]].forEach(([x,y,z,rotation]) => {
    const windowFrame=entity('a-entity',{position:`${x} ${y} ${z}`,rotation:`0 ${rotation} 0`},house);
    box(windowFrame,'0 0 0',.27,.26,.025,'#fdf5df');
    box(windowFrame,'0 0 .018',.21,.2,.012,'#88b4b2',{'class':'window'});
    box(windowFrame,'0 0 .028',.018,.2,.012,'#fdf5df');
    box(windowFrame,'0 0 .028',.21,.018,.012,'#fdf5df');
    box(windowFrame,'0 -.145 .02',.3,.035,.09,'#c6b391');
  });
  // 玄関ポーチと段差を経て、歩道・横断歩道へつながる。
  box(house,'-.19 .17 .52',.4,.1,.24,'#d4b997');
  box(house,'-.19 .1 .69',.44,.06,.13,'#d4b997');
  box(house,'-.19 .79 .53',.46,.055,.3,'#b95440');
  [-.39,.01].forEach(x=>box(house,`${x} .48 .64`,.025,.57,.025,'#f0ddbe'));
  box(root,'-.19 .056 1.38',.34,.012,.84,'#eadfca');
  // 住宅と隣の敷地との間に低いフェンス。通路の前は開ける。
  [-.75,.75].forEach(x=>{
    [.05,.4,.75].forEach(z=>box(root,`${x} .2 ${z}`,.035,.3,.035,'#f1e8d1'));
    [.16,.29].forEach(y=>box(root,`${x} ${y} .4`,.025,.025,.74,'#f1e8d1'));
  });
  // 背後の店舗と集合住宅。中央の家の視認性を保つ。
  const shop=entity('a-entity',{position:'-.95 0 -1.15'},root);
  box(shop,'0 .27 0',.48,.49,.4,'#d9ad79');box(shop,'0 .54 0',.56,.07,.47,'#688e8d');
  box(shop,'0 .26 .21',.32,.24,.025,'#88b4b2',{'class':'window'});
  box(shop,'0 .44 .27',.55,.055,.2,'#f1dfb9');
  const apartment=entity('a-entity',{position:'.95 0 -1.15'},root);
  box(apartment,'0 .42 0',.43,.8,.42,'#c5cfd0');box(apartment,'0 .84 0',.48,.05,.47,'#6d8086');
  [.25,.49,.69].forEach(y=>[-.11,.11].forEach(x=>box(apartment,`${x} ${y} .22`,.11,.13,.025,'#7cabb4',{'class':'window'})));
  // 木々：幹と葉を別の図形で構成。
  // 葉の半径も含め、家・フェンス・建物・歩道に侵入しない位置。
  [[-1.4,.65],[1.4,.65],[1.4,-.25],[-1.4,-.25],[0,-1.25]].forEach(([x,z],i)=>{
    const tree=entity('a-entity',{position:`${x} 0 ${z}`},root);
    entity('a-cylinder',{position:'0 .27 0',radius:.035,height:.44,color:'#937255'},tree);
    entity('a-sphere',{position:'0 .64 0',radius:.22,scale:'1 1.2 1',color:i%2?'#5e8c61':'#759b5b','segments-width':14,'segments-height':10},tree);
  });
  // 横断歩道と小さな車。
  for(let i=0;i<5;i++)box(root,`${-.41+i*.11} .06 2.05`,.065,.008,.45,'#f4eddb');
  const car=entity('a-entity',{position:'2.18 .102 .5'},root);
  box(car,'0 .08 0',.19,.13,.34,'#d59055');box(car,'0 .17 -.015',.16,.1,.17,'#ecdfb9');
  [-.1,.1].forEach(x=>[-.105,.105].forEach(z=>entity('a-cylinder',{position:`${x} 0 ${z}`,rotation:'0 0 90',radius:.047,height:.025,color:'#344247'},car)));
  return root;
}
