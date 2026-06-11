import { clamp } from "./math.js";

const INPUT_TAGS = new Set(["BUTTON", "INPUT", "TEXTAREA", "SELECT"]);

export class Input {
  constructor(target = window) {
    this.target = target;
    this.keys = new Set();
    this.jumpQueued = false;
    this.restartQueued = false;
    this.pointerDown = false;
    this.pointerStart = { x: 0, y: 0, time: 0 };
    this.pointerCurrent = { x: 0, y: 0 };
    this.touchSteer = 0;
    this.touchBoost = false;

    window.addEventListener("keydown", (event) => this.onKeyDown(event));
    window.addEventListener("keyup", (event) => this.onKeyUp(event));
    window.addEventListener("pointerdown", (event) => this.onPointerDown(event));
    window.addEventListener("pointermove", (event) => this.onPointerMove(event));
    window.addEventListener("pointerup", (event) => this.onPointerUp(event));
    window.addEventListener("pointercancel", () => this.cancelPointer());
  }

  onKeyDown(event) {
    if (event.repeat) return;
    this.keys.add(event.code);
    if (event.code === "Space") {
      event.preventDefault();
      this.jumpQueued = true;
    }
    if (event.code === "KeyR" || event.code === "Enter") {
      this.restartQueued = true;
    }
  }

  onKeyUp(event) {
    this.keys.delete(event.code);
  }

  onPointerDown(event) {
    if (INPUT_TAGS.has(event.target.tagName)) return;
    this.pointerDown = true;
    this.pointerStart = { x: event.clientX, y: event.clientY, time: performance.now() };
    this.pointerCurrent = { x: event.clientX, y: event.clientY };
    this.touchSteer = 0;
    this.touchBoost = false;
  }

  onPointerMove(event) {
    if (!this.pointerDown) return;
    this.pointerCurrent = { x: event.clientX, y: event.clientY };
    const dx = this.pointerCurrent.x - this.pointerStart.x;
    const dy = this.pointerCurrent.y - this.pointerStart.y;
    this.touchSteer = clamp(dx / 110, -1, 1);
    this.touchBoost = dy < -42 || performance.now() - this.pointerStart.time > 420;
  }

  onPointerUp(event) {
    if (!this.pointerDown) return;
    const dx = event.clientX - this.pointerStart.x;
    const dy = event.clientY - this.pointerStart.y;
    const age = performance.now() - this.pointerStart.time;
    if (Math.hypot(dx, dy) < 18 && age < 260) {
      this.jumpQueued = true;
    }
    this.cancelPointer();
  }

  cancelPointer() {
    this.pointerDown = false;
    this.touchSteer = 0;
    this.touchBoost = false;
  }

  get steer() {
    let value = 0;
    if (this.keys.has("KeyA") || this.keys.has("ArrowLeft")) value -= 1;
    if (this.keys.has("KeyD") || this.keys.has("ArrowRight")) value += 1;
    return clamp(value + this.touchSteer, -1, 1);
  }

  get boost() {
    return this.keys.has("KeyW") || this.keys.has("ArrowUp") || this.touchBoost;
  }

  get brake() {
    return this.keys.has("KeyS") || this.keys.has("ArrowDown");
  }

  consumeJump() {
    const queued = this.jumpQueued;
    this.jumpQueued = false;
    return queued;
  }

  consumeRestart() {
    const queued = this.restartQueued;
    this.restartQueued = false;
    return queued;
  }
}
