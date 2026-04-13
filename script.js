const canvas = document.getElementById("confetti-canvas");
const ctx = canvas.getContext("2d");

const confettiPieces = [];
const photoPieces = [];
const photoSources = ["megha-1.jpeg", "megha-2.jpeg", "megha-3.jpeg", "megha-4.jpeg"];
const photoImages = [];
const birthdayMusic = document.getElementById("birthday-music");
const musicToggle = document.getElementById("music-toggle");
const themeToggle = document.getElementById("theme-toggle");
const THEME_KEY = "birthday-page-theme";
const revealItems = document.querySelectorAll(".reveal");
const moodCards = document.querySelectorAll(".mood-card");
const isSmallScreen = window.matchMedia("(max-width: 768px)");
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
const TARGET_MUSIC_VOLUME = 0.12;
let animationId = null;

function getConfettiPalette() {
  return document.body.classList.contains("dark-mode")
    ? ["#f9a8d4", "#c4b5fd", "#93c5fd", "#a7f3d0", "#fcd34d", "#fca5a5"]
    : ["#ff4d6d", "#ffd60a", "#4cc9f0", "#80ed99", "#b5179e", "#f3722c"];
}

function applyTheme(theme) {
  const useDark = theme === "dark";
  document.body.classList.toggle("dark-mode", useDark);
  themeToggle.textContent = useDark ? "Light Mode" : "Dark Mode";
  themeToggle.setAttribute("aria-label", useDark ? "Switch to light mode" : "Switch to dark mode");
  localStorage.setItem(THEME_KEY, useDark ? "dark" : "light");
}

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}

function createConfetti(count = 140) {
  for (let i = 0; i < count; i += 1) {
    confettiPieces.push({
      x: random(0, canvas.width),
      y: random(-canvas.height, 0),
      size: random(6, 12),
      speedY: random(1.5, 4.5),
      speedX: random(-1.3, 1.3),
      rotation: random(0, Math.PI * 2),
      rotationSpeed: random(-0.08, 0.08),
      color: getConfettiPalette()[Math.floor(Math.random() * getConfettiPalette().length)]
    });
  }
}

function preloadPhotos() {
  photoSources.forEach((src) => {
    const img = new Image();
    img.src = src;
    photoImages.push(img);
  });
}

function createPhotoPieces(count = 14) {
  for (let i = 0; i < count; i += 1) {
    photoPieces.push({
      x: random(0, canvas.width),
      y: random(-canvas.height, -40),
      width: random(28, 42),
      height: random(38, 58),
      speedY: random(1.1, 2.6),
      speedX: random(-0.7, 0.7),
      rotation: random(-0.35, 0.35),
      rotationSpeed: random(-0.012, 0.012),
      image: photoImages[Math.floor(Math.random() * photoImages.length)]
    });
  }
}

function updateAndDraw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  confettiPieces.forEach((piece) => {
    piece.y += piece.speedY;
    piece.x += piece.speedX;
    piece.rotation += piece.rotationSpeed;

    if (piece.y > canvas.height + 20) {
      piece.y = random(-100, -10);
      piece.x = random(0, canvas.width);
      piece.color = getConfettiPalette()[Math.floor(Math.random() * getConfettiPalette().length)];
    }

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size * 0.6);
    ctx.restore();
  });

  photoPieces.forEach((piece) => {
    piece.y += piece.speedY;
    piece.x += piece.speedX;
    piece.rotation += piece.rotationSpeed;

    if (piece.y > canvas.height + 70) {
      piece.y = random(-140, -40);
      piece.x = random(0, canvas.width);
      piece.image = photoImages[Math.floor(Math.random() * photoImages.length)];
    }

    if (!piece.image?.complete) {
      return;
    }

    ctx.save();
    ctx.translate(piece.x, piece.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = document.body.classList.contains("dark-mode")
      ? "rgba(28, 22, 44, 0.85)"
      : "rgba(255, 255, 255, 0.85)";
    ctx.fillRect(-piece.width / 2 - 2, -piece.height / 2 - 2, piece.width + 4, piece.height + 4);
    ctx.drawImage(piece.image, -piece.width / 2, -piece.height / 2, piece.width, piece.height);
    ctx.restore();
  });

  animationId = requestAnimationFrame(updateAndDraw);
}

window.addEventListener("resize", resizeCanvas);

async function playMusic() {
  try {
    birthdayMusic.volume = 0;
    await birthdayMusic.play();
    const fadeInterval = setInterval(() => {
      if (birthdayMusic.paused) {
        clearInterval(fadeInterval);
        return;
      }

      birthdayMusic.volume = Math.min(TARGET_MUSIC_VOLUME, birthdayMusic.volume + 0.01);
      if (birthdayMusic.volume >= TARGET_MUSIC_VOLUME) {
        clearInterval(fadeInterval);
      }
    }, 120);

    musicToggle.textContent = "Pause Music";
    musicToggle.setAttribute("aria-label", "Pause background music");
  } catch (error) {
    musicToggle.textContent = "Turn Music On";
  }
}

musicToggle.addEventListener("click", async () => {
  if (birthdayMusic.paused) {
    await playMusic();
  } else {
    birthdayMusic.pause();
    musicToggle.textContent = "Turn Music On";
    musicToggle.setAttribute("aria-label", "Play background music");
  }
});

themeToggle.addEventListener("click", () => {
  const isDark = document.body.classList.contains("dark-mode");
  applyTheme(isDark ? "light" : "dark");
});

function handleReveal() {
  const triggerPoint = window.innerHeight * 0.88;
  revealItems.forEach((item) => {
    const rect = item.getBoundingClientRect();
    if (rect.top < triggerPoint) {
      item.classList.add("visible");
    }
  });
}

function handleParallax() {
  if (isSmallScreen.matches || reduceMotion.matches) {
    moodCards.forEach((card) => {
      card.style.transform = "translateY(0)";
    });
    return;
  }

  const scrollY = window.scrollY;
  moodCards.forEach((card, index) => {
    const speed = 0.06 + index * 0.015;
    card.style.transform = `translateY(${scrollY * speed}px)`;
  });
}

window.addEventListener("scroll", () => {
  handleReveal();
  handleParallax();
});

resizeCanvas();
applyTheme(localStorage.getItem(THEME_KEY) || "dark");
birthdayMusic.volume = TARGET_MUSIC_VOLUME;
preloadPhotos();
createConfetti();
createPhotoPieces();
updateAndDraw();
playMusic();
handleReveal();
handleParallax();
