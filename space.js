(() => {
  "use strict";

  const canvas = document.getElementById("starfield");
  if (!canvas || typeof canvas.getContext !== "function") return;

  const context = canvas.getContext("2d", { alpha: true });
  if (!context) return;

  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const finePointer = window.matchMedia("(pointer: fine)");
  const frameInterval = 1000 / 30;
  const maxPixelArea = 2400000;
  const pointerLimit = 8;

  let stars = [];
  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let frameId = 0;
  let geometryDirty = true;
  let lastDraw = null;
  let elapsed = 0;
  let pointerX = 0;
  let pointerY = 0;
  let targetX = 0;
  let targetY = 0;

  // A stable seed keeps the sky consistent when its viewport is resized.
  function makeStars(count) {
    let seed = 72519;
    const random = () => {
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      return seed / 4294967296;
    };

    return Array.from({ length: count }, () => ({
      x: random(),
      y: random(),
      depth: 0.3 + random() * 0.7,
      radius: 0.35 + random() * 1.05,
      opacity: 0.18 + random() * 0.48,
      phase: random() * Math.PI * 2,
      period: 3 + random() * 5,
      blue: random() > 0.65,
    }));
  }

  function resize() {
    width = Math.max(1, window.innerWidth);
    height = Math.max(1, window.innerHeight);
    pixelRatio = Math.min(
      window.devicePixelRatio || 1,
      1.5,
      Math.sqrt(maxPixelArea / (width * height)),
    );
    canvas.width = Math.max(1, Math.floor(width * pixelRatio));
    canvas.height = Math.max(1, Math.floor(height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);

    const count = width <= 640
      ? 50
      : Math.min(180, Math.max(90, Math.round((width * height) / 11500)));
    stars = makeStars(count);
    geometryDirty = false;
  }

  function draw() {
    context.clearRect(0, 0, width, height);
    const staticSky = reducedMotion.matches;

    for (const star of stars) {
      const motionTime = staticSky ? 0 : elapsed;
      const driftX = Math.sin(motionTime / 90 + star.phase) * 5 * star.depth;
      const driftY = Math.sin(motionTime / 120 + star.phase) * 3 * star.depth;
      const x = star.x * width + (staticSky ? 0 : pointerX * star.depth + driftX);
      const y = star.y * height + (staticSky ? 0 : pointerY * star.depth + driftY);
      const twinkle = staticSky ? 1 : 0.9 + Math.sin(motionTime / star.period + star.phase) * 0.1;
      const alpha = star.opacity * twinkle;
      const color = star.blue ? "155, 203, 255" : "218, 234, 255";

      // A faint halo on the closest stars adds depth without large effects.
      if (star.radius > 1.2) {
        context.beginPath();
        context.arc(x, y, star.radius * 3, 0, Math.PI * 2);
        context.fillStyle = `rgba(${color}, ${alpha * 0.06})`;
        context.fill();
      }

      context.beginPath();
      context.arc(x, y, star.radius, 0, Math.PI * 2);
      context.fillStyle = `rgba(${color}, ${alpha})`;
      context.fill();
    }
  }

  function schedule() {
    if (!document.hidden && !frameId) frameId = window.requestAnimationFrame(tick);
  }

  function tick(timestamp) {
    frameId = 0;
    if (document.hidden) return;

    if (!reducedMotion.matches && lastDraw !== null && timestamp - lastDraw < frameInterval) {
      schedule();
      return;
    }

    if (geometryDirty) resize();

    if (reducedMotion.matches) {
      pointerX = pointerY = targetX = targetY = 0;
      lastDraw = null;
      draw();
      return;
    }

    const delta = lastDraw === null ? 0 : Math.min((timestamp - lastDraw) / 1000, 0.1);
    elapsed += delta;
    lastDraw = timestamp;
    const easing = 1 - Math.exp(-delta * 2.5);
    pointerX += (targetX - pointerX) * easing;
    pointerY += (targetY - pointerY) * easing;
    draw();

    schedule();
  }

  function restart() {
    if (frameId) window.cancelAnimationFrame(frameId);
    frameId = 0;
    lastDraw = null;
    targetX = targetY = 0;
    schedule();
  }

  window.addEventListener("resize", () => {
    geometryDirty = true;
    schedule();
  }, { passive: true });

  window.addEventListener("pointermove", (event) => {
    if (document.hidden || reducedMotion.matches || !finePointer.matches) return;
    targetX = Math.max(-1, Math.min(1, (event.clientX / width) * 2 - 1)) * pointerLimit;
    targetY = Math.max(-1, Math.min(1, (event.clientY / height) * 2 - 1)) * pointerLimit;
  }, { passive: true });

  document.addEventListener("pointerleave", () => {
    targetX = targetY = 0;
  }, { passive: true });

  document.addEventListener("visibilitychange", restart);
  reducedMotion.addEventListener("change", restart);
  finePointer.addEventListener("change", restart);
  schedule();
})();
