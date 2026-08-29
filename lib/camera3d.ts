export type Cam3 = { yaw: number; pitch: number; dist: number; tx: number; ty: number };

export function defaultCam(dist = 6): Cam3 {
  return { yaw: 0.7, pitch: 0.45, dist, tx: 0, ty: 0 };
}

export function project3(x: number, y: number, z: number, cam: Cam3, w: number, h: number) {
  const cy = Math.cos(cam.yaw), sy = Math.sin(cam.yaw);
  const cp = Math.cos(cam.pitch), sp = Math.sin(cam.pitch);
  let X = x * cy - z * sy;
  let Z = x * sy + z * cy;
  const Y = y * cp - Z * sp;
  Z = y * sp + Z * cp;
  Z += cam.dist;
  const f = Math.min(w, h) * 0.7;
  const depth = Math.max(0.15, Z);
  return {
    x: w / 2 + cam.tx + (X * f) / depth,
    y: h / 2 + cam.ty - (Y * f) / depth,
    z: depth,
    s: Math.max(0.4, f / (depth * 18)),
  };
}

export function bindOrbit(el: HTMLElement, cam: Cam3, onChange: () => void) {
  let dragging = false;
  let mode: "orbit" | "pan" = "orbit";
  let lx = 0, ly = 0;
  const down = (x: number, y: number, pan: boolean) => { dragging = true; mode = pan ? "pan" : "orbit"; lx = x; ly = y; };
  const move = (x: number, y: number) => {
    if (!dragging) return;
    const dx = x - lx, dy = y - ly;
    lx = x; ly = y;
    if (mode === "pan") { cam.tx += dx; cam.ty += dy; }
    else { cam.yaw += dx * 0.01; cam.pitch = Math.max(-1.2, Math.min(1.2, cam.pitch + dy * 0.01)); }
    onChange();
  };
  const up = () => { dragging = false; };
  const onPtr = (e: PointerEvent) => { el.setPointerCapture(e.pointerId); down(e.clientX, e.clientY, e.shiftKey || e.button === 1); };
  const onMove = (e: PointerEvent) => move(e.clientX, e.clientY);
  const onWheel = (e: WheelEvent) => { e.preventDefault(); cam.dist = Math.max(2, Math.min(24, cam.dist + e.deltaY * 0.01)); onChange(); };
  let pinch = 0;
  const onTouch = (e: TouchEvent) => {
    if (e.touches.length === 2) {
      const d = Math.hypot(e.touches[0].clientX - e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
      if (pinch) cam.dist = Math.max(2, Math.min(24, cam.dist * (pinch / d)));
      pinch = d; onChange();
    } else pinch = 0;
  };
  el.addEventListener("pointerdown", onPtr);
  el.addEventListener("pointermove", onMove);
  el.addEventListener("pointerup", up);
  el.addEventListener("pointercancel", up);
  el.addEventListener("wheel", onWheel, { passive: false });
  el.addEventListener("touchmove", onTouch, { passive: true });
  return () => {
    el.removeEventListener("pointerdown", onPtr);
    el.removeEventListener("pointermove", onMove);
    el.removeEventListener("pointerup", up);
    el.removeEventListener("pointercancel", up);
    el.removeEventListener("wheel", onWheel);
    el.removeEventListener("touchmove", onTouch);
  };
}
