'use strict';

const place = document.querySelector('#place');

if (typeof AFRAME === 'undefined') {
  place.textContent = 'A-Frameを読み込めませんでした。通信を確認して再読み込みしてください。';
} else {
  initializeWalk();
}

function initializeWalk() {
  const scene = document.querySelector('#world');
  const rig = document.querySelector('#rig');
  const eyes = document.querySelector('#eyes');
  const leftHand = document.querySelector('#left-hand');
  const buttons = [...document.querySelectorAll('[data-view]')];
  const views = {
    home: { label: '家の前', position: [-1, 0.27, 10.6], pitch: 2, yaw: 0 },
    shop: { label: '店の前', position: [-5, 0.27, -2.8], pitch: 0, yaw: 0 },
    trees: { label: '並木道', position: [10, 0.27, 5.9], pitch: 0, yaw: 71 },
    overview: { label: '街を俯瞰', position: [17, 23, 24], pitch: -38, yaw: 35 }
  };
  const keys = new Set();
  const movementKeys = new Set(['w', 'a', 's', 'd', 'arrowup', 'arrowleft', 'arrowdown', 'arrowright']);
  const direction = new AFRAME.THREE.Vector3();
  const up = new AFRAME.THREE.Vector3(0, 1, 0);
  const step = new AFRAME.THREE.Vector3();
  let currentView = 'home';
  let stickX = 0;
  let stickY = 0;
  let immersive = false;

  function selectView(name) {
    currentView = name;
    const { label, position, pitch, yaw } = views[name];
    rig.setAttribute('position', position.join(' '));
    const radians = AFRAME.THREE.MathUtils.degToRad;
    const look = eyes.components['look-controls'];
    if (look && !immersive) {
      look.pitchObject.rotation.x = radians(pitch);
      look.yawObject.rotation.y = radians(yaw);
      eyes.setAttribute('rotation', { x: pitch, y: yaw, z: 0 });
    }
    buttons.forEach(button => {
      button.setAttribute('aria-pressed', String(button.dataset.view === name));
    });
    place.textContent = label;
  }

  function canWalk(x, z) {
    if (Math.abs(x) > 12.8 || Math.abs(z) > 13.2) return false;
    // 家・フェンス・店舗・集合住宅と樹木の幹を避ける。
    const obstacles = [
      [-4.05, 4.05, -1.6, 5.05],
      [-6.5, -3.05, -7.24, -3.62],
      [3.17, 6.34, -7.24, -4.24],
      [10.25, 11.55, 1.2, 3.8]
    ];
    if (obstacles.some(([left, right, back, front]) => x > left && x < right && z > back && z < front)) {
      return false;
    }
    return [[-7, 3.25], [7, 3.25], [7, -1.25], [-7, -1.25], [0, -6.25]]
      .every(([treeX, treeZ]) => Math.hypot(x - treeX, z - treeZ) > 0.5);
  }

  AFRAME.registerComponent('town-walk', {
    tick(_time, delta) {
      if (currentView === 'overview' || !delta) return;
      const pressed = (...options) => options.some(key => keys.has(key));
      const forward = Number(pressed('w', 'arrowup')) - Number(pressed('s', 'arrowdown')) - stickY;
      const side = Number(pressed('d', 'arrowright')) - Number(pressed('a', 'arrowleft')) + stickX;
      if (Math.hypot(forward, side) < 0.15) return;
      const camera = eyes.getObject3D('camera');
      if (!camera) return;
      camera.getWorldDirection(direction);
      direction.y = 0;
      if (direction.lengthSq() < 0.0001) return;
      direction.normalize();
      step.crossVectors(direction, up).multiplyScalar(side).addScaledVector(direction, forward);
      step.clampLength(0, 1).multiplyScalar(Math.min(delta, 50) * 0.0025);
      const p = rig.object3D.position;
      const x = p.x + step.x;
      const z = p.z + step.z;
      if (canWalk(x, p.z)) p.x = x;
      if (canWalk(p.x, z)) p.z = z;
    }
  });

  scene.addEventListener('enter-vr', () => {
    if (!scene.is('vr-mode')) return;
    immersive = true;
    document.body.classList.add('immersive');
    selectView('home');
  });
  scene.addEventListener('exit-vr', () => {
    immersive = false;
    stickX = 0;
    stickY = 0;
    document.body.classList.remove('immersive');
    selectView('home');
  });
  leftHand.addEventListener('thumbstickmoved', ({ detail }) => {
    if (!immersive) return;
    stickX = detail.x;
    stickY = detail.y;
  });
  leftHand.addEventListener('controllerdisconnected', () => { stickX = 0; stickY = 0; });
  buttons.forEach(button => button.addEventListener('click', () => selectView(button.dataset.view)));
  window.addEventListener('keydown', event => {
    if (!event.altKey && !event.ctrlKey && !event.metaKey && movementKeys.has(event.key.toLowerCase())) {
      event.preventDefault();
      keys.add(event.key.toLowerCase());
    }
  });
  window.addEventListener('keyup', event => keys.delete(event.key.toLowerCase()));
  window.addEventListener('blur', () => keys.clear());

  buildTown(document.querySelector('#neighborhood'));
  scene.setAttribute('town-walk', '');
  if (scene.hasLoaded) selectView('home');
  else scene.addEventListener('loaded', () => selectView('home'), { once: true });
}
