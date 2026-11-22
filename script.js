// =========================================================
// Dark mode: remembers the choice; otherwise follows the system setting
// (the initial theme is applied by a small script in <head>)
// =========================================================
const root = document.documentElement;
const themeToggle = document.getElementById('theme-toggle');

function setTheme(theme) {
    if (theme === 'dark') {
        root.setAttribute('data-theme', 'dark');
    } else {
        root.removeAttribute('data-theme');
    }
    themeToggle.setAttribute('aria-label', theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode');
}

setTheme(root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light');

themeToggle.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    setTheme(next);
    localStorage.setItem('theme', next);
});

// =========================================================
// Header has three states:
//   - at the very top: transparent over the hero
//   - scrolling through the hero: dark frosted glass ("scrolled"),
//     so the hero text doesn't show through behind the nav
//   - past the hero (or mobile menu open): solid page color ("solid")
// =========================================================
const header = document.getElementById('site-header');
const hero = document.getElementById('home');
const nav = document.getElementById('site-nav');
const menuToggle = document.getElementById('menu-toggle');

function updateHeader() {
    const solid = window.scrollY > hero.offsetHeight - 80 || nav.classList.contains('open');
    header.classList.toggle('solid', solid);
    header.classList.toggle('scrolled', !solid && window.scrollY > 8);
}

// =========================================================
// Mobile menu
// =========================================================
function setMenu(open) {
    nav.classList.toggle('open', open);
    menuToggle.setAttribute('aria-expanded', String(open));
    menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    updateHeader();
}

menuToggle.addEventListener('click', () => setMenu(!nav.classList.contains('open')));
nav.querySelectorAll('a').forEach(link => link.addEventListener('click', () => setMenu(false)));

// =========================================================
// Highlight the nav link for the section in view
// =========================================================
const navLinks = [...nav.querySelectorAll('a')];
const sections = navLinks.map(link => document.querySelector(link.getAttribute('href'))).filter(Boolean);

function updateActiveLink() {
    const marker = window.scrollY + window.innerHeight * 0.3;
    let current = null;
    sections.forEach(section => {
        if (section.offsetTop <= marker) current = section;
    });
    // At the very bottom, the last section (Contact) is the current one
    if (window.innerHeight + window.scrollY >= document.body.scrollHeight - 4) {
        current = sections[sections.length - 1];
    }
    navLinks.forEach(link => {
        link.classList.toggle('active', current !== null && link.getAttribute('href') === '#' + current.id);
    });
}

function onScroll() {
    updateHeader();
    updateActiveLink();
}

window.addEventListener('scroll', onScroll, { passive: true });
window.addEventListener('resize', onScroll);
onScroll();

// =========================================================
// Hero animation: agents that flock using only local rules
// (align with, move toward, and keep space from nearby agents)
// =========================================================
(function swarm() {
    const canvas = document.getElementById('swarm');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const NEIGHBOR_RADIUS = 70;
    const SEPARATION = 22;
    const LINK_DISTANCE = 48;
    const MAX_SPEED = 1.5;
    const COLORS = ['#a5b4fc', '#67e8f9'];

    let width = 0;
    let height = 0;
    let agents = [];
    let running = false;
    const mouse = { x: -1e4, y: -1e4 };

    function resize() {
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        width = canvas.offsetWidth;
        height = canvas.offsetHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const count = Math.round(Math.min(230, (width * height) / 6500));
        while (agents.length < count) {
            const angle = Math.random() * Math.PI * 2;
            agents.push({
                x: Math.random() * width,
                y: Math.random() * height,
                vx: Math.cos(angle),
                vy: Math.sin(angle),
                kind: Math.random() < 0.5 ? 0 : 1
            });
        }
        agents.length = count;
    }

    function step() {
        ctx.clearRect(0, 0, width, height);

        for (const a of agents) {
            let alignX = 0, alignY = 0, cohX = 0, cohY = 0, sepX = 0, sepY = 0, n = 0;

            for (const b of agents) {
                if (a === b) continue;
                const dx = b.x - a.x;
                const dy = b.y - a.y;
                const d = Math.hypot(dx, dy);
                if (d >= NEIGHBOR_RADIUS) continue;

                n++;
                alignX += b.vx;
                alignY += b.vy;
                cohX += dx;
                cohY += dy;
                if (d < SEPARATION) {
                    sepX -= dx / (d || 1);
                    sepY -= dy / (d || 1);
                }
                if (d < LINK_DISTANCE && a.kind <= b.kind) {
                    ctx.strokeStyle = `rgba(129, 140, 248, ${(1 - d / LINK_DISTANCE) * 0.35})`;
                    ctx.lineWidth = 0.8;
                    ctx.beginPath();
                    ctx.moveTo(a.x, a.y);
                    ctx.lineTo(b.x, b.y);
                    ctx.stroke();
                }
            }

            if (n) {
                a.vx += (alignX / n - a.vx) * 0.05 + (cohX / n) * 0.0009 + sepX * 0.06;
                a.vy += (alignY / n - a.vy) * 0.05 + (cohY / n) * 0.0009 + sepY * 0.06;
            }

            // Agents move away from the cursor
            const mx = a.x - mouse.x;
            const my = a.y - mouse.y;
            const md = Math.hypot(mx, my);
            if (md < 110) {
                a.vx += (mx / md) * 0.25;
                a.vy += (my / md) * 0.25;
            }

            const speed = Math.hypot(a.vx, a.vy);
            if (speed > MAX_SPEED) { a.vx *= MAX_SPEED / speed; a.vy *= MAX_SPEED / speed; }
            if (speed < 0.6) { a.vx *= 1.1; a.vy *= 1.1; }

            a.x += a.vx;
            a.y += a.vy;
            if (a.x < -10) a.x = width + 10;
            if (a.x > width + 10) a.x = -10;
            if (a.y < -10) a.y = height + 10;
            if (a.y > height + 10) a.y = -10;
        }

        for (const a of agents) {
            ctx.fillStyle = COLORS[a.kind];
            ctx.beginPath();
            ctx.arc(a.x, a.y, a.kind ? 1.8 : 2.2, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    function loop() {
        if (!running) return;
        step();
        requestAnimationFrame(loop);
    }

    resize();
    window.addEventListener('resize', resize);

    hero.addEventListener('pointermove', e => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = e.clientX - rect.left;
        mouse.y = e.clientY - rect.top;
    });
    hero.addEventListener('pointerleave', () => { mouse.x = mouse.y = -1e4; });

    if (reduceMotion) {
        // Draw a settled, still frame instead of animating
        for (let i = 0; i < 200; i++) step();
        return;
    }

    // Only animate while the hero is on screen
    new IntersectionObserver(entries => {
        const visible = entries[0].isIntersecting;
        if (visible && !running) { running = true; loop(); }
        if (!visible) running = false;
    }).observe(hero);
})();
