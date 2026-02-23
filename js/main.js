/* ============================================
   RERIGHT SOLUTIONS - MAIN JS
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {

    // --- DOM References ---
    const navLinks = document.querySelectorAll('[data-page]');
    const pages = document.querySelectorAll('.page');
    const hamburger = document.getElementById('hamburger');
    const mobileMenu = document.getElementById('mobile-menu');
    const contactForm = document.getElementById('contact-form');

    // --- Tab / Page Navigation ---
    function navigateTo(pageId) {
        // Remove active from all pages
        pages.forEach(p => p.classList.remove('active'));

        // Activate target page
        const target = document.getElementById(pageId);
        if (!target) return;

        target.classList.add('active');

        // Re-trigger fade animation
        target.style.animation = 'none';
        target.offsetHeight; // force reflow
        target.style.animation = '';

        // Update active state on all nav links (desktop + mobile)
        navLinks.forEach(link => {
            if (link.dataset.page === pageId) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });

        // Close mobile menu
        closeMobileMenu();

        // Scroll to top
        window.scrollTo({ top: 0, behavior: 'smooth' });

        // Update URL hash
        history.pushState(null, '', '#' + pageId);

        // Re-observe cards on the new page for scroll animations
        observeCards();

        // Trigger typewriter effect on the new page
        requestAnimationFrame(() => {
            typewritePage(target);
        });
    }

    // Attach click handlers
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            navigateTo(link.dataset.page);
        });
    });

    // Handle browser back/forward
    window.addEventListener('popstate', () => {
        const hash = location.hash.slice(1) || 'home';
        navigateTo(hash);
    });

    // Initialize from URL hash
    const initialPage = location.hash.slice(1) || 'home';
    navigateTo(initialPage);

    // --- Mobile Menu ---
    function closeMobileMenu() {
        mobileMenu.classList.remove('open');
        hamburger.classList.remove('open');
        hamburger.setAttribute('aria-expanded', 'false');
    }

    hamburger.addEventListener('click', () => {
        const isOpen = mobileMenu.classList.toggle('open');
        hamburger.classList.toggle('open');
        hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close mobile menu on outside click
    document.addEventListener('click', (e) => {
        if (!mobileMenu.contains(e.target) && !hamburger.contains(e.target)) {
            closeMobileMenu();
        }
    });

    // --- tsParticles ---
    let particlesContainer = null;

    if (typeof tsParticles !== 'undefined') {
        tsParticles.load("tsparticles", {
            fullScreen: { enable: false },
            background: { color: { value: "transparent" } },
            fpsLimit: 60,
            particles: {
                number: {
                    value: 55,
                    density: { enable: true, area: 900 }
                },
                color: {
                    value: ["#00D4FF", "#0066FF", "#7C3AED"]
                },
                shape: { type: "circle" },
                opacity: {
                    value: { min: 0.1, max: 0.35 },
                    animation: {
                        enable: true,
                        speed: 0.4,
                        minimumValue: 0.1,
                        sync: false
                    }
                },
                size: {
                    value: { min: 1, max: 3 }
                },
                links: {
                    enable: true,
                    distance: 150,
                    color: "#00D4FF",
                    opacity: 0.1,
                    width: 1
                },
                move: {
                    enable: true,
                    speed: 0.5,
                    direction: "none",
                    random: true,
                    straight: false,
                    outModes: { default: "out" }
                }
            },
            interactivity: {
                events: {
                    onHover: {
                        enable: true,
                        mode: "grab"
                    },
                    onClick: {
                        enable: true,
                        mode: "push"
                    }
                },
                modes: {
                    grab: {
                        distance: 140,
                        links: { opacity: 0.25 }
                    },
                    push: { quantity: 2 }
                }
            },
            detectRetina: true
        }).then(container => {
            particlesContainer = container;
        });
    }

    // --- Logo ↔ Particles Interaction ---
    const heroLogo = document.querySelector('.hero-logo');
    let logoAttractRAF = null;
    let isLogoHovered = false;

    function getParticlesArray() {
        if (!particlesContainer || !particlesContainer.particles) return [];
        // tsParticles v2.12.0 made .array private; use .filter() public API
        if (typeof particlesContainer.particles.filter === 'function') {
            return particlesContainer.particles.filter(() => true);
        }
        // Fallback: try internal _array (TypeScript private, accessible at JS runtime)
        if (particlesContainer.particles._array) {
            return particlesContainer.particles._array;
        }
        // Oldest fallback
        if (particlesContainer.particles.array) {
            return particlesContainer.particles.array;
        }
        return [];
    }

    if (heroLogo) {
        heroLogo.addEventListener('mouseenter', () => {
            isLogoHovered = true;
            if (!particlesContainer) return;

            const pArray = getParticlesArray();
            if (!pArray.length) return;

            function attractLoop() {
                if (!isLogoHovered) return;

                // Get logo center in page coordinates (particles use page coords)
                const logoRect = heroLogo.getBoundingClientRect();
                const cx = logoRect.left + logoRect.width / 2 + window.scrollX;
                const cy = logoRect.top + logoRect.height / 2 + window.scrollY;

                // Re-fetch in case particles were added/removed
                const particles = getParticlesArray();

                particles.forEach(p => {
                    const dx = cx - p.position.x;
                    const dy = cy - p.position.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist > 5) {
                        // Attract force: stronger when closer, capped
                        const force = Math.min(1.2, 250 / (dist + 40));
                        p.velocity.x += (dx / dist) * force;
                        p.velocity.y += (dy / dist) * force;

                        // Dampen to prevent runaway speeds
                        p.velocity.x *= 0.94;
                        p.velocity.y *= 0.94;
                    }

                    // Brighten particles as they get closer
                    if (p.opacity && dist < 250) {
                        p.opacity.value = Math.min(0.8, 0.35 + (250 - dist) / 350);
                    }
                });

                logoAttractRAF = requestAnimationFrame(attractLoop);
            }

            attractLoop();
        });

        heroLogo.addEventListener('mouseleave', () => {
            isLogoHovered = false;
            if (logoAttractRAF) {
                cancelAnimationFrame(logoAttractRAF);
                logoAttractRAF = null;
            }

            if (!particlesContainer) return;

            // Repel: push particles outward from center (scatter effect)
            const logoRect = heroLogo.getBoundingClientRect();
            const cx = logoRect.left + logoRect.width / 2 + window.scrollX;
            const cy = logoRect.top + logoRect.height / 2 + window.scrollY;

            const particles = getParticlesArray();
            if (!particles.length) return;

            particles.forEach(p => {
                const dx = p.position.x - cx;
                const dy = p.position.y - cy;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist > 1) {
                    // Burst outward
                    const force = Math.min(8, 400 / (dist + 15));
                    p.velocity.x = (dx / dist) * force;
                    p.velocity.y = (dy / dist) * force;
                }

                // Reset opacity back to normal range
                if (p.opacity) {
                    p.opacity.value = 0.1 + Math.random() * 0.25;
                }
            });
        });
    }

    // --- Typewriter / Terminal Effect ---
    const typewriterState = {
        activeTimeouts: [],   // track all pending timeouts so we can cancel
        originalTexts: new Map(), // store original text content per element
        completedPages: new Set() // pages that already typed out
    };

    // Elements to skip: form inputs, buttons, SVGs, badges, tech tags, and glass-card internals
    const SKIP_SELECTORS = 'input, select, textarea, button, svg, .tech-tag, .project-badge, .btn-primary, .btn-secondary, .btn-text, .btn-loading, .avatar-circle, .form-group, .form-status, .contact-form, .hero-cta, .hero-logo, .project-tech, .glass-card';

    function cancelTypewriter() {
        typewriterState.activeTimeouts.forEach(id => clearTimeout(id));
        typewriterState.activeTimeouts = [];

        // Remove any leftover cursors
        document.querySelectorAll('.typewriter-cursor').forEach(c => c.remove());

        // Restore any mid-animation elements to their full content
        typewriterState.originalTexts.forEach((content, el) => {
            if (el.isConnected && el.dataset.typing === 'true') {
                // Check if the stored content was HTML (contains tags)
                if (el.dataset.richType === 'true') {
                    el.innerHTML = content;
                } else {
                    el.textContent = content;
                }
                el.dataset.typing = 'false';
                el.style.opacity = '';
                el.style.transition = '';
            }
            // Also restore rich elements that were hidden
            if (el.isConnected && el.style.opacity === '0') {
                el.innerHTML = content;
                el.style.opacity = '';
                el.style.transition = '';
            }
        });
    }

    function getTypeableElements(page) {
        // Gather text-bearing elements in DOM order
        const allElements = page.querySelectorAll('h1, h2, h3, p, li, .section-subtitle, .hero-tagline, .hero-subtitle');
        const result = [];
        const seen = new Set();

        allElements.forEach(el => {
            // Deduplicate (e.g., a p.section-subtitle would match both p and .section-subtitle)
            if (seen.has(el)) return;
            seen.add(el);

            // Skip if inside a skippable container
            if (el.closest(SKIP_SELECTORS)) return;
            // Skip if the element itself matches skip selectors
            if (el.matches(SKIP_SELECTORS)) return;
            // Skip empty elements
            const text = el.textContent.trim();
            if (!text) return;

            result.push(el);
        });

        return result;
    }

    function hasRichContent(el) {
        // Check if element has meaningful child elements (spans with classes, links, etc.)
        return el.querySelector('span, a, strong, em, code') !== null;
    }

    function typewritePage(page) {
        const pageId = page.id;

        // If this page already typed out, don't re-type
        if (typewriterState.completedPages.has(pageId)) return;

        // Cancel any in-progress typing from previous page
        cancelTypewriter();

        const elements = getTypeableElements(page);
        if (elements.length === 0) return;

        // Classify elements: "plain" (safe to type char-by-char) vs "rich" (has child HTML, fade in)
        const typePlan = elements.map((el, idx) => {
            const rich = hasRichContent(el);
            if (rich) {
                typewriterState.originalTexts.set(el, el.innerHTML);
                el.dataset.richType = 'true';
                return { el, type: 'rich', idx };
            } else {
                typewriterState.originalTexts.set(el, el.textContent);
                el.textContent = '';
                el.classList.add('typewriter-target');
                el.dataset.typing = 'true';
                el.dataset.richType = 'false';
                return { el, type: 'plain', idx };
            }
        });

        // Hide all rich elements initially
        typePlan.filter(p => p.type === 'rich').forEach(p => {
            p.el.style.opacity = '0';
        });

        // Type out elements in sequence
        let globalDelay = 0;
        const charSpeed = 18; // ms per character
        const elementGap = 80; // ms pause between elements

        typePlan.forEach((plan) => {
            const { el, type } = plan;

            if (type === 'rich') {
                // Rich elements: fade in at the right time in the sequence
                const originalHTML = typewriterState.originalTexts.get(el);
                const textLen = el.textContent.length;
                const revealDelay = globalDelay;

                const revealId = setTimeout(() => {
                    if (!el.isConnected) return;
                    el.innerHTML = originalHTML;
                    el.style.transition = 'opacity 0.25s ease';
                    el.style.opacity = '1';

                    // Clean up inline styles after transition
                    setTimeout(() => {
                        el.style.transition = '';
                    }, 300);
                }, revealDelay);
                typewriterState.activeTimeouts.push(revealId);

                // Add a proportional delay for rich elements based on text length
                globalDelay += Math.min(textLen * charSpeed * 0.3, 500) + elementGap;
            } else {
                // Plain text: type character by character with cursor
                const originalText = typewriterState.originalTexts.get(el);
                if (!originalText) return;

                const startDelay = globalDelay;

                // Add cursor at start
                const showCursorId = setTimeout(() => {
                    if (!el.isConnected || el.dataset.typing !== 'true') return;
                    const cursor = document.createElement('span');
                    cursor.className = 'typewriter-cursor';
                    el.appendChild(cursor);
                }, startDelay);
                typewriterState.activeTimeouts.push(showCursorId);

                // Type each character
                for (let i = 0; i < originalText.length; i++) {
                    const charDelay = startDelay + (i + 1) * charSpeed;
                    const timeoutId = setTimeout(() => {
                        if (!el.isConnected || el.dataset.typing !== 'true') return;

                        // Remove cursor, set text, re-add cursor
                        const cursor = el.querySelector('.typewriter-cursor');
                        if (cursor) cursor.remove();

                        el.textContent = originalText.slice(0, i + 1);

                        // Re-add cursor if not last char
                        if (i < originalText.length - 1) {
                            const c = document.createElement('span');
                            c.className = 'typewriter-cursor';
                            el.appendChild(c);
                        }
                    }, charDelay);
                    typewriterState.activeTimeouts.push(timeoutId);
                }

                const elementDuration = originalText.length * charSpeed;

                // Remove cursor after element is fully typed, with a short linger
                const removeCursorId = setTimeout(() => {
                    if (!el.isConnected) return;
                    el.dataset.typing = 'false';
                    const cursor = el.querySelector('.typewriter-cursor');
                    if (cursor) cursor.remove();
                }, startDelay + elementDuration + 200);
                typewriterState.activeTimeouts.push(removeCursorId);

                globalDelay += elementDuration + elementGap;
            }
        });

        // Mark page as completed after all typing finishes
        const markCompleteId = setTimeout(() => {
            typewriterState.completedPages.add(pageId);
        }, globalDelay + 300);
        typewriterState.activeTimeouts.push(markCompleteId);
    }

    // --- Scroll-Triggered Animations (Intersection Observer) ---
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.08,
        rootMargin: '0px 0px -40px 0px'
    });

    function observeCards() {
        const activePage = document.querySelector('.page.active');
        if (!activePage) return;

        const cards = activePage.querySelectorAll('.glass-card');
        // Wait for layout to be computed after display:block
        requestAnimationFrame(() => {
            cards.forEach((card, index) => {
                if (card.classList.contains('animate-in')) return;

                const rect = card.getBoundingClientRect();
                const inViewport = rect.top < window.innerHeight && rect.bottom > 0;

                if (inViewport) {
                    // Stagger-animate cards already visible
                    card.style.transitionDelay = `${index * 0.1}s`;
                    card.classList.add('animate-in');
                } else {
                    // Observe cards below the fold for scroll-triggered animation
                    card.style.transitionDelay = '0s';
                    observer.observe(card);
                }
            });
        });
    }

    // Initial observation
    observeCards();

    // --- Contact Form (Formspree AJAX) ---
    if (contactForm) {
        const btnText = contactForm.querySelector('.btn-text');
        const btnLoading = contactForm.querySelector('.btn-loading');
        const formStatus = document.getElementById('form-status');

        contactForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Loading state
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            formStatus.textContent = '';
            formStatus.className = 'form-status';

            const formData = new FormData(contactForm);

            try {
                const response = await fetch(contactForm.action, {
                    method: 'POST',
                    body: formData,
                    headers: {
                        'Accept': 'application/json'
                    }
                });

                if (response.ok) {
                    formStatus.textContent = 'Message sent successfully! We\'ll get back to you soon.';
                    formStatus.classList.add('success');
                    contactForm.reset();
                } else {
                    const data = await response.json();
                    if (data.errors) {
                        formStatus.textContent = data.errors.map(err => err.message).join(', ');
                    } else {
                        formStatus.textContent = 'Something went wrong. Please try again or email us directly.';
                    }
                    formStatus.classList.add('error');
                }
            } catch (err) {
                formStatus.textContent = 'Network error. Please try again later.';
                formStatus.classList.add('error');
            } finally {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
        });
    }

});
