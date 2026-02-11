// ================= script.js =================

let blocks = [];
let currentBlock = 0;
let voices = [];

const phraseBox = document.getElementById("currentPhrase");
const voiceSelect = document.getElementById("voiceSelect");

// ------------------ CARGA DE VOCES ------------------
function loadVoices() {
  voices = speechSynthesis.getVoices();
  voiceSelect.innerHTML = "";

  voices
    .filter(v => v.lang.startsWith("es"))
    .forEach((voice, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `${voice.name} (${voice.lang})`;
      voiceSelect.appendChild(option);
    });
}

speechSynthesis.onvoiceschanged = loadVoices;

// ------------------ ANALIZADOR DE TEXTO ------------------
function smartDivide(text) {
  let result = [];

  // 1️⃣ Separar por párrafos reales
  let paragraphs = text
    .split(/\n+/)
    .map(p => p.trim())
    .filter(p => p.length > 0);

  paragraphs.forEach(paragraph => {
    // 2️⃣ Cortar frases largas
    let sentences = paragraph.match(/[^.!?]+[.!?]*/g) || [];

    sentences.forEach(sentence => {
      let clean = sentence.trim();

      // 3️⃣ Si es muy larga, dividir por comas / conectores
      if (clean.length > 120) {
        let parts = clean.split(
          /(,| pero | porque | sin embargo | aunque | ya que )/i
        );

        let temp = "";
        parts.forEach(part => {
          temp += part;
          if (temp.length > 60) {
            result.push(temp.trim());
            temp = "";
          }
        });

        if (temp.trim().length > 0) {
          result.push(temp.trim());
        }
      } else {
        result.push(clean);
      }
    });
  });

  return result;
}

// ------------------ INICIO ------------------
function startDictation() {
  const text = document.getElementById("textInput").value;
  if (!text) return;

  blocks = smartDivide(text);
  currentBlock = 0;

  speakBlock();
}

// ------------------ DICTADO ------------------
function speakBlock() {
  if (currentBlock >= blocks.length) return;

  const block = blocks[currentBlock];
  phraseBox.textContent = block;

  speechSynthesis.cancel();

  const utterance = new SpeechSynthesisUtterance(block);
  utterance.lang = "es-MX";
  utterance.rate = 0.55; // 🔥 dictado MUY lento
  utterance.voice = voices[voiceSelect.value] || null;

  speechSynthesis.speak(utterance);
}

// ------------------ CONTROLES ------------------
function nextSentence() {
  currentBlock++;
  speakBlock();
}

function repeatSentence() {
  speakBlock();
}
// ------------------ CONTROL CON TECLAS ------------------
document.addEventListener("keydown", (event) => {
  // Evita que se mueva el cursor del textarea si está activo
  if (document.activeElement.tagName === "TEXTAREA") return;

  switch (event.key) {
    case "ArrowRight": // ➡ siguiente bloque
      if (currentBlock < blocks.length - 1) {
        currentBlock++;
        speakBlock();
      }
      break;

    case "ArrowLeft": // ⬅ repetir bloque actual
      speakBlock();
      break;
  }
});