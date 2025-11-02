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

// ===== smooth scrolling and scrollspy =====
const HEADER_HEIGHT = 72;
const SCROLL_OFFSET = HEADER_HEIGHT + 20; // Account for header height + some padding

let isAutoScrolling = false;
let scrollEndTimer = null;

function afterScrollEnds(fn, delay = 150) {
  clearTimeout(scrollEndTimer);
  scrollEndTimer = setTimeout(fn, delay);
}

// CLICK: smooth scroll to section
navLinks.forEach(link => {
  link.addEventListener('click', (e) => {
    const id = link.getAttribute('href').slice(1);
    const target = document.getElementById(id);
    if (!target) return;

    e.preventDefault();

    // Set active immediately for better UX
    setActive(id);

    // Mute observer during smooth scroll
    isAutoScrolling = true;

    // Calculate the exact position to scroll to
    const targetPosition = target.offsetTop - SCROLL_OFFSET;

    // Smooth scroll to the calculated position
    window.scrollTo({
      top: targetPosition,
      behavior: 'smooth'
    });

    // Update URL
    history.pushState(null, '', `#${id}`);

    // Re-enable observer after scroll completes
    afterScrollEnds(() => {
      isAutoScrolling = false;
    });
  });
});

// SCROLLSPY: Simple and reliable scroll-based navigation highlighting
function updateActiveSection() {
  if (isAutoScrolling) return;

  const scrollPosition = window.scrollY + SCROLL_OFFSET;
  
  // Find which section is currently in view
  let currentSection = null;
  
  sections.forEach(section => {
    const sectionTop = section.offsetTop;
    const sectionHeight = section.offsetHeight;
    const sectionBottom = sectionTop + sectionHeight;
    
    // Check if current scroll position is within this section
    if (scrollPosition >= sectionTop && scrollPosition < sectionBottom) {
      currentSection = section;
    }
  });
  
  // If we're at the very top, default to home
  if (scrollPosition < sections[0].offsetTop) {
    currentSection = sections[0];
  }
  
  // If we're past the last section, default to the last section
  if (scrollPosition >= sections[sections.length - 1].offsetTop) {
    currentSection = sections[sections.length - 1];
  }
  
  // Update active nav link
  if (currentSection) {
    setActive(currentSection.id);
    // Update URL without triggering scroll
    if (history.state !== currentSection.id) {
      history.replaceState(currentSection.id, '', `#${currentSection.id}`);
    }
  }
}

// Handle scroll events
window.addEventListener('scroll', () => {
  if (isAutoScrolling) {
    afterScrollEnds(() => {
      isAutoScrolling = false;
    });
  } else {
    // Throttle scroll events for better performance
    if (!window.scrollTimeout) {
      window.scrollTimeout = setTimeout(() => {
        updateActiveSection();
        window.scrollTimeout = null;
      }, 10);
    }
  }
});

// Initialize on page load
window.addEventListener('DOMContentLoaded', () => {
  const id = location.hash.slice(1);
  if (id && linkById[id]) {
    setActive(id);
  } else if (sections[0]) {
    setActive(sections[0].id);
  }
  
  // Initial check for active section
  updateActiveSection();
});

// Typewriter effect
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

/* --- START: Hamburger Menu Logic --- */
document.addEventListener('DOMContentLoaded', () => {
  const menuToggle = document.getElementById('menu-toggle');
  const navMenu = document.getElementById('nav-menu');
  const navLinks = navMenu.querySelectorAll('a');

  if (menuToggle && navMenu) {
    // 1. Toggle menu when hamburger is clicked
    menuToggle.addEventListener('click', () => {
      navMenu.classList.toggle('is-open');
      menuToggle.classList.toggle('is-open');
      
      // A11y: Update aria-expanded attribute
      const isOpen = navMenu.classList.contains('is-open');
      menuToggle.setAttribute('aria-expanded', isOpen);
    });

    // 2. Close menu when a link is clicked
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('is-open');
        menuToggle.classList.remove('is-open');
        menuToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }
});
/* --- END: Hamburger Menu Logic --- */