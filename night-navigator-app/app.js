(() => {
  "use strict";

  const STORAGE_KEY = "nightNavigator.v1";
  const DEFAULT_LOCATION = { lat: 45.0703, lon: 7.6869, label: "Torino · posizione predefinita" };
  const TOPICS = {
    ursa: { label: "Orsa Maggiore", copy: "Impara a riconoscere il Grande Carro in qualunque orientamento." },
    cassiopeia: { label: "Cassiopea", copy: "Ritrova la caratteristica forma a W dall’altra parte di Polaris." },
    polaris: { label: "Stella Polare", copy: "Usa Merak e Dubhe come puntatori per raggiungere il Nord." },
    triangle: { label: "Triangolo estivo", copy: "Collega Vega, Deneb e Altair per orientarti nel cielo estivo." }
  };

  const STAR_CATALOG = [
    { id: "polaris", name: "Polaris", constellation: "Orsa Minore", ra: 2.5303, dec: 89.264, mag: 1.98 },
    { id: "kochab", name: "Kochab", constellation: "Orsa Minore", ra: 14.8451, dec: 74.155, mag: 2.08 },
    { id: "pherkad", name: "Pherkad", constellation: "Orsa Minore", ra: 15.3455, dec: 71.834, mag: 3.05 },
    { id: "yildun", name: "Yildun", constellation: "Orsa Minore", ra: 17.5369, dec: 86.586, mag: 4.36 },
    { id: "epsilon-umi", name: "ε Ursae Minoris", constellation: "Orsa Minore", ra: 16.7662, dec: 82.037, mag: 4.23 },
    { id: "zeta-umi", name: "ζ Ursae Minoris", constellation: "Orsa Minore", ra: 15.7343, dec: 77.794, mag: 4.32 },
    { id: "eta-umi", name: "η Ursae Minoris", constellation: "Orsa Minore", ra: 16.2918, dec: 75.755, mag: 4.95 },
    { id: "dubhe", name: "Dubhe", constellation: "Orsa Maggiore", ra: 11.0621, dec: 61.751, mag: 1.79 },
    { id: "merak", name: "Merak", constellation: "Orsa Maggiore", ra: 11.0307, dec: 56.382, mag: 2.37 },
    { id: "phecda", name: "Phecda", constellation: "Orsa Maggiore", ra: 11.8972, dec: 53.695, mag: 2.44 },
    { id: "megrez", name: "Megrez", constellation: "Orsa Maggiore", ra: 12.2571, dec: 57.033, mag: 3.31 },
    { id: "alioth", name: "Alioth", constellation: "Orsa Maggiore", ra: 12.9005, dec: 55.96, mag: 1.77 },
    { id: "mizar", name: "Mizar", constellation: "Orsa Maggiore", ra: 13.3987, dec: 54.925, mag: 2.23 },
    { id: "alkaid", name: "Alkaid", constellation: "Orsa Maggiore", ra: 13.7923, dec: 49.313, mag: 1.86 },
    { id: "caph", name: "Caph", constellation: "Cassiopea", ra: 0.1529, dec: 59.15, mag: 2.27 },
    { id: "schedar", name: "Schedar", constellation: "Cassiopea", ra: 0.6751, dec: 56.537, mag: 2.24 },
    { id: "gamma-cas", name: "Navi", constellation: "Cassiopea", ra: 0.9451, dec: 60.717, mag: 2.15 },
    { id: "ruchbah", name: "Ruchbah", constellation: "Cassiopea", ra: 1.4303, dec: 60.235, mag: 2.68 },
    { id: "segin", name: "Segin", constellation: "Cassiopea", ra: 1.9066, dec: 63.67, mag: 3.35 },
    { id: "deneb", name: "Deneb", constellation: "Cigno", ra: 20.6905, dec: 45.28, mag: 1.25 },
    { id: "sadr", name: "Sadr", constellation: "Cigno", ra: 20.3705, dec: 40.256, mag: 2.23 },
    { id: "gienah", name: "Gienah", constellation: "Cigno", ra: 20.7701, dec: 33.97, mag: 2.48 },
    { id: "delta-cyg", name: "Delta Cygni", constellation: "Cigno", ra: 19.7496, dec: 45.13, mag: 2.87 },
    { id: "albireo", name: "Albireo", constellation: "Cigno", ra: 19.512, dec: 27.96, mag: 3.05 },
    { id: "vega", name: "Vega", constellation: "Lira", ra: 18.6156, dec: 38.78, mag: 0.03 },
    { id: "sheliak", name: "Sheliak", constellation: "Lira", ra: 18.8347, dec: 33.36, mag: 3.52 },
    { id: "sulafat", name: "Sulafat", constellation: "Lira", ra: 18.9824, dec: 32.689, mag: 3.25 },
    { id: "altair", name: "Altair", constellation: "Aquila", ra: 19.8464, dec: 8.868, mag: 0.77 },
    { id: "tarazed", name: "Tarazed", constellation: "Aquila", ra: 19.7709, dec: 10.613, mag: 2.72 },
    { id: "alshain", name: "Alshain", constellation: "Aquila", ra: 19.9219, dec: 6.407, mag: 3.71 },
    { id: "arcturus", name: "Arturo", constellation: "Boote", ra: 14.261, dec: 19.182, mag: -0.05 },
    { id: "capella", name: "Capella", constellation: "Auriga", ra: 5.2782, dec: 45.998, mag: 0.08 }
  ];

  const CONSTELLATION_LINES = [
    ["polaris", "yildun", "epsilon-umi", "zeta-umi", "eta-umi", "pherkad", "kochab", "zeta-umi"],
    ["dubhe", "merak", "phecda", "megrez", "dubhe"],
    ["megrez", "alioth", "mizar", "alkaid"],
    ["caph", "schedar", "gamma-cas", "ruchbah", "segin"],
    ["delta-cyg", "sadr", "gienah"],
    ["deneb", "sadr", "albireo"],
    ["vega", "sheliak", "sulafat"],
    ["tarazed", "altair", "alshain"]
  ];

  const QUIZ_SHAPES = {
    ursa: {
      points: [[.12,.43],[.31,.63],[.55,.57],[.58,.33],[.36,.25],[.69,.27],[.83,.18],[.94,.26]],
      lines: [[0,1,2,3,4,1],[3,5,6,7]]
    },
    cassiopeia: {
      points: [[.09,.35],[.29,.58],[.5,.31],[.71,.59],[.92,.34]],
      lines: [[0,1,2,3,4]]
    },
    polaris: {
      points: [[.13,.36],[.32,.57],[.54,.55],[.6,.32],[.41,.24],[.72,.23],[.84,.15],[.94,.24]],
      lines: [[0,1,2,3,4,1],[3,5,6,7]], highlight: 0
    },
    cygnus: {
      points: [[.5,.1],[.5,.37],[.5,.9],[.15,.52],[.86,.51]],
      lines: [[0,1,2],[3,1,4]]
    },
    triangle: {
      points: [[.5,.1],[.12,.83],[.88,.75]],
      lines: [[0,1,2,0]]
    }
  };

  const QUESTIONS = [
    { type: "shape", shape: "ursa", prompt: "Quale figura stai osservando?", options: ["Orsa Maggiore", "Cassiopea", "Cigno", "Lira"], answer: "Orsa Maggiore", topic: "ursa", hint: "Cerca il recipiente e il lungo manico del Grande Carro.", explanation: "È il Grande Carro, la parte più riconoscibile dell’Orsa Maggiore." },
    { type: "shape", shape: "cassiopeia", prompt: "Quale costellazione forma questa W?", options: ["Cassiopea", "Orsa Minore", "Aquila", "Boote"], answer: "Cassiopea", topic: "cassiopeia", hint: "È circumpolare e si trova dalla parte opposta del Grande Carro rispetto a Polaris.", explanation: "Cassiopea si riconosce dalle cinque stelle disposte a W o M." },
    { type: "shape", shape: "polaris", prompt: "Quale stella evidenziata chiude il Piccolo Carro?", options: ["Polaris", "Vega", "Deneb", "Capella"], answer: "Polaris", topic: "polaris", hint: "È vicinissima al Polo Nord celeste.", explanation: "Polaris si trova all’estremità del timone del Piccolo Carro." },
    { type: "shape", shape: "cygnus", prompt: "Questa croce nel cielo è…", options: ["Il Cigno", "Cassiopea", "L’Orsa Maggiore", "L’Aquila"], answer: "Il Cigno", topic: "triangle", hint: "La stella più luminosa in alto è Deneb.", explanation: "Il Cigno è noto anche come Croce del Nord; Deneb è uno dei vertici del Triangolo estivo." },
    { type: "concept", shape: "ursa", prompt: "Quali stelle del Grande Carro puntano verso Polaris?", options: ["Merak e Dubhe", "Mizar e Alkaid", "Vega e Deneb", "Caph e Schedar"], answer: "Merak e Dubhe", topic: "ursa", hint: "Sono le due stelle sul lato esterno del recipiente.", explanation: "Prolunga la linea Merak–Dubhe per circa cinque volte: arriverai vicino a Polaris." },
    { type: "concept", shape: "cassiopeia", prompt: "Quale forma rende Cassiopea facile da riconoscere?", options: ["Una W", "Un triangolo", "Un quadrato", "Un cerchio"], answer: "Una W", topic: "cassiopeia", hint: "A seconda dell’orientamento può sembrare anche una M.", explanation: "Le cinque stelle principali di Cassiopea disegnano una W molto evidente." },
    { type: "concept", shape: "polaris", prompt: "Che direzione indica approssimativamente Polaris?", options: ["Nord", "Sud", "Est", "Ovest"], answer: "Nord", topic: "polaris", hint: "È quasi immobile mentre il cielo sembra ruotarle attorno.", explanation: "Polaris è vicina al Polo Nord celeste e indica il Nord geografico con buona approssimazione." },
    { type: "concept", shape: "triangle", prompt: "Quali stelle formano il Triangolo estivo?", options: ["Vega, Deneb e Altair", "Polaris, Dubhe e Merak", "Capella, Arturo e Vega", "Deneb, Sadr e Albireo"], answer: "Vega, Deneb e Altair", topic: "triangle", hint: "Appartengono rispettivamente a Lira, Cigno e Aquila.", explanation: "Vega, Deneb e Altair formano un grande triangolo visibile nelle sere estive." }
  ];

  const $ = id => document.getElementById(id);
  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const toRad = degrees => degrees * Math.PI / 180;
  const toDeg = radians => radians * 180 / Math.PI;
  const normalize360 = degrees => ((degrees % 360) + 360) % 360;

  function blankTopicStats() {
    return Object.fromEntries(Object.keys(TOPICS).map(key => [key, { attempts: 0, correct: 0 }]));
  }

  function defaultState() {
    return {
      location: { ...DEFAULT_LOCATION },
      settings: { lines: true, red: false },
      stats: { attempts: 0, correct: 0, topics: blankTopicStats(), nights: [] }
    };
  }

  function loadState() {
    const fallback = defaultState();
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!stored || typeof stored !== "object") return fallback;
      const topics = blankTopicStats();
      for (const key of Object.keys(topics)) {
        const source = stored.stats?.topics?.[key];
        if (source) topics[key] = {
          attempts: Math.max(0, Number(source.attempts) || 0),
          correct: Math.max(0, Number(source.correct) || 0)
        };
      }
      return {
        location: {
          lat: Number.isFinite(Number(stored.location?.lat)) ? Number(stored.location.lat) : fallback.location.lat,
          lon: Number.isFinite(Number(stored.location?.lon)) ? Number(stored.location.lon) : fallback.location.lon,
          label: stored.location?.label || fallback.location.label
        },
        settings: {
          lines: stored.settings?.lines !== false,
          red: stored.settings?.red === true
        },
        stats: {
          attempts: Math.max(0, Number(stored.stats?.attempts) || 0),
          correct: Math.max(0, Number(stored.stats?.correct) || 0),
          topics,
          nights: Array.isArray(stored.stats?.nights) ? stored.stats.nights.slice(-120) : []
        }
      };
    } catch (_) {
      return fallback;
    }
  }

  let state = loadState();
  let visibleStars = [];
  let selectedStarId = null;
  let currentQuestion = 0;
  let sessionCorrect = 0;
  let questionAnswered = false;
  let deferredInstallPrompt = null;
  let updateRequested = false;
  let toastTimer = null;

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function recordNight() {
    const date = new Date().toLocaleDateString("sv-SE");
    if (!state.stats.nights.includes(date)) {
      state.stats.nights.push(date);
      state.stats.nights = state.stats.nights.slice(-120);
      saveState();
    }
  }

  function siderealTime(date, longitude) {
    const julianDate = date.getTime() / 86400000 + 2440587.5;
    const days = julianDate - 2451545.0;
    const gmst = 280.46061837 + 360.98564736629 * days;
    return normalize360(gmst + longitude);
  }

  function horizontalCoordinates(star, date, location) {
    const lst = siderealTime(date, location.lon);
    let hourAngle = normalize360(lst - star.ra * 15);
    if (hourAngle > 180) hourAngle -= 360;

    const ha = toRad(hourAngle);
    const dec = toRad(star.dec);
    const lat = toRad(location.lat);
    const sinAlt = Math.sin(dec) * Math.sin(lat) + Math.cos(dec) * Math.cos(lat) * Math.cos(ha);
    const altitude = Math.asin(clamp(sinAlt, -1, 1));
    const azimuth = Math.atan2(
      -Math.sin(ha) * Math.cos(dec),
      Math.sin(dec) * Math.cos(lat) - Math.cos(dec) * Math.sin(lat) * Math.cos(ha)
    );

    return { altitude: toDeg(altitude), azimuth: normalize360(toDeg(azimuth)) };
  }

  function setupCanvas(canvas) {
    const rect = canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2.5);
    const width = Math.max(1, Math.round(rect.width));
    const height = Math.max(1, Math.round(rect.height));
    if (canvas.width !== Math.round(width * dpr) || canvas.height !== Math.round(height * dpr)) {
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
    }
    const ctx = canvas.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return { ctx, width, height };
  }

  function projectStar(coords, size) {
    const center = size / 2;
    const radius = size * 0.445;
    const radial = (90 - coords.altitude) / 90 * radius;
    const azimuth = toRad(coords.azimuth);
    return {
      x: center + radial * Math.sin(azimuth),
      y: center - radial * Math.cos(azimuth)
    };
  }

  function drawSky() {
    const canvas = $("sky-canvas");
    if (!canvas || canvas.clientWidth === 0) return;
    const { ctx, width, height } = setupCanvas(canvas);
    const size = Math.min(width, height);
    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2;
    const colors = state.settings.red
      ? { ring: "rgba(214,103,94,.20)", grid: "rgba(214,103,94,.10)", star: "#ff9a90", label: "#d47a72", line: "rgba(225,100,92,.24)", glow: "rgba(235,95,84,.38)" }
      : { ring: "rgba(194,202,238,.20)", grid: "rgba(194,202,238,.08)", star: "#fff4d7", label: "#b6b6ce", line: "rgba(158,150,216,.28)", glow: "rgba(244,184,91,.42)" };

    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(offsetX, offsetY);

    const center = size / 2;
    const horizon = size * 0.445;
    const gradient = ctx.createRadialGradient(center, center, 0, center, center, horizon);
    gradient.addColorStop(0, state.settings.red ? "rgba(90,20,17,.11)" : "rgba(68,64,135,.16)");
    gradient.addColorStop(1, "rgba(3,5,14,.18)");
    ctx.beginPath();
    ctx.arc(center, center, horizon, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    ctx.strokeStyle = colors.ring;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(center, center, horizon, 0, Math.PI * 2);
    ctx.stroke();

    ctx.strokeStyle = colors.grid;
    for (const altitude of [30, 60]) {
      const ringRadius = (90 - altitude) / 90 * horizon;
      ctx.beginPath();
      ctx.arc(center, center, ringRadius, 0, Math.PI * 2);
      ctx.stroke();
    }
    for (let azimuth = 0; azimuth < 360; azimuth += 45) {
      const angle = toRad(azimuth);
      ctx.beginPath();
      ctx.moveTo(center, center);
      ctx.lineTo(center + horizon * Math.sin(angle), center - horizon * Math.cos(angle));
      ctx.stroke();
    }

    const date = new Date();
    const byId = new Map();
    visibleStars = [];
    for (const star of STAR_CATALOG) {
      const coords = horizontalCoordinates(star, date, state.location);
      if (coords.altitude <= 0) continue;
      const point = projectStar(coords, size);
      const item = { ...star, ...coords, x: point.x + offsetX, y: point.y + offsetY };
      visibleStars.push(item);
      byId.set(star.id, { ...item, x: point.x, y: point.y });
    }

    if (state.settings.lines) {
      ctx.strokeStyle = colors.line;
      ctx.lineWidth = 1.1;
      for (const sequence of CONSTELLATION_LINES) {
        let drawing = false;
        ctx.beginPath();
        for (const id of sequence) {
          const point = byId.get(id);
          if (!point) { drawing = false; continue; }
          if (!drawing) { ctx.moveTo(point.x, point.y); drawing = true; }
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
      }
    }

    const labelIds = new Set(["polaris", "vega", "altair", "deneb", "arcturus", "capella"]);
    for (const star of visibleStars) {
      const x = star.x - offsetX;
      const y = star.y - offsetY;
      const radius = clamp(4.7 - star.mag * 0.67, 1.35, 5.4);
      const highlighted = star.id === selectedStarId || star.id === "polaris";

      if (highlighted) {
        const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 4.5);
        glow.addColorStop(0, colors.glow);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, radius * 4.5, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.fillStyle = highlighted ? (state.settings.red ? "#ff746c" : "#ffd27f") : colors.star;
      ctx.beginPath();
      ctx.arc(x, y, highlighted ? radius + 1 : radius, 0, Math.PI * 2);
      ctx.fill();

      if (labelIds.has(star.id) && star.altitude > 5) {
        ctx.font = "500 10px system-ui, sans-serif";
        ctx.fillStyle = star.id === "polaris" ? (state.settings.red ? "#ff8e84" : "#f4b85b") : colors.label;
        ctx.textBaseline = "middle";
        const label = star.name;
        const labelWidth = ctx.measureText(label).width;
        const onRight = x + radius + 7 + labelWidth < size - 5;
        ctx.fillText(label, onRight ? x + radius + 7 : x - radius - 7 - labelWidth, y);
      }
    }

    ctx.restore();
    $("empty-sky").hidden = visibleStars.length > 0;
    $("sky-time").textContent = date.toLocaleTimeString("it-IT", { hour: "2-digit", minute: "2-digit" });
  }

  function showStar(star) {
    if (!star) return;
    selectedStarId = star.id;
    $("star-constellation").textContent = star.constellation.toUpperCase();
    $("star-name").textContent = star.name;
    $("star-altitude").textContent = `${Math.round(star.altitude)}°`;
    $("star-azimuth").textContent = `${Math.round(star.azimuth)}°`;
    $("star-magnitude").textContent = star.mag.toFixed(2).replace(".", ",");
    $("star-sheet").hidden = false;
    drawSky();
  }

  function canvasStarAt(event) {
    const canvas = $("sky-canvas");
    const rect = canvas.getBoundingClientRect();
    const point = event.touches?.[0] || event;
    const x = point.clientX - rect.left;
    const y = point.clientY - rect.top;
    return visibleStars
      .map(star => ({ star, distance: Math.hypot(star.x - x, star.y - y) }))
      .filter(item => item.distance <= 19)
      .sort((a, b) => a.distance - b.distance)[0]?.star;
  }

  function drawQuizShape(shapeName) {
    const canvas = $("quiz-canvas");
    const { ctx, width, height } = setupCanvas(canvas);
    const shape = QUIZ_SHAPES[shapeName] || QUIZ_SHAPES.ursa;
    const colors = state.settings.red
      ? { line: "rgba(229,95,86,.43)", star: "#ff8e84", glow: "rgba(226,83,73,.3)" }
      : { line: "rgba(158,150,216,.48)", star: "#fff0cf", glow: "rgba(244,184,91,.3)" };

    ctx.clearRect(0, 0, width, height);
    const seed = shapeName.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
    for (let i = 0; i < 33; i++) {
      const x = ((i * 73 + seed * 11) % 997) / 997 * width;
      const y = ((i * 131 + seed * 7) % 991) / 991 * height;
      ctx.fillStyle = `rgba(255,245,220,${0.17 + (i % 4) * 0.08})`;
      ctx.beginPath();
      ctx.arc(x, y, i % 5 === 0 ? 1.2 : 0.7, 0, Math.PI * 2);
      ctx.fill();
    }

    const paddingX = 27;
    const paddingY = 23;
    const points = shape.points.map(([x, y]) => ({ x: paddingX + x * (width - paddingX * 2), y: paddingY + y * (height - paddingY * 2) }));
    ctx.strokeStyle = colors.line;
    ctx.lineWidth = 1.3;
    for (const line of shape.lines) {
      ctx.beginPath();
      line.forEach((index, position) => {
        const point = points[index];
        if (position === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }

    points.forEach((point, index) => {
      const highlighted = shape.highlight === index;
      if (highlighted) {
        const glow = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, 20);
        glow.addColorStop(0, colors.glow);
        glow.addColorStop(1, "transparent");
        ctx.fillStyle = glow;
        ctx.beginPath(); ctx.arc(point.x, point.y, 20, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = highlighted ? (state.settings.red ? "#ff746c" : "#f4b85b") : colors.star;
      ctx.beginPath();
      ctx.arc(point.x, point.y, highlighted ? 5 : 3.2, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  function renderQuestion() {
    const question = QUESTIONS[currentQuestion];
    questionAnswered = false;
    $("exercise-progress").textContent = `ESERCIZIO ${currentQuestion + 1} DI ${QUESTIONS.length}`;
    $("quiz-prompt").textContent = question.prompt;
    $("session-score").textContent = sessionCorrect;
    $("quiz-feedback").hidden = true;
    $("quiz-feedback").className = "feedback";
    $("hint-button").disabled = false;
    $("next-button").disabled = true;
    $("next-button").textContent = currentQuestion === QUESTIONS.length - 1 ? "Concludi" : "Avanti";
    $("answer-grid").replaceChildren(...question.options.map(option => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "answer-button";
      button.textContent = option;
      button.addEventListener("click", () => answerQuestion(option, button));
      return button;
    }));
    requestAnimationFrame(() => drawQuizShape(question.shape));
  }

  function answerQuestion(option, selectedButton) {
    if (questionAnswered) return;
    questionAnswered = true;
    const question = QUESTIONS[currentQuestion];
    const correct = option === question.answer;
    state.stats.attempts += 1;
    state.stats.topics[question.topic].attempts += 1;
    if (correct) {
      state.stats.correct += 1;
      state.stats.topics[question.topic].correct += 1;
      sessionCorrect += 1;
    }
    saveState();

    for (const button of $("answer-grid").querySelectorAll("button")) {
      button.disabled = true;
      if (button.textContent === question.answer) button.classList.add("correct");
    }
    if (!correct) selectedButton.classList.add("wrong");

    const feedback = $("quiz-feedback");
    feedback.textContent = `${correct ? "Esatto. " : "Non ancora. "}${question.explanation}`;
    feedback.classList.toggle("bad", !correct);
    feedback.hidden = false;
    $("hint-button").disabled = true;
    $("next-button").disabled = false;
    $("session-score").textContent = sessionCorrect;
    renderProgress();
  }

  function nextQuestion() {
    if (!questionAnswered) return;
    if (currentQuestion < QUESTIONS.length - 1) {
      currentQuestion += 1;
      renderQuestion();
      return;
    }
    showToast(`Sessione completata: ${sessionCorrect} risposte corrette su ${QUESTIONS.length}.`);
    currentQuestion = 0;
    sessionCorrect = 0;
    switchView("progress");
    renderQuestion();
  }

  function topicScore(stats) {
    if (!stats.attempts) return 0;
    const accuracy = stats.correct / stats.attempts;
    const experience = Math.min(stats.attempts / 3, 1);
    return Math.round(accuracy * experience * 100);
  }

  function renderProgress() {
    const scores = Object.fromEntries(Object.entries(state.stats.topics).map(([key, stats]) => [key, topicScore(stats)]));
    const mastered = Object.values(scores).filter(score => score >= 70).length;
    const accuracy = state.stats.attempts ? Math.round(state.stats.correct / state.stats.attempts * 100) : 0;
    const overall = Math.round(Object.values(scores).reduce((sum, score) => sum + score, 0) / Object.keys(scores).length);

    $("mastered-count").textContent = mastered;
    $("accuracy-count").textContent = `${accuracy}%`;
    $("night-count").textContent = Math.max(1, state.stats.nights.length);
    $("overall-progress").textContent = `${overall}%`;
    $("mastery-list").replaceChildren(...Object.entries(TOPICS).map(([key, topic]) => {
      const row = document.createElement("div");
      row.className = "mastery-row";
      row.innerHTML = `<div class="mastery-row-head"><strong>${topic.label}</strong><span>${scores[key]}%</span></div><div class="mastery-track"><div class="mastery-fill" style="width:${scores[key]}%"></div></div>`;
      return row;
    }));

    const nextKey = Object.keys(TOPICS).sort((a, b) => scores[a] - scores[b])[0];
    $("next-topic").textContent = TOPICS[nextKey].label;
    $("next-topic-copy").textContent = TOPICS[nextKey].copy;
  }

  function switchView(target) {
    document.querySelectorAll(".view").forEach(view => {
      const active = view.dataset.view === target;
      view.hidden = !active;
      view.classList.toggle("active", active);
    });
    document.querySelectorAll(".nav-button").forEach(button => {
      const active = button.dataset.target === target;
      button.classList.toggle("active", active);
      if (active) button.setAttribute("aria-current", "page");
      else button.removeAttribute("aria-current");
    });
    if (target === "sky") requestAnimationFrame(drawSky);
    if (target === "training") requestAnimationFrame(() => drawQuizShape(QUESTIONS[currentQuestion].shape));
    if (target === "progress") renderProgress();
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function requestLocation() {
    if (!navigator.geolocation) {
      showToast("La geolocalizzazione non è disponibile su questo dispositivo.");
      return;
    }
    $("location-label").textContent = "Ricerca della posizione…";
    navigator.geolocation.getCurrentPosition(position => {
      const lat = position.coords.latitude;
      const lon = position.coords.longitude;
      state.location = {
        lat,
        lon,
        label: `Posizione attuale · ${Math.abs(lat).toFixed(2)}° ${lat >= 0 ? "N" : "S"}`
      };
      saveState();
      $("location-label").textContent = state.location.label;
      drawSky();
      showToast("Cielo aggiornato per la tua posizione.");
    }, error => {
      $("location-label").textContent = state.location.label;
      const message = error.code === 1 ? "Permesso posizione non concesso." : "Non riesco a determinare la posizione.";
      showToast(`${message} Uso ${state.location.label.split(" · ")[0]}.`);
    }, { enableHighAccuracy: false, timeout: 10000, maximumAge: 30 * 60 * 1000 });
  }

  function showToast(message) {
    const toast = $("toast");
    clearTimeout(toastTimer);
    toast.textContent = message;
    toast.hidden = false;
    toastTimer = setTimeout(() => { toast.hidden = true; }, 3600);
  }

  function applySettings() {
    document.body.classList.toggle("red-mode", state.settings.red);
    $("red-mode").checked = state.settings.red;
    $("constellation-lines").checked = state.settings.lines;
    document.querySelector('meta[name="theme-color"]').content = state.settings.red ? "#080403" : "#070914";
    drawSky();
    if (!$("training-view").hidden) drawQuizShape(QUESTIONS[currentQuestion].shape);
  }

  function setupInstallPrompt() {
    const banner = $("install-banner");
    const installButton = $("install-button");
    const standalone = matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
    if (standalone || localStorage.getItem("nightNavigator.installDismissed") === "1") return;

    window.addEventListener("beforeinstallprompt", event => {
      event.preventDefault();
      deferredInstallPrompt = event;
      window.setTimeout(() => { if ($("update-banner").hidden) banner.hidden = false; }, 1800);
    });

    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios) {
      $("install-copy").textContent = "In Safari: Condividi → Aggiungi alla schermata Home";
      installButton.textContent = "Come fare";
      window.setTimeout(() => { if ($("update-banner").hidden) banner.hidden = false; }, 1800);
    }

    installButton.addEventListener("click", async () => {
      if (deferredInstallPrompt) {
        deferredInstallPrompt.prompt();
        await deferredInstallPrompt.userChoice;
        deferredInstallPrompt = null;
        banner.hidden = true;
      } else if (ios) {
        showToast("Tocca Condividi in Safari, poi “Aggiungi alla schermata Home”.");
      }
    });

    $("install-close").addEventListener("click", () => {
      banner.hidden = true;
      localStorage.setItem("nightNavigator.installDismissed", "1");
    });
    window.addEventListener("appinstalled", () => { banner.hidden = true; });
  }

  async function setupServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.register("./sw.js");
      const offerUpdate = worker => {
        if (!worker) return;
        $("install-banner").hidden = true;
        $("update-banner").hidden = false;
      };
      if (registration.waiting) offerUpdate(registration.waiting);
      registration.addEventListener("updatefound", () => {
        const worker = registration.installing;
        worker?.addEventListener("statechange", () => {
          if (worker.state === "installed" && navigator.serviceWorker.controller) offerUpdate(worker);
        });
      });
      registration.update().catch(() => {});
      $("update-button").addEventListener("click", () => {
        if (!registration.waiting) return;
        updateRequested = true;
        registration.waiting.postMessage({ type: "SKIP_WAITING" });
      });
      navigator.serviceWorker.addEventListener("controllerchange", () => {
        if (!updateRequested) return;
        updateRequested = false;
        location.reload();
      });
    } catch (error) {
      console.error("Service Worker non registrato", error);
    }
  }

  function bindEvents() {
    document.querySelectorAll(".nav-button").forEach(button => button.addEventListener("click", () => switchView(button.dataset.target)));
    $("location-button").addEventListener("click", requestLocation);
    $("refresh-sky").addEventListener("click", () => { drawSky(); showToast("Cielo aggiornato all’ora corrente."); });
    $("sky-canvas").addEventListener("click", event => {
      const star = canvasStarAt(event);
      if (star) showStar(star);
    });
    $("polaris-button").addEventListener("click", () => {
      const polaris = visibleStars.find(star => star.id === "polaris");
      if (polaris) showStar(polaris);
      else showToast("Polaris non è sopra l’orizzonte da questa posizione.");
    });
    $("star-sheet-close").addEventListener("click", () => {
      $("star-sheet").hidden = true;
      selectedStarId = null;
      drawSky();
    });
    $("hint-button").addEventListener("click", () => {
      const feedback = $("quiz-feedback");
      feedback.textContent = QUESTIONS[currentQuestion].hint;
      feedback.className = "feedback";
      feedback.hidden = false;
    });
    $("next-button").addEventListener("click", nextQuestion);
    $("practice-next").addEventListener("click", () => switchView("training"));

    const dialog = $("settings-dialog");
    $("settings-button").addEventListener("click", () => dialog.showModal());
    $("constellation-lines").addEventListener("change", event => {
      state.settings.lines = event.target.checked;
      saveState(); applySettings();
    });
    $("red-mode").addEventListener("change", event => {
      state.settings.red = event.target.checked;
      saveState(); applySettings();
    });
    $("reset-progress").addEventListener("click", () => {
      if (!confirm("Azzerare esercizi, precisione e notti registrate?")) return;
      state.stats = defaultState().stats;
      recordNight();
      saveState();
      renderProgress();
      dialog.close();
      showToast("Progressi azzerati.");
    });
    window.addEventListener("resize", () => {
      drawSky();
      if (!$("training-view").hidden) drawQuizShape(QUESTIONS[currentQuestion].shape);
    });
    document.addEventListener("visibilitychange", () => { if (!document.hidden) drawSky(); });
  }

  function init() {
    recordNight();
    $("location-label").textContent = state.location.label;
    bindEvents();
    applySettings();
    renderQuestion();
    renderProgress();
    setupInstallPrompt();
    setupServiceWorker();
    drawSky();
    window.setInterval(() => { if (!document.hidden && !$("sky-view").hidden) drawSky(); }, 60000);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
