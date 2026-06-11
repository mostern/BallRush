import { CONFIG } from "../config.js";
import { formatNumber } from "../game/math.js";

export class HUD {
  constructor() {
    this.seedLabel = document.querySelector("#seedLabel");
    this.scoreValue = document.querySelector("#scoreValue");
    this.distanceValue = document.querySelector("#distanceValue");
    this.speedValue = document.querySelector("#speedValue");
    this.bestValue = document.querySelector("#bestValue");
    this.flowText = document.querySelector("#flowText");
    this.flowFill = document.querySelector("#flowFill");
    this.comboValue = document.querySelector("#comboValue");
    this.shieldChip = document.querySelector("#shieldChip");
    this.shieldValue = document.querySelector("#shieldValue");
    this.overlay = document.querySelector("#overlay");
    this.runSummary = document.querySelector("#runSummary");
    this.startRunButton = document.querySelector("#startRunButton");
    this.dailyRunButton = document.querySelector("#dailyRunButton");
  }

  bind({ onStartRun, onDailyRun }) {
    this.startRunButton.addEventListener("click", onStartRun);
    this.dailyRunButton.addEventListener("click", onDailyRun);
  }

  showMenu(bestScore = 0) {
    this.overlay.classList.add("is-visible");
    this.runSummary.innerHTML = `<span>Best score</span><strong>${formatNumber(bestScore)}</strong>`;
    this.startRunButton.textContent = "Start Run";
    this.dailyRunButton.textContent = "Daily Mountain";
  }

  showRun(seed) {
    this.seedLabel.textContent = seed;
    this.overlay.classList.remove("is-visible");
  }

  showGameOver(reason, snapshot) {
    this.overlay.classList.add("is-visible");
    this.startRunButton.textContent = "Restart";
    this.dailyRunButton.textContent = "Daily Mountain";
    const label = snapshot.newBest ? "New best" : reason;
    this.runSummary.innerHTML = `
      <span>${label}</span>
      <strong>${formatNumber(snapshot.score)}</strong>
      <dl>
        <div><dt>Distance</dt><dd>${formatNumber(snapshot.distance)} m</dd></div>
        <div><dt>Max speed</dt><dd>${formatNumber(snapshot.maxSpeed)}</dd></div>
        <div><dt>Crystals</dt><dd>${formatNumber(snapshot.crystals)}</dd></div>
        <div><dt>Longest combo</dt><dd>${formatNumber(snapshot.longestCombo)}</dd></div>
      </dl>
    `;
  }

  update(snapshot, ball) {
    this.scoreValue.textContent = formatNumber(snapshot.score);
    this.distanceValue.textContent = `${formatNumber(snapshot.distance)} m`;
    this.speedValue.textContent = String(Math.floor(ball.speed));
    this.bestValue.textContent = formatNumber(snapshot.bestScore);
    const flowPercent = snapshot.flowActive ? snapshot.flowTimer / CONFIG.flowDuration : snapshot.flow / CONFIG.flowMax;
    this.flowFill.style.transform = `scaleX(${Math.max(0, Math.min(1, flowPercent))})`;
    this.flowFill.classList.toggle("is-hot", snapshot.flowActive);
    this.flowText.textContent = snapshot.flowActive ? `${snapshot.flowTimer.toFixed(1)}s` : `${Math.floor(snapshot.flow)}%`;
    this.comboValue.textContent = `${snapshot.multiplier}x`;
    this.shieldValue.textContent = String(ball.shields);
    this.shieldChip.classList.toggle("is-active", ball.shields > 0);
  }
}
