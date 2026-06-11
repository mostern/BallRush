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
    this.avalancheMeter = document.querySelector("#avalancheMeter");
    this.avalancheText = document.querySelector("#avalancheText");
    this.avalancheFill = document.querySelector("#avalancheFill");
    this.comboValue = document.querySelector("#comboValue");
    this.shieldChip = document.querySelector("#shieldChip");
    this.shieldValue = document.querySelector("#shieldValue");
    this.magnetChip = document.querySelector("#magnetChip");
    this.magnetValue = document.querySelector("#magnetValue");
    this.overlay = document.querySelector("#overlay");
    this.runSummary = document.querySelector("#runSummary");
    this.startRunButton = document.querySelector("#startRunButton");
    this.dailyRunButton = document.querySelector("#dailyRunButton");
    this.skinSelector = document.querySelector("#skinSelector");
  }

  bind({ onStartRun, onDailyRun, onSkinSelect }) {
    this.startRunButton.addEventListener("click", onStartRun);
    this.dailyRunButton.addEventListener("click", onDailyRun);
    this.skinSelector.addEventListener("click", (event) => {
      const button = event.target.closest("[data-skin-id]");
      if (!button) return;
      onSkinSelect(button.dataset.skinId);
    });
  }

  renderSkins(skins, selectedSkin) {
    this.skinSelector.innerHTML = skins
      .map(
        (skin) => `
          <button
            class="skin-button"
            type="button"
            data-skin-id="${skin.id}"
            title="${skin.label}"
            aria-label="${skin.label}"
            aria-pressed="${skin.id === selectedSkin}"
          >
            <span class="skin-swatch" style="--skin-color: #${skin.color.toString(16).padStart(6, "0")}; --skin-accent: #${skin.accent.toString(16).padStart(6, "0")}"></span>
          </button>
        `
      )
      .join("");
    this.setSelectedSkin(selectedSkin);
  }

  setSelectedSkin(selectedSkin) {
    this.skinSelector.querySelectorAll("[data-skin-id]").forEach((button) => {
      const active = button.dataset.skinId === selectedSkin;
      button.classList.toggle("is-active", active);
      button.setAttribute("aria-pressed", String(active));
    });
  }

  showMenu(bestScore = 0) {
    this.overlay.classList.add("is-visible");
    this.runSummary.innerHTML = `<span>Best score</span><strong>${formatNumber(bestScore)}</strong>`;
    this.startRunButton.textContent = "Start Run";
    this.dailyRunButton.textContent = "Daily Mountain";
  }

  showRun(seed, ghostStatus = { active: false }) {
    this.seedLabel.textContent = ghostStatus.active ? `${seed} / ghost active` : seed;
    this.overlay.classList.remove("is-visible");
  }

  showGameOver(reason, snapshot) {
    this.overlay.classList.add("is-visible");
    this.startRunButton.textContent = "Restart";
    this.dailyRunButton.textContent = "Daily Mountain";
    const label = snapshot.newBest ? `New best / ${reason}` : reason;
    this.runSummary.innerHTML = `
      <span>${label}</span>
      <strong>${formatNumber(snapshot.score)}</strong>
      <dl>
        <div><dt>Distance</dt><dd>${formatNumber(snapshot.distance)} m</dd></div>
        <div><dt>Max speed</dt><dd>${formatNumber(snapshot.maxSpeed)}</dd></div>
        <div><dt>Crystals</dt><dd>${formatNumber(snapshot.crystals)}</dd></div>
        <div><dt>Longest combo</dt><dd>${formatNumber(snapshot.longestCombo)}</dd></div>
        <div><dt>Airtime</dt><dd>${snapshot.airtime.toFixed(1)} s</dd></div>
        <div><dt>Perfect landings</dt><dd>${formatNumber(snapshot.perfectLandings)}</dd></div>
        <div><dt>Gates</dt><dd>${formatNumber(snapshot.checkpoints)}</dd></div>
        <div><dt>Gate streak</dt><dd>${formatNumber(snapshot.longestCheckpointStreak)}</dd></div>
        <div><dt>Ghost</dt><dd>${this.getGhostLabel(snapshot)}</dd></div>
      </dl>
    `;
  }

  getGhostLabel(snapshot) {
    if (snapshot.ghostSaved) return "Saved";
    if (snapshot.ghostActive) return "Raced";
    return "None";
  }

  update(snapshot, ball, avalanche = { active: false, danger: 0, gap: 0 }) {
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
    this.magnetValue.textContent = ball.magnetTimer > 0 ? ball.magnetTimer.toFixed(1) : "0.0";
    this.magnetChip.classList.toggle("is-active", ball.magnetTimer > 0);
    this.avalancheMeter.classList.toggle("is-active", avalanche.active);
    this.avalancheFill.style.transform = `scaleX(${Math.max(0, Math.min(1, avalanche.danger || 0))})`;
    this.avalancheText.textContent = avalanche.active ? `${Math.max(0, Math.floor(avalanche.gap))} m` : "Clear";
  }
}
