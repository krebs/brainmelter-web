const socket = new WebSocket("ws://localhost:3001");

let availableVoices = [];

function loadVoices() {
  const all = speechSynthesis.getVoices();
  availableVoices = all.filter(voice =>
    voice.lang.startsWith("en") && !voice.name.toLowerCase().includes("google")
  );
}
speechSynthesis.onvoiceschanged = loadVoices;
loadVoices();

const fonts = [
  "Arial", "Georgia", "Courier New", "Verdana",
  "Times New Roman", "Comic Sans MS", "Trebuchet MS", "Lucida Console"
];

const colors = [
  "#FFD700",
  "#FF6B6B",
  "#4ECDC4",
  "#6A5ACD",
  "#00BFFF",
  "#ADFF2F",
  "#FF69B4",
  "#FF8C00",
  "#7FFFD4",
  "#E0FFFF"
];

window.addEventListener('load', () => {
  const audio = document.getElementById('bg-audio');
  const overlay = document.getElementById('unmute-overlay');

  // Try autoplay
  const tryPlay = audio.play();
  if (tryPlay !== undefined) {
    tryPlay.catch(() => {
      overlay.style.display = 'flex'; // Show fallback overlay
    });
  }

  overlay.addEventListener('click', () => {
    audio.play().then(() => {
      overlay.style.display = 'none';
    });
  });
});

socket.onmessage = (event) => {
  const { message } = JSON.parse(event.data);
  const el = document.createElement("div");
  el.className = "message";

  const cleaned = message.replace(/\s*https?:\/\/\S+\s*/, '').trim();
  if (!cleaned) return;
  el.textContent = cleaned;

  const size = 20 + Math.random() * 20;
  el.style.fontSize = `${size}px`;

  el.style.fontFamily = fonts[Math.floor(Math.random() * fonts.length)];
  el.style.color = colors[Math.floor(Math.random() * colors.length)];

  el.style.left = "-9999px";
  el.style.top = "-9999px";
  document.body.appendChild(el);

  const rect = el.getBoundingClientRect();

  // Compute safe random position
  const maxLeft = window.innerWidth - rect.width;
  const maxTop = window.innerHeight - rect.height;
  el.style.left = `${Math.random() * maxLeft}px`;
  el.style.top = `${Math.random() * maxTop}px`;

  // Duration based on message length
  const duration = Math.min(10000, 1000 + cleaned.length * 100);

  setTimeout(() => {
    el.style.opacity = 0;
    setTimeout(() => el.remove(), 1000);
  }, duration);
};
