// cameraSync.js
// Flüssige bidirektionale Kamera-Synchronisation für <model-viewer>

export function enableCameraSync(mvA, mvB) {
  let syncing = false;

  function lerp(a, b, t) {
    return a + (b - a) * t;
  }

  function parseOrbit(o) {
    const [az, el, r] = o.split(" ");
    return [
      parseFloat(az),
      parseFloat(el),
      parseFloat(r)
    ];
  }

  function formatOrbit(o) {
    return `${o[0]}deg ${o[1]}deg ${o[2]}m`;
  }

  function syncSmooth(from, to) {
    if (syncing) return;
    syncing = true;

    const fromOrbit = parseOrbit(from.cameraOrbit);
    let toOrbit = parseOrbit(to.cameraOrbit);

    function step() {
      toOrbit = [
        lerp(toOrbit[0], fromOrbit[0], 0.35),
        lerp(toOrbit[1], fromOrbit[1], 0.35),
        lerp(toOrbit[2], fromOrbit[2], 0.35)
      ];

      to.cameraOrbit = formatOrbit(toOrbit);
      to.cameraTarget = from.cameraTarget;
      to.fieldOfView = from.fieldOfView;

      if (
        Math.abs(toOrbit[0] - fromOrbit[0]) > 0.01 ||
        Math.abs(toOrbit[1] - fromOrbit[1]) > 0.01 ||
        Math.abs(toOrbit[2] - fromOrbit[2]) > 0.01
      ) {
        requestAnimationFrame(step);
      } else {
        syncing = false;
      }
    }

    step();
  }

  mvA.addEventListener("camera-change", () => syncSmooth(mvA, mvB));
  mvB.addEventListener("camera-change", () => syncSmooth(mvB, mvA));
}
