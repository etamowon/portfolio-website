// ===== grab elements =====
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.navbar a[href^="#"]:not(.logo)'); // logo excluded

// map id -> link
const linkById = {};
navLinks.forEach(link => {
  const id = link.getAttribute('href').slice(1);
  linkById[id] = link;
});

// one-active-only helper (+ a11y)
function setActive(id) {
  navLinks.forEach(link => {
    const match = link.getAttribute('href') === `#${id}`;
    link.classList.toggle('is-active', match);
    if (match) {
      link.setAttribute('aria-current', 'true');
    } else {
      link.removeAttribute('aria-current');
    }
  });
}

// ===== scrollspy, but clicks "snap" immediately =====
const HEADER_HEIGHT = 72;

let isAutoScrolling = false;   // pause observer while true
let pendingId = null;          // where we're headed
let scrollEndTimer = null;

function afterScrollEnds(fn, delay = 120) {
  clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(fn, delay);
}

// CLICK: make clicked link active NOW, smooth scroll, no pass-through
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault(); // control the scroll

    // highlight immediately (so hover leaving doesn't kill it)
    setActive(id);

    // mute the observer during the smooth travel
    isAutoScrolling = true;
    pendingId = id;

    target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    history.pushState(null, '', `#${id}`);
  });
});

// when scrolling stops, just re-enable observer
window.addEventListener('scroll', () => {
  if (isAutoScrolling) {
    afterScrollEnds(() => {
      isAutoScrolling = false;
      pendingId = null;
    });
  }
});

// OBSERVER: only handles wheel/touch scrolling (the nice "torch pass")
const observer = new IntersectionObserver(
  (entries) => {
    if (isAutoScrolling) return; // ignore while auto-scrolling from a click
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        setActive(entry.target.id);
      }
    });
  },
  {
    root: null,
    threshold: 0.4,
    rootMargin: `-${HEADER_HEIGHT}px 0px -40% 0px`
  }
);

sections.forEach(sec => observer.observe(sec));

// on load, respect the hash or start at the first section
window.addEventListener('DOMContentLoaded', () => {
  const id = location.hash.slice(1);
  if (id && linkById[id]) setActive(id);
  else if (sections[0]) setActive(sections[0].id);
});

document.addEventListener('DOMContentLoaded', () => {
  const words = ["web development", "web design", "app development", "app design", "front end development"];
  let i = 0, j = 0, isDeleting = false;
  const el = document.querySelector(".typewriter");

  function type() {
    const current = words[i];
    el.textContent = isDeleting ? current.slice(0, --j) : current.slice(0, ++j);

    let speed = isDeleting ? 50 : 120;

    if (!isDeleting && j === current.length) { speed = 1200; isDeleting = true; }
    else if (isDeleting && j === 0) { isDeleting = false; i = (i + 1) % words.length; speed = 400; }

    setTimeout(type, speed);
  }
  type();
});

// ===== Theme Toggle =====
window.toggleTheme = function() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    const themeIcon = document.querySelector('.theme-icon');
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    
    themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// Set initial theme
const savedTheme = localStorage.getItem('theme') || 'light';
document.documentElement.setAttribute('data-theme', savedTheme);
document.querySelector('.theme-icon').textContent = savedTheme === 'dark' ? '☀️' : '🌙';

