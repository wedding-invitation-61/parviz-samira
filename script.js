const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwSZV364lsOhrBkHIvNs0R5KV96QbuuNmDPL0bvs6AVwzWrDuDyNR2pDpJn6mLDUWrI/exec';

const nameInput = document.getElementById('guestName');

nameInput.addEventListener('invalid', () => {
  nameInput.setCustomValidity('Пожалуйста, введите ваше имя и фамилию');
});

nameInput.addEventListener('input', () => {
  nameInput.setCustomValidity('');
});

// 1. Анимации появления секций при скролле
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
    }
  });
}, {
  threshold: 0.12,
  rootMargin: "0px 0px -30px 0px"
});

document.querySelectorAll('.scroll-reveal').forEach(el => observer.observe(el));

// 2. Аудиоплеер: только переключение класса без перезаписи DOM
const bgMusic = document.getElementById('bgMusic');
const musicBtn = document.getElementById('musicBtn');
let isPlaying = false;

musicBtn.addEventListener('click', () => {
  if (!isPlaying) {
    bgMusic.play().then(() => {
      isPlaying = true;
      musicBtn.classList.add('playing');
    }).catch(e => {
      console.warn('Воспроизведение заблокировано браузером', e);
    });
  } else {
    bgMusic.pause();
    isPlaying = false;
    musicBtn.classList.remove('playing');
  }
});

// 3. Скольжение сердца по траектории волны
const timelineWrapper = document.getElementById('timelineWrapper');
const timelinePath = document.getElementById('timelineCurvePath');
const movingHeart = document.getElementById('movingHeart');

function updateHeartOnScroll() {
  if (!timelineWrapper || !timelinePath || !movingHeart) return;

  const rect = timelineWrapper.getBoundingClientRect();
  const windowHeight = window.innerHeight;

  const startTrigger = windowHeight * 0.65;
  const endTrigger = windowHeight * 0.35;
  const travelDistance = rect.height + (startTrigger - endTrigger);
  const currentDistance = startTrigger - rect.top;

  let progress = currentDistance / travelDistance;
  progress = Math.max(0, Math.min(1, progress));

  const pathLen = timelinePath.getTotalLength();
  if (!pathLen) return;
  const point = timelinePath.getPointAtLength(progress * pathLen);

  const xPercent = (point.x / 380) * 100;
  const yPercent = (point.y / 1080) * 100;

  movingHeart.style.left = `${xPercent}%`;
  movingHeart.style.top = `${yPercent}%`;
}

window.addEventListener('scroll', updateHeartOnScroll, { passive: true });
window.addEventListener('resize', updateHeartOnScroll);
document.addEventListener('DOMContentLoaded', updateHeartOnScroll);
setTimeout(updateHeartOnScroll, 100);

// 4. Счётчик персон в анкете
let guestCount = 1;
const cntVal = document.getElementById('cntVal');
document.getElementById('incBtn').onclick = () => {
  guestCount++;
  cntVal.textContent = guestCount;
};
document.getElementById('decBtn').onclick = () => {
  if (guestCount > 1) {
    guestCount--;
    cntVal.textContent = guestCount;
  }
};

// 5. Обратный отсчёт (22 октября 2026, 17:30)
const weddingTime = new Date('2026-10-22T17:30:00').getTime();

function updateCountdown() {
  const now = new Date().getTime();
  const diff = weddingTime - now;

  if (diff > 0) {
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const m = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const s = Math.floor((diff % (1000 * 60)) / 1000);

    document.getElementById('tDays').textContent = String(d).padStart(2, '0');
    document.getElementById('tHours').textContent = String(h).padStart(2, '0');
    document.getElementById('tMinutes').textContent = String(m).padStart(2, '0');
    document.getElementById('tSeconds').textContent = String(s).padStart(2, '0');
  }
}
setInterval(updateCountdown, 1000);
updateCountdown();

// 6. Отправка формы в Google Таблицу
const rsvpForm = document.getElementById('rsvpForm');
const submitBtn = document.getElementById('submitBtn');
const successBlock = document.getElementById('successBlock');

rsvpForm.addEventListener('submit', (e) => {
  e.preventDefault();

  const name = document.getElementById('guestName').value.trim();
  const status = document.querySelector('input[name="attendance"]:checked').value;

  submitBtn.innerText = 'Отправляем...';
  submitBtn.disabled = true;

  fetch(GOOGLE_SCRIPT_URL, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify({
      name: name,
      guests: guestCount,
      status: status
    })
  })
  .then(() => {
    rsvpForm.style.display = 'none';
    successBlock.style.display = 'block';
  })
  .catch((err) => {
    console.error(err);
    alert('Не удалось отправить анкету. Пожалуйста, попробуйте еще раз.');
    submitBtn.innerText = 'Подтвердить участие';
    submitBtn.disabled = false;
  });
});