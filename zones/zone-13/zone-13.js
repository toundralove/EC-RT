const IMAGE_SOURCES = [
  "./image/SND_01.jpeg",
  "./image/SND_02.jpeg",
  "./image/SND_03.jpeg",
  "./image/SND_04.jpeg",
  "./image/SND_05.jpeg",
  "./image/SND_06.jpeg"
];

const AUDIO_SOURCES = [
  {
    name: "main",
    url: "./audio/SD_01.wav",
    gain: 0.2,
    loop: true,
    playbackRate: 1
  },
  {
    name: "noiseA",
    url: "./audio/SD_02.wav",
    gain: 0.22,
    loop: false,
    playbackRate: 0.96
  },
  {
    name: "noiseB",
    url: "./audio/SD_04.wav",
    gain: 0.2,
    loop: false,
    playbackRate: 0.98
  },
  {
    name: "voice",
    url: "./audio/SD_03.wav",
    gain: 0.18,
    loop: false,
    playbackRate: 1.03
  }
];

const stage = document.getElementById("zone13Stage");
const imageField = document.getElementById("zone13ImageField");
const canvas = document.getElementById("zone13GlitchCanvas");
const activateButton = document.getElementById("soundActivate");

if (!stage || !imageField || !canvas || !activateButton) {
  console.error("Zone 13 : éléments HTML manquants.");
}

const ctx = canvas.getContext("2d");

let floatingImages = [];
let glitchFlash = 0;
let audioStarted = false;

let audioCtx = null;
let masterGain = null;
let analyser = null;
let freqData = null;
let timeData = null;
let audioBuffers = new Map();
let bedSource = null;
let eventTimer = null;

let focusTimer = 0;
let currentChampion = -1;
let phase = "idle";

function clamp(v, min, max) {
  return Math.max(min, Math.min(max, v));
}

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

function resizeCanvas() {
  const rect = imageField.getBoundingClientRect();
  canvas.width = Math.max(1, Math.floor(rect.width));
  canvas.height = Math.max(1, Math.floor(rect.height));
}

function spawnDeathCross(x, y) {
  const count = 1 + (Math.random() > 0.55 ? 1 : 0);

  for (let i = 0; i < count; i++) {
    const cross = document.createElement("div");
    cross.className = "zone13-death-cross";

    const offsetX = -10 + Math.random() * 20;
    const offsetY = -10 + Math.random() * 20;

    cross.style.left = `${x + offsetX}px`;
    cross.style.top = `${y + offsetY}px`;

    imageField.appendChild(cross);

    setTimeout(() => {
      cross.remove();
    }, 12000);
  }
}

function randomProfile() {
  const roll = Math.random();

  if (roll < 0.3) {
    return {
      profile: "fragile",
      maxLife: 0.8 + Math.random() * 0.45,
      decayRate: 0.00018 + Math.random() * 0.00018,
      hitSensitivity: 0.08 + Math.random() * 0.08,
      respawnDelay: 420 + Math.random() * 220,
      motionScale: 1.0 + Math.random() * 0.25,
      presenceBias: 0.02 + Math.random() * 0.08
    };
  }

  if (roll < 0.72) {
    return {
      profile: "medium",
      maxLife: 1.2 + Math.random() * 0.9,
      decayRate: 0.00009 + Math.random() * 0.0001,
      hitSensitivity: 0.035 + Math.random() * 0.04,
      respawnDelay: 620 + Math.random() * 260,
      motionScale: 0.78 + Math.random() * 0.18,
      presenceBias: 0.08 + Math.random() * 0.1
    };
  }

  return {
    profile: "tank",
    maxLife: 2.1 + Math.random() * 1.5,
    decayRate: 0.000035 + Math.random() * 0.00004,
    hitSensitivity: 0.012 + Math.random() * 0.018,
    respawnDelay: 900 + Math.random() * 420,
    motionScale: 0.48 + Math.random() * 0.12,
    presenceBias: 0.16 + Math.random() * 0.18
  };
}

function createArchive(src, w, h) {
  const wrapper = document.createElement("div");
  wrapper.className = "zone13-archive";

  const img = document.createElement("img");
  img.className = "zone13-floating-image";
  img.src = src;
  img.alt = "";

  const vitality = document.createElement("div");
  vitality.className = "zone13-vitality";

  const bar = document.createElement("div");
  bar.className = "zone13-vitality-bar";

  vitality.appendChild(bar);
  wrapper.appendChild(img);
  wrapper.appendChild(vitality);
  imageField.appendChild(wrapper);

  const width = 180 + Math.random() * 240;
  const height = width * (0.75 + Math.random() * 0.4);
  const x = Math.random() * Math.max(40, w - width);
  const y = Math.random() * Math.max(40, h - height);

  wrapper.style.width = `${width}px`;
  wrapper.style.height = `${height}px`;
  wrapper.style.left = `${x}px`;
  wrapper.style.top = `${y}px`;

  const p = randomProfile();
  const depth = Math.random();
  const baseOpacity = 0.42 + Math.random() * 0.28;
  const dominance = Math.random();

  return {
    wrapper,
    img,
    bar,

    homeX: x,
    homeY: y,
    baseX: x,
    baseY: y,

    width,
    height,
    rot: -15 + Math.random() * 30,
    drift: Math.random() * 1000,
    depth,

    profile: p.profile,
    maxLife: p.maxLife,
    life: p.maxLife,
    decayRate: p.decayRate,
    hitSensitivity: p.hitSensitivity,
    respawnDelay: p.respawnDelay,
    motionScale: p.motionScale,
    presenceBias: p.presenceBias,

    dominance,
    prominence: 0.1 + dominance * 0.18,
    visualOpacity: baseOpacity,
    targetOpacity: baseOpacity,

    motionType: Math.floor(Math.random() * 3),
    motionBiasX: 0.5 + Math.random() * 1.8,
    motionBiasY: 0.5 + Math.random() * 1.8,

    rgbOffset: 0,
    jumpX: 0,
    jumpY: 0,
    jumpDecay: 0.84 + Math.random() * 0.08,

    glitchRotation: 0,
    glitchScale: 1,
    glitchBoost: 0,

    deadTime: 0,
    hasSpawnedCross: false
  };
}

function populateImages() {
  imageField.innerHTML = "";
  floatingImages = [];

  const rect = imageField.getBoundingClientRect();
  const selected = shuffle(IMAGE_SOURCES).slice(0, 5);

  selected.forEach((src) => {
    floatingImages.push(createArchive(src, rect.width, rect.height));
  });
}

function forceRoleRedistribution(deadIndex = -1) {
  if (!floatingImages.length) {
    currentChampion = -1;
    return;
  }

  floatingImages.forEach((item, index) => {
    if (index === deadIndex) {
      item.prominence = 0.08;
      return;
    }

    item.prominence += 0.05 + Math.random() * 0.1;

    if (item.profile === "fragile") item.prominence += 0.05;
    if (item.profile === "medium") item.prominence += 0.03;
    if (item.profile === "tank") item.prominence -= 0.01;

    item.prominence = clamp(item.prominence, 0.08, 1);
  });

  let candidatePool = floatingImages
    .map((item, index) => ({ item, index }))
    .filter(({ item, index }) => index !== deadIndex && item.life > 0);

  if (!candidatePool.length) {
    currentChampion = -1;
    return;
  }

  candidatePool.sort((a, b) => {
    const aScore =
      a.item.prominence * 0.7 +
      a.item.presenceBias * 0.8 +
      Math.random() * 0.4;

    const bScore =
      b.item.prominence * 0.7 +
      b.item.presenceBias * 0.8 +
      Math.random() * 0.4;

    return bScore - aScore;
  });

  currentChampion = candidatePool[0].index;
  focusTimer = 80 + Math.floor(Math.random() * 90);
}

function respawnImage(item) {
  const x = Math.random() * Math.max(40, canvas.width - item.width);
  const y = Math.random() * Math.max(40, canvas.height - item.height);
  const p = randomProfile();

  item.homeX = x;
  item.homeY = y;
  item.baseX = x;
  item.baseY = y;

  item.wrapper.style.left = `${x}px`;
  item.wrapper.style.top = `${y}px`;

  item.rot = -20 + Math.random() * 40;
  item.depth = Math.random();

  item.profile = p.profile;
  item.maxLife = p.maxLife;
  item.life = p.maxLife;
  item.decayRate = p.decayRate;
  item.hitSensitivity = p.hitSensitivity;
  item.respawnDelay = p.respawnDelay;
  item.motionScale = p.motionScale;
  item.presenceBias = p.presenceBias;

  item.dominance = Math.random();
  item.prominence = 0.1 + item.dominance * 0.18;

  item.visualOpacity = 0.42 + Math.random() * 0.28;
  item.targetOpacity = item.visualOpacity;

  item.motionType = Math.floor(Math.random() * 3);
  item.motionBiasX = 0.5 + Math.random() * 1.8;
  item.motionBiasY = 0.5 + Math.random() * 1.8;

  item.rgbOffset = 0;
  item.jumpX = 0;
  item.jumpY = 0;
  item.glitchRotation = 0;
  item.glitchScale = 1;
  item.glitchBoost = 0;

  item.deadTime = 0;
  item.hasSpawnedCross = false;
}

async function loadAudioBuffer(url) {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Impossible de charger ${url} (${response.status})`);
  }

  const arrayBuffer = await response.arrayBuffer();
  return await audioCtx.decodeAudioData(arrayBuffer);
}

function getAmplitude() {
  if (!timeData) return 0;

  let sum = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = (timeData[i] - 128) / 128;
    sum += Math.abs(v);
  }
  return sum / timeData.length;
}

function getBandAverage(start, end) {
  if (!freqData) return 0;

  const max = Math.min(end, freqData.length);
  let sum = 0;
  let count = 0;

  for (let i = start; i < max; i++) {
    sum += freqData[i];
    count++;
  }

  return count ? (sum / count) / 255 : 0;
}

function getTransient() {
  if (!timeData) return 0;

  let peak = 0;
  for (let i = 0; i < timeData.length; i++) {
    const v = Math.abs((timeData[i] - 128) / 128);
    if (v > peak) peak = v;
  }
  return peak;
}

function updateAudioState() {
  if (!audioStarted || !analyser) {
    return {
      amplitude: 0,
      bass: 0,
      mids: 0,
      highs: 0,
      transient: 0
    };
  }

  analyser.getByteFrequencyData(freqData);
  analyser.getByteTimeDomainData(timeData);

  return {
    amplitude: getAmplitude(),
    bass: getBandAverage(0, 12),
    mids: getBandAverage(12, 80),
    highs: getBandAverage(80, 180),
    transient: getTransient()
  };
}

function updatePhase(audioState) {
  if (!audioStarted) {
    phase = "idle";
    return;
  }

  const energy =
    audioState.amplitude * 0.75 +
    audioState.bass * 0.6 +
    audioState.highs * 0.45 +
    audioState.transient * 0.95;

  if (energy < 0.16) {
    phase = "wake";
  } else if (energy < 0.38) {
    phase = "activation";
  } else {
    phase = "ruin";
  }
}

function applySoundDamage(item, audioState) {
  if (!audioStarted) return;

  const soundForce =
    audioState.transient * 1.05 +
    audioState.highs * 0.55 +
    audioState.bass * 0.32;

  if (soundForce <= 0.045) return;

  item.life -= item.decayRate * soundForce * (5.6 + item.hitSensitivity * 12);
  item.life = clamp(item.life, 0, item.maxLife);
}

function chooseChampion(audioState) {
  if (!audioStarted || floatingImages.length === 0) return;

  focusTimer -= 1;

  const strongMoment =
    audioState.transient > 0.52 ||
    audioState.highs > 0.26 ||
    audioState.bass > 0.18;

  if (focusTimer > 0 && !strongMoment) return;

  let bestIndex = 0;
  let bestScore = -Infinity;

  floatingImages.forEach((item, index) => {
    if (item.life <= 0) return;

    const lifeRatio = item.maxLife > 0 ? item.life / item.maxLife : 0;

    const score =
      item.dominance * 0.55 +
      item.presenceBias * 1.3 +
      item.prominence * 0.9 +
      lifeRatio * 0.18 +
      (item.profile === "fragile" ? 0.08 : 0) +
      Math.random() * 0.28;

    if (score > bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  currentChampion = bestIndex;
  focusTimer = 120 + Math.floor(Math.random() * 150);
}

function triggerEmergence(audioState) {
  if (!audioStarted) return;

  const impulse =
    audioState.transient > 0.64 ||
    audioState.highs > 0.34 ||
    audioState.bass > 0.24;

  if (!impulse) return;
  if (Math.random() > 0.24) return;

  glitchFlash = Math.min(1, glitchFlash + 0.95);

  const count = 1 + Math.floor(Math.random() * 2);

  for (let i = 0; i < count; i++) {
    const target = floatingImages[Math.floor(Math.random() * floatingImages.length)];
    if (!target) continue;

    const hit =
      target.profile === "fragile"
        ? 0.08 + Math.random() * 0.12
        : target.profile === "medium"
        ? 0.04 + Math.random() * 0.08
        : 0.018 + Math.random() * 0.045;

    target.jumpX += (-320 + Math.random() * 640) * (0.75 + audioState.highs);
    target.jumpY += (-190 + Math.random() * 380) * (0.7 + audioState.transient);
    target.rgbOffset = 24 + Math.random() * 42;
    target.glitchRotation = -18 + Math.random() * 36;
    target.glitchScale = 0.72 + Math.random() * 0.46;
    target.glitchBoost = 1;

    target.life -= hit * (0.95 + target.hitSensitivity * 5.4);
    target.life = clamp(target.life, 0, target.maxLife);
  }
}

function updatePresence(audioState) {
  const energy =
    audioState.transient * 1.1 +
    audioState.highs * 0.7 +
    audioState.bass * 0.45;

  floatingImages.forEach((item, index) => {
    const lifeRatio = item.maxLife > 0 ? item.life / item.maxLife : 0;
    const championBoost = index === currentChampion ? 0.48 : 0;
    const rivalryBoost =
      audioStarted && currentChampion !== -1 && index !== currentChampion
        ? Math.max(
            0,
            0.16 - Math.abs(item.prominence - floatingImages[currentChampion].prominence) * 0.12
          )
        : 0;

    const phaseBoost =
      phase === "idle"
        ? 0.02
        : phase === "wake"
        ? 0.06
        : phase === "activation"
        ? 0.13
        : 0.18;

    const deathFloor =
      audioStarted
        ? 0.34 + item.presenceBias * 0.55 + (item.profile === "tank" ? 0.05 : 0)
        : 0.44;

    item.prominence +=
      item.dominance * 0.015 +
      championBoost * 0.055 +
      rivalryBoost * 0.03 +
      energy * 0.01 -
      0.01;

    if (item.life <= 0) {
      item.prominence *= 0.94;
    }

    item.prominence = clamp(item.prominence, 0.08, 1);

    item.targetOpacity = clamp(
      deathFloor +
        item.prominence * 0.3 +
        phaseBoost +
        championBoost * 0.12 +
        lifeRatio * 0.03,
      0.28,
      1
    );

    item.visualOpacity += (item.targetOpacity - item.visualOpacity) * 0.05;

    const z =
      2 +
      Math.floor(item.prominence * 9 + item.depth * 4 + (index === currentChampion ? 6 : 0));
    item.wrapper.style.zIndex = String(z);
  });
}

function renderImages(audioState, time) {
  const t = time * 0.001;
  const globalSwing = Math.sin(t * 0.22) * (audioState.bass * 40);

  floatingImages.forEach((item, i) => {
    applySoundDamage(item, audioState);

    item.jumpX *= item.jumpDecay;
    item.jumpY *= item.jumpDecay;
    item.rgbOffset *= 0.88;
    item.glitchBoost *= 0.82;
    item.glitchRotation *= 0.8;
    item.glitchScale += (1 - item.glitchScale) * 0.11;

    let driftX = 0;
    let driftY = 0;

    const motionAmp = item.motionScale * (1 + item.prominence * 0.22);
    const driftAmount = audioStarted ? 0.34 + audioState.amplitude * 1.2 : 0.65;

    if (item.motionType === 0) {
      driftX =
        Math.sin(t * (0.25 + item.depth * 0.6) + item.drift) *
        (audioState.bass * 145 * item.motionBiasX * motionAmp * driftAmount);

      driftY =
        Math.cos(t * (0.2 + item.depth * 0.5) + item.drift * 0.7) *
        (audioState.mids * 95 * item.motionBiasY * motionAmp * driftAmount);
    }

    if (item.motionType === 1) {
      driftX =
        Math.sin(t * (1.1 + item.depth) + item.drift) *
        (audioState.highs * 105 * item.motionBiasX * motionAmp * driftAmount);

      driftY =
        Math.cos(t * (0.92 + item.depth) + item.drift * 0.8) *
        (audioState.transient * 120 * item.motionBiasY * motionAmp * driftAmount);
    }

    if (item.motionType === 2) {
      driftX =
        Math.sin(t * (0.56 + item.depth) + item.drift) *
        (audioState.amplitude * 165 * item.motionBiasX * motionAmp * driftAmount);

      driftY =
        Math.cos(t * (0.43 + item.depth) + item.drift * 0.4) *
        ((audioState.bass * 75 + audioState.mids * 55) * item.motionBiasY * motionAmp * driftAmount);
    }

    if (!audioStarted) {
      driftX *= 0.18;
      driftY *= 0.18;
    }

    if (audioStarted && item.life <= 0) {
      if (!item.hasSpawnedCross) {
        spawnDeathCross(
          item.baseX + item.width * 0.5,
          item.baseY + item.height * 0.5
        );
        item.hasSpawnedCross = true;

        if (currentChampion === i) {
          forceRoleRedistribution(i);
        } else {
          item.prominence = 0.08;
          focusTimer = 0;
        }
      }

      item.deadTime += 1;

      if (item.deadTime > item.respawnDelay) {
        respawnImage(item);
        focusTimer = 0;
      }
    } else {
      item.deadTime = 0;
    }

    const x = item.baseX + driftX + item.jumpX + globalSwing * (0.12 + item.depth);
    const y = item.baseY + driftY + item.jumpY;

    const deathRatio = item.maxLife > 0 ? item.life / item.maxLife : 0;
    const championBoost = i === currentChampion ? 0.08 : 0;

    const rot =
      item.rot +
      Math.sin(t * 0.9 + i) * (audioStarted ? 2.2 : 3) +
      item.jumpX * 0.03 +
      item.glitchRotation * item.glitchBoost;

    let scale =
      1 +
      Math.sin(t * 0.8 + i) * 0.012 +
      (audioStarted ? audioState.bass * 0.028 : 0) +
      (item.glitchScale - 1) * item.glitchBoost +
      item.prominence * 0.03 +
      championBoost;

    if (item.profile === "tank") scale += 0.018;
    if (item.profile === "fragile") scale -= 0.006;

    item.wrapper.style.transform = `
      translate(${x - item.homeX}px, ${y - item.homeY}px)
      rotate(${rot}deg)
      scale(${scale})
    `;

    item.wrapper.style.opacity = item.visualOpacity;

    const contrast =
      (audioStarted ? 1.02 : 1) +
      (1 - deathRatio) * 0.95 +
      audioState.highs * 0.34 +
      item.prominence * 0.24 +
      championBoost * 0.46;

    const brightness =
      (audioStarted ? 0.78 : 0.95) +
      deathRatio * 0.14 +
      audioState.amplitude * 0.08 +
      item.presenceBias * 0.12 +
      championBoost * 0.08;

    const saturate =
      (audioStarted ? 0.26 : 0.92) +
      deathRatio * 0.3 +
      audioState.mids * 0.18 +
      item.prominence * 0.12;

    const blur =
      audioStarted
        ? (1 - deathRatio) * 1.35 + audioState.highs * 0.5 + (item.profile === "fragile" ? 0.24 : 0)
        : 0;

    item.img.style.filter = `
      contrast(${contrast})
      brightness(${brightness})
      saturate(${saturate})
      blur(${blur}px)
    `;

    if (audioStarted && item.rgbOffset > 0.5) {
      item.img.style.boxShadow = `
        ${item.rgbOffset}px 0 0 rgba(255,0,0,0.32),
        ${-item.rgbOffset}px 0 0 rgba(0,180,255,0.32),
        0 18px 42px rgba(0,0,0,0.42)
      `;
    } else {
      item.img.style.boxShadow = `0 18px 42px rgba(0,0,0,0.35)`;
    }

    const vitalityScale = item.maxLife > 0 ? item.life / item.maxLife : 0;
    item.bar.style.transform = `scaleX(${clamp(vitalityScale, 0, 1)})`;
    item.bar.style.opacity = audioStarted
      ? String(clamp(0.25 + vitalityScale * 0.75, 0.15, 1))
      : "1";
  });
}

function renderGlitch(audioState) {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  glitchFlash *= 0.86;

  const alphaBase = audioStarted
    ? audioState.highs * 0.16 + glitchFlash * 0.34
    : 0.01;

  const strips = audioStarted
    ? 2 + Math.floor(audioState.highs * 6 + glitchFlash * 16)
    : 3;

  for (let i = 0; i < strips; i++) {
    const y = Math.random() * canvas.height;
    const h = audioStarted
      ? 1 + Math.random() * (14 + audioState.mids * 20)
      : 1 + Math.random() * 4;

    const alpha = audioStarted
      ? 0.004 + Math.random() * (alphaBase * 0.55)
      : 0.004 + Math.random() * 0.008;

    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, y, canvas.width, h);
  }

  if (audioStarted && (audioState.transient > 0.74 || glitchFlash > 0.68)) {
    ctx.fillStyle = `rgba(255,255,255,${0.04 + glitchFlash * 0.09})`;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
}

function playOneShot(name) {
  const item = audioBuffers.get(name);
  if (!item || !audioCtx || !masterGain) return;

  const source = audioCtx.createBufferSource();
  source.buffer = item.buffer;
  source.loop = false;
  source.playbackRate.value = item.playbackRate + (-0.05 + Math.random() * 0.1);

  const gainNode = audioCtx.createGain();
  gainNode.gain.value = item.gain * (0.75 + Math.random() * 0.5);

  source.connect(gainNode);
  gainNode.connect(masterGain);
  source.start();
}

function scheduleEvents() {
  clearTimeout(eventTimer);

  if (!audioStarted) return;

  const eventNames = ["noiseA", "noiseB", "voice"].filter((name) =>
    audioBuffers.has(name)
  );

  if (!eventNames.length) return;

  const delay = 6200 + Math.random() * 11000;

  eventTimer = setTimeout(() => {
    if (!audioStarted) return;

    if (Math.random() > 0.55) {
      const name = eventNames[Math.floor(Math.random() * eventNames.length)];
      playOneShot(name);
      glitchFlash = Math.min(1, glitchFlash + 0.38);
      focusTimer = 0;
    }

    scheduleEvents();
  }, delay);
}

async function initAudio() {
  if (audioStarted) return;

  try {
    activateButton.textContent = "LOADING...";
    activateButton.disabled = true;

    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    await audioCtx.resume();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.9;

    analyser = audioCtx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.86;

    masterGain.connect(analyser);
    analyser.connect(audioCtx.destination);

    freqData = new Uint8Array(analyser.frequencyBinCount);
    timeData = new Uint8Array(analyser.fftSize);

    audioBuffers.clear();

    for (const item of AUDIO_SOURCES) {
      const buffer = await loadAudioBuffer(item.url);
      audioBuffers.set(item.name, { ...item, buffer });
    }

    const main = audioBuffers.get("main");
    if (!main) {
      throw new Error("Fichier audio principal introuvable.");
    }

    bedSource = audioCtx.createBufferSource();
    bedSource.buffer = main.buffer;
    bedSource.loop = true;
    bedSource.playbackRate.value = main.playbackRate;

    const bedGain = audioCtx.createGain();
    bedGain.gain.value = main.gain;

    bedSource.connect(bedGain);
    bedGain.connect(masterGain);
    bedSource.start(0);

    audioStarted = true;
    phase = "wake";
    stage.classList.add("is-active");
    activateButton.textContent = "TRANSMISSION ACTIVE";
    activateButton.classList.add("is-active");

    scheduleEvents();
  } catch (error) {
    console.error("Erreur audio Zone 13 :", error);
    activateButton.textContent = "SOUND ERROR";
    activateButton.disabled = false;
  }
}

function animate(time = 0) {
  requestAnimationFrame(animate);

  const audioState = updateAudioState();
  updatePhase(audioState);
  chooseChampion(audioState);
  triggerEmergence(audioState);
  updatePresence(audioState);
  renderImages(audioState, time);
  renderGlitch(audioState);
}

function initZone13() {
  resizeCanvas();
  populateImages();
  animate();

  window.addEventListener("resize", () => {
    resizeCanvas();
    populateImages();
  });

  activateButton.addEventListener("click", initAudio);
}

initZone13();