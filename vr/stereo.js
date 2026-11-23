'use strict';

if (typeof AFRAME !== 'undefined') initializeStereo();

function initializeStereo() {
  const scene = document.querySelector('#world');
  const eyes = document.querySelector('#eyes');
  const start = document.querySelector('#stereo-start');
  const stop = document.querySelector('#stereo-stop');
  const headset = document.querySelector('#headset-start');
  const view = document.querySelector('#stereo-view');
  const canvas = document.querySelector('#stereo-canvas');
  const hint = document.querySelector('#stereo-help');
  const error = document.querySelector('#vr-error');
  const { Euler, MathUtils, PerspectiveCamera, Quaternion, StereoCamera, Vector3, WebGLRenderer } = AFRAME.THREE;
  const center = new PerspectiveCamera(68, 1, 0.05, 175);
  const stereo = new StereoCamera();
  stereo.eyeSep = 0.064;
  center.focus = 10;

  const orientation = new Quaternion();
  const fromDevice = new Quaternion().setFromAxisAngle(new Vector3(1, 0, 0), -Math.PI / 2);
  const screenAxis = new Vector3(0, 0, 1);
  const verticalAxis = new Vector3(0, 1, 0);
  const screenRotation = new Quaternion();
  const initialHeading = new Quaternion();
  const forward = new Vector3();
  const orientationEuler = new Euler(0, 0, 0, 'YXZ');
  let renderer;
  let sensorActive = false;
  let orientationAngle;
  let active = false;

  function showError(message) {
    error.textContent = message;
    error.hidden = false;
  }

  function trackDevice(event) {
    if ([event.alpha, event.beta, event.gamma].some(value => !Number.isFinite(value))) return;
    const angle = screen.orientation?.angle ?? window.orientation ?? 0;
    const radians = MathUtils.degToRad;
    orientationEuler.set(radians(event.beta), radians(event.alpha), -radians(event.gamma), 'YXZ');
    orientation.setFromEuler(orientationEuler).multiply(fromDevice);
    orientation.multiply(screenRotation.setFromAxisAngle(screenAxis, -radians(angle)));
    if (!sensorActive || orientationAngle !== angle) {
      forward.set(0, 0, -1).applyQuaternion(orientation);
      if (Math.hypot(forward.x, forward.z) < 0.1) return;
      const heading = Math.atan2(-forward.x, -forward.z);
      initialHeading.setFromAxisAngle(verticalAxis, -heading);
      orientationAngle = angle;
    }
    orientation.premultiply(initialHeading);
    sensorActive = true;
    hint.textContent = '端末の向きに合わせて見回せます。簡易VRゴーグルでは横向きで使用してください。';
  }

  function resize() {
    const width = view.clientWidth;
    const height = view.clientHeight;
    if (!active || !width || !height) return;
    renderer.setSize(width, height, false);
    center.aspect = Math.floor(width / 2) / height;
    center.updateProjectionMatrix();
  }

  AFRAME.registerComponent('stereo-view', {
    tock() {
      if (!active) return;
      const camera = eyes.getObject3D('camera');
      camera.getWorldPosition(center.position);
      if (sensorActive) center.quaternion.copy(orientation);
      else camera.getWorldQuaternion(center.quaternion);
      center.updateMatrixWorld(true);
      stereo.update(center);

      const width = view.clientWidth;
      const height = view.clientHeight;
      const half = Math.floor(width / 2);
      renderer.setViewport(0, 0, half, height);
      renderer.setScissor(0, 0, half, height);
      renderer.render(scene.object3D, stereo.cameraL);
      renderer.setViewport(half, 0, width - half, height);
      renderer.setScissor(half, 0, width - half, height);
      renderer.render(scene.object3D, stereo.cameraR);
    }
  });
  scene.setAttribute('stereo-view', '');

  start.addEventListener('click', () => {
    if (active) return;
    try {
      if (!renderer) {
        renderer = new WebGLRenderer({ canvas, antialias: true });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
        renderer.setScissorTest(true);
        renderer.outputColorSpace = scene.renderer.outputColorSpace;
        renderer.toneMapping = scene.renderer.toneMapping;
      }
    } catch {
      showError('二眼VRを開始できませんでした。WebGL対応のブラウザで開き直してください。');
      return;
    }
    error.hidden = true;
    document.querySelector('[data-view="home"]').click();
    active = true;
    sensorActive = false;
    hint.textContent = '横向きでご利用ください。画面のドラッグでも見回せます。';
    view.hidden = false;
    document.body.classList.add('stereo-active');
    resize();
    stop.focus();

    const orientationType = window.DeviceOrientationEvent;
    const onMobile = matchMedia('(pointer: coarse)').matches;
    if (onMobile && typeof orientationType?.requestPermission === 'function') {
      orientationType.requestPermission().then(permission => {
        if (active && permission === 'granted') window.addEventListener('deviceorientation', trackDevice);
      }).catch(() => {});
    } else if (onMobile && orientationType) {
      window.addEventListener('deviceorientation', trackDevice);
    }
  });

  function endStereo() {
    if (!active) return;
    active = false;
    window.removeEventListener('deviceorientation', trackDevice);
    view.hidden = true;
    document.body.classList.remove('stereo-active');
    start.focus();
  }

  stop.addEventListener('click', endStereo);
  window.addEventListener('resize', resize);
  window.addEventListener('keydown', event => {
    if (event.key === 'Escape') endStereo();
  });
  canvas.addEventListener('webglcontextlost', () => {
    endStereo();
    renderer.dispose();
    renderer = undefined;
    showError('二眼VRの描画が停止しました。ページを再読み込みしてください。');
  });
  headset.addEventListener('click', async () => {
    error.hidden = true;
    try {
      await scene.enterVR();
    } catch {
      showError('ヘッドセットに接続できませんでした。接続とブラウザ設定を確認してください。');
    }
  });

  function ready() {
    start.disabled = false;
    navigator.xr?.isSessionSupported('immersive-vr').then(supported => {
      headset.hidden = !supported;
    }).catch(() => {});
  }

  if (scene.hasLoaded) ready();
  else scene.addEventListener('loaded', ready, { once: true });
}
