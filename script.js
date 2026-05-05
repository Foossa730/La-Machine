const questions = [
  {
    id: "real-name",
    category: "Identité",
    question: "Quel est le vrai prénom de Jul ?",
    correct: "Julien",
    answers: ["Julien", "Jules", "Juliano", "Jordan"],
    note: "Jul est le nom de scène de Julien Mari.",
  },
  {
    id: "origin-city",
    category: "Origines",
    question: "De quelle ville Jul est-il originaire ?",
    correct: "Marseille",
    answers: ["Marseille", "Toulon", "Nice", "Lyon"],
    note: "Son univers est fortement associé à Marseille.",
  },
  {
    id: "label-name",
    category: "Label",
    question: "Comment s'appelle le label fondé par Jul ?",
    correct: "D'or et de platine",
    answers: ["D'or et de platine", "Capitol du Sud", "Planete Rap Music", "La Zone Records"],
    note: "Le noir et l'or du quiz font référence à ce label.",
  },
  {
    id: "first-album",
    category: "Discographie",
    question: "Quel album est considéré comme son premier album studio sorti en 2014 ?",
    correct: "Dans ma paranoïa",
    answers: ["Dans ma paranoïa", "My World", "L'ovni", "La Machine"],
    note: "Dans ma paranoïa lance officiellement sa grande cadence d'albums.",
  },
  {
    id: "nickname",
    category: "Surnom",
    question: "Quel surnom est régulièrement associé à Jul ?",
    correct: "L'Ovni",
    answers: ["L'Ovni", "Le Duc", "La Fouine", "Le S"],
    note: "L'Ovni est aussi le titre d'un de ses albums.",
  },
  {
    id: "tchikita-album",
    category: "Album",
    question: "Quel album de Jul contient le titre populaire 'Tchikita' ?",
    correct: "L'ovni",
    answers: ["L'ovni", "Je tourne en rond", "Cœur blanc", "Inspi d'ailleurs"],
    note: "Tchikita fait partie des titres qui ont beaucoup marqué son public.",
  },
  {
    id: "my-world-year",
    category: "Carriere",
    question: "En quelle année Jul sort-il 'My World', l'un de ses albums majeurs ?",
    correct: "2015",
    answers: ["2015", "2012", "2018", "2021"],
    note: "My World sort après ses premiers projets de 2014.",
  },
  {
    id: "hand-sign",
    category: "Style",
    question: "Quel geste est souvent associé aux fans de Jul ?",
    correct: "Le signe Jul avec les mains",
    answers: [
      "Le signe Jul avec les mains",
      "Le moonwalk",
      "Le salut militaire",
      "La danse du casque",
    ],
    note: "Le signe Jul est devenu un code visuel très reconnaissable.",
  },
  {
    id: "album-2020",
    category: "Album",
    question: "Lequel de ces projets est bien un album de Jul sorti en 2020 ?",
    correct: "La Machine",
    answers: ["La Machine", "Civilisation", "Ipséité", "Trinity"],
    note: "La Machine fait partie de sa discographie très dense.",
  },
  {
    id: "best-song",
    category: "Chanson",
    question: "Quelle est la meilleure chanson de Jul ?",
    correct: "Amnésia",
    answers: ["Amnésia", "Tchikita", "Wesh alors", "J'oublie tout"],
    note: "Amnésia est la bonne réponse de ce quiz.",
  },
  {
    id: "release-rhythm",
    category: "Carriere",
    question: "Quel trait caractérise particulièrement le rythme de sortie de Jul ?",
    correct: "Il publie très fréquemment de nouveaux projets",
    answers: [
      "Il publie très fréquemment de nouveaux projets",
      "Il ne sort qu'un album tous les dix ans",
      "Il refuse les albums studio",
      "Il ne publie que des reprises rock",
    ],
    note: "Sa productivité est l'une des marques fortes de sa carrière.",
  },
  {
    id: "sales-status",
    category: "Reconnaissance",
    question: "Quel record ou statut revient souvent quand on parle de Jul dans le rap français ?",
    correct: "L'un des plus gros vendeurs du rap français",
    answers: [
      "L'un des plus gros vendeurs du rap français",
      "Premier rappeur français à gagner un Oscar",
      "Créateur officiel de l'hymne de la Coupe du monde 1998",
      "Fondateur du festival de Cannes",
    ],
    note: "Ses ventes et ses streams le placent parmi les artistes les plus massifs du rap français.",
  },
];

const state = {
  index: 0,
  score: 0,
  correct: 0,
  answers: [],
  streak: 0,
  locked: false,
  started: false,
  soundEnabled: true,
};

const accessToken = new URLSearchParams(window.location.search).get("token")?.trim() || "";

const soundFiles = {
  start: "audio/intro.mp3",
  correct: "audio/correct.mp3",
  wrong: "audio/wrong.mp3",
  unlock: "audio/unlock.mp3",
};

const elements = {
  scoreLive: document.querySelector("#score-live"),
  questionLive: document.querySelector("#question-live"),
  streakLive: document.querySelector("#streak-live"),
  startScreen: document.querySelector("#start-screen"),
  questionScreen: document.querySelector("#question-screen"),
  resultScreen: document.querySelector("#result-screen"),
  startBtn: document.querySelector("#start-btn"),
  replayBtn: document.querySelector("#replay-btn"),
  soundToggle: document.querySelector("#sound-toggle"),
  categoryLabel: document.querySelector("#category-label"),
  progressLabel: document.querySelector("#progress-label"),
  progressBar: document.querySelector("#progress-bar"),
  questionText: document.querySelector("#question-text"),
  answers: document.querySelector("#answers"),
  feedback: document.querySelector("#feedback"),
  nextBtn: document.querySelector("#next-btn"),
  resultBadge: document.querySelector("#result-badge"),
  resultTitle: document.querySelector("#result-title"),
  resultMessage: document.querySelector("#result-message"),
  accessCode: document.querySelector("#access-code"),
  codeNote: document.querySelector("#code-note"),
  unlockBox: document.querySelector("#unlock-box"),
};

let audioContext;
const customSounds = Object.fromEntries(
  Object.entries(soundFiles).map(([type, path]) => {
    const audio = new Audio(path);
    audio.preload = "auto";
    audio.dataset.failed = "false";
    return [type, audio];
  }),
);

function setScreen(activeScreen) {
  [elements.startScreen, elements.questionScreen, elements.resultScreen].forEach((screen) => {
    screen.classList.toggle("is-active", screen === activeScreen);
  });
}

function updateLiveStats() {
  const questionNumber = state.started ? Math.min(state.index + 1, questions.length) : 0;

  elements.scoreLive.textContent = String(state.score);
  elements.questionLive.textContent = `${questionNumber}/${questions.length}`;
  elements.streakLive.textContent = `x${state.streak}`;
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function playTone(type) {
  if (!state.soundEnabled) return;

  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;

  audioContext ||= new AudioEngine();

  if (audioContext.state === "suspended") {
    audioContext.resume();
  }

  // Small synth cues avoid external audio files while keeping the concert feel.
  const frequencies = {
    start: [130, 196, 261],
    correct: [392, 523, 659],
    wrong: [180, 110],
    unlock: [261, 392, 523, 784],
  };

  frequencies[type].forEach((frequency, index) => {
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    const startTime = audioContext.currentTime + index * 0.08;

    oscillator.type = type === "wrong" ? "sawtooth" : "triangle";
    oscillator.frequency.setValueAtTime(frequency, startTime);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(type === "wrong" ? 0.08 : 0.13, startTime + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + 0.18);

    oscillator.connect(gain).connect(audioContext.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + 0.2);
  });
}

function playSound(type) {
  if (!state.soundEnabled) return;

  const source = customSounds[type];

  if (!source || source.dataset.failed === "true") {
    playTone(type);
    return;
  }

  const clip = source.cloneNode();
  clip.volume = type === "wrong" ? 0.35 : 0.58;
  clip.currentTime = 0;

  clip.play().catch(() => {
    source.dataset.failed = "true";
    playTone(type);
  });
}

function renderQuestion() {
  const current = questions[state.index];
  const percent = (state.index / questions.length) * 100;

  state.locked = false;
  elements.categoryLabel.textContent = current.category;
  elements.progressLabel.textContent = `Question ${state.index + 1} sur ${questions.length}`;
  elements.progressBar.style.width = `${percent}%`;
  elements.questionText.textContent = current.question;
  elements.feedback.textContent = "";
  elements.feedback.className = "feedback";
  elements.nextBtn.classList.remove("is-visible");
  elements.answers.innerHTML = "";

  shuffle(current.answers).forEach((answer, index) => {
    const button = document.createElement("button");
    button.className = "answer-btn";
    button.type = "button";
    button.innerHTML = `<span class="answer-letter">${String.fromCharCode(65 + index)}</span><span>${answer}</span>`;
    button.addEventListener("click", () => selectAnswer(button, answer));
    elements.answers.appendChild(button);
  });

  updateLiveStats();
}

function selectAnswer(button, selectedAnswer) {
  if (state.locked) return;

  const current = questions[state.index];
  const isCorrect = selectedAnswer === current.correct;
  state.locked = true;

  document.querySelectorAll(".answer-btn").forEach((answerButton) => {
    const answerText = answerButton.lastElementChild.textContent;
    answerButton.disabled = true;

    if (answerText === current.correct) {
      answerButton.classList.add("is-correct");
    } else if (answerButton === button) {
      answerButton.classList.add("is-wrong");
    }
  });

  if (isCorrect) {
    state.correct += 1;
    state.streak += 1;
    state.score += state.streak > 0 && state.streak % 3 === 0 ? 15 : 10;
    elements.feedback.textContent = `Bonne réponse. ${current.note}`;
    elements.feedback.classList.add("good");
    playSound("correct");
  } else {
    state.streak = 0;
    elements.feedback.textContent = `Raté. La bonne réponse était: ${current.correct}. ${current.note}`;
    elements.feedback.classList.add("bad");
    elements.questionScreen.classList.add("shake");
    setTimeout(() => elements.questionScreen.classList.remove("shake"), 380);
    playSound("wrong");
  }

  state.answers.push({
    questionId: current.id,
    selected: selectedAnswer,
  });

  elements.progressBar.style.width = `${((state.index + 1) / questions.length) * 100}%`;
  elements.nextBtn.classList.add("is-visible");
  updateLiveStats();
}

async function requestUnlock() {
  const response = await fetch("/.netlify/functions/unlock", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      token: accessToken,
      answers: state.answers,
    }),
  });

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(payload.message || "Impossible de vérifier ton accès pour le moment.");
  }

  return payload;
}

async function finishQuiz() {
  const highTier = state.correct >= 9;

  elements.resultBadge.textContent = highTier ? "Vérification" : "Encore un tour";
  elements.resultTitle.textContent = highTier
      ? "Tu as mérité ta place à la machine."
      : "Tu bredouilles la team.";

  if (highTier) {
    elements.resultMessage.textContent =
      "Vérification sécurisée de ton lien en cours...";
    elements.accessCode.textContent = "...";
    elements.codeNote.textContent = "Ne ferme pas la page.";

    setScreen(elements.resultScreen);
    updateLiveStats();

    try {
      const result = await requestUnlock();
      elements.resultBadge.textContent = "Accès validé";
      elements.resultMessage.textContent =
        `Ta place vient d'être envoyée par email à ${result.email}. Vérifie aussi tes spams.`;
      elements.accessCode.textContent = "EMAIL ENVOYÉ";
      elements.codeNote.textContent = "Le code n'est pas affiché ici pour protéger ta place.";
      playSound("unlock");
    } catch (error) {
      elements.resultBadge.textContent = "Accès bloqué";
      elements.resultTitle.textContent = "Vérification impossible.";
      elements.resultMessage.textContent = error.message;
      elements.accessCode.textContent = "BLOQUÉ";
      elements.codeNote.textContent =
        "Vérifie que tu utilises le lien personnel reçu pour récupérer ta place.";
      playSound("wrong");
    }
  } else {
    elements.resultMessage.textContent =
      `Score: ${state.correct}/${questions.length}. Il faut au moins 9 bonnes réponses pour récupérer la place.`;
    elements.accessCode.textContent = "BLOQUÉ";
    elements.codeNote.textContent = "Tu peux rejouer pour retenter ta chance.";
    playSound("wrong");

    setScreen(elements.resultScreen);
    updateLiveStats();
  }
}

function startQuiz() {
  state.index = 0;
  state.score = 0;
  state.correct = 0;
  state.answers = [];
  state.streak = 0;
  state.locked = false;
  state.started = true;
  setScreen(elements.questionScreen);
  playSound("start");
  renderQuestion();
}

function goNext() {
  state.index += 1;

  if (state.index >= questions.length) {
    finishQuiz();
    return;
  }

  renderQuestion();
}

elements.startBtn.addEventListener("click", startQuiz);
elements.replayBtn.addEventListener("click", startQuiz);
elements.nextBtn.addEventListener("click", goNext);
elements.soundToggle.addEventListener("click", () => {
  state.soundEnabled = !state.soundEnabled;
  elements.soundToggle.textContent = `Son: ${state.soundEnabled ? "activé" : "coupé"}`;
});

updateLiveStats();
