/* =============================================
   NEXT STEP EQUITY GROUP — SCRIPTS
   ============================================= */

(function () {
  'use strict';

  /* ---------- DOM REFS ---------- */
  var navbar      = document.getElementById('navbar');
  var hamburger   = document.getElementById('hamburger');
  var mobileMenu  = document.getElementById('mobileMenu');
  var mobileOverlay = document.getElementById('mobileOverlay');
  var mobileClose = document.getElementById('mobileClose');
  var mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
  var heroCanvas  = document.getElementById('heroCanvas');

  /* ---------- STICKY NAV ON SCROLL ---------- */
  var lastScroll = 0;

  function handleScroll() {
    var scrollY = window.scrollY;
    if (scrollY > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = scrollY;
  }

  window.addEventListener('scroll', handleScroll, { passive: true });

  /* ---------- MOBILE MENU ---------- */
  function openMobileMenu() {
    mobileMenu.classList.add('active');
    mobileOverlay.classList.add('active');
    hamburger.classList.add('active');
    hamburger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }

  function closeMobileMenu() {
    mobileMenu.classList.remove('active');
    mobileOverlay.classList.remove('active');
    hamburger.classList.remove('active');
    hamburger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  hamburger.addEventListener('click', function () {
    var isOpen = mobileMenu.classList.contains('active');
    if (isOpen) {
      closeMobileMenu();
    } else {
      openMobileMenu();
    }
  });

  mobileClose.addEventListener('click', closeMobileMenu);
  mobileOverlay.addEventListener('click', closeMobileMenu);

  mobileLinks.forEach(function (link) {
    link.addEventListener('click', closeMobileMenu);
  });

  /* Close on Escape */
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') closeMobileMenu();
  });

  /* ---------- SMOOTH SCROLL FOR NAV LINKS ---------- */
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var targetId = this.getAttribute('href');
      if (targetId === '#') return;
      var target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth' });
      }
    });
  });

  /* ---------- ANIMATED STAT COUNTERS ---------- */
  var statNumbers = document.querySelectorAll('.hero-stat-number[data-target]');
  var statsAnimated = false;

  function animateCounters() {
    if (statsAnimated) return;
    statsAnimated = true;

    statNumbers.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-target'), 10);
      var duration = 2000;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        /* ease-out cubic */
        var eased = 1 - Math.pow(1 - progress, 3);
        el.textContent = Math.floor(eased * target);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = target;
        }
      }

      requestAnimationFrame(step);
    });
  }

  /* Use Intersection Observer for stat counters */
  var statsSection = document.querySelector('.hero-stats');
  if (statsSection && 'IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCounters();
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    observer.observe(statsSection);
  } else {
    /* Fallback: animate on load */
    animateCounters();
  }

  /* ---------- REVIEWS CAROUSEL ---------- */
  var reviewsTrack = document.getElementById('reviewsTrack');
  var reviewsPrev  = document.getElementById('reviewsPrev');
  var reviewsNext  = document.getElementById('reviewsNext');
  var reviewsDots  = document.getElementById('reviewsDots');

  if (reviewsTrack) {
    var reviewCards = reviewsTrack.querySelectorAll('.review-card');
    var currentSlide = 0;
    var slidesPerView = 1;
    var totalSlides = reviewCards.length;

    function getCardsPerView() {
      if (window.innerWidth >= 1024) return 3;
      if (window.innerWidth >= 768) return 2;
      return 1;
    }

    function getTotalPages() {
      return Math.max(1, totalSlides - slidesPerView + 1);
    }

    function buildDots() {
      reviewsDots.innerHTML = '';
      var pages = getTotalPages();
      for (var i = 0; i < pages; i++) {
        var dot = document.createElement('button');
        dot.className = 'reviews-dot' + (i === 0 ? ' active' : '');
        dot.setAttribute('aria-label', 'Go to review ' + (i + 1));
        dot.dataset.index = i;
        dot.addEventListener('click', function () {
          goToSlide(parseInt(this.dataset.index, 10));
        });
        reviewsDots.appendChild(dot);
      }
    }

    function updateDots() {
      var dots = reviewsDots.querySelectorAll('.reviews-dot');
      dots.forEach(function (dot, i) {
        dot.classList.toggle('active', i === currentSlide);
      });
    }

    function goToSlide(index) {
      var maxSlide = getTotalPages() - 1;
      currentSlide = Math.max(0, Math.min(index, maxSlide));
      var cardWidth = reviewCards[0].offsetWidth + 24;
      reviewsTrack.style.transform = 'translateX(' + -(currentSlide * cardWidth) + 'px)';
      updateDots();
    }

    reviewsPrev.addEventListener('click', function () {
      goToSlide(currentSlide - 1);
    });

    reviewsNext.addEventListener('click', function () {
      goToSlide(currentSlide + 1);
    });

    /* Touch / swipe support */
    var touchStartX = 0;
    var touchEndX = 0;

    reviewsTrack.addEventListener('touchstart', function (e) {
      touchStartX = e.changedTouches[0].screenX;
    }, { passive: true });

    reviewsTrack.addEventListener('touchend', function (e) {
      touchEndX = e.changedTouches[0].screenX;
      var diff = touchStartX - touchEndX;
      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          goToSlide(currentSlide + 1);
        } else {
          goToSlide(currentSlide - 1);
        }
      }
    }, { passive: true });

    function handleResize() {
      var newPerView = getCardsPerView();
      if (newPerView !== slidesPerView) {
        slidesPerView = newPerView;
        buildDots();
        goToSlide(0);
      }
    }

    slidesPerView = getCardsPerView();
    buildDots();
    window.addEventListener('resize', handleResize);
  }

  /* ---------- CREDIBILITY COUNT-UP ---------- */
  var credNumbers = document.querySelectorAll('.cred-number[data-count-target]');

  function animateCredCounters() {
    credNumbers.forEach(function (el) {
      var target = parseInt(el.getAttribute('data-count-target'), 10);
      var suffix = el.getAttribute('data-count-suffix') || '';
      var prefix = el.getAttribute('data-count-prefix') || '';
      var duration = 2200;
      var startTime = null;

      function step(timestamp) {
        if (!startTime) startTime = timestamp;
        var progress = Math.min((timestamp - startTime) / duration, 1);
        var eased = 1 - Math.pow(1 - progress, 3);
        var current = Math.floor(eased * target);
        el.textContent = prefix + current + (progress < 1 ? '' : suffix);
        if (progress < 1) {
          requestAnimationFrame(step);
        } else {
          el.textContent = prefix + target + suffix;
        }
      }

      requestAnimationFrame(step);
    });
  }

  if (credNumbers.length > 0 && 'IntersectionObserver' in window) {
    var credSection = document.querySelector('.credibility');
    var credObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          animateCredCounters();
          credObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.4 });
    credObserver.observe(credSection);
  }

  /* ---------- SCROLL REVEAL ---------- */
  var revealEls = document.querySelectorAll('[data-reveal]');

  if ('IntersectionObserver' in window) {
    var revealObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });

    revealEls.forEach(function (el, i) {
      el.style.transitionDelay = (i % 3) * 0.12 + 's';
      revealObserver.observe(el);
    });
  } else {
    revealEls.forEach(function (el) {
      el.classList.add('revealed');
    });
  }

  /* ---------- STEPS CONNECTING LINE ANIMATION ---------- */
  var stepsLineFill = document.querySelector('.steps-line-fill');
  if (stepsLineFill && 'IntersectionObserver' in window) {
    var lineObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          stepsLineFill.classList.add('animate');
          lineObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.3 });
    lineObserver.observe(stepsLineFill.parentElement);
  }

  /* ---------- ANIMATED CANVAS BACKGROUND ---------- */
  if (heroCanvas) {
    var ctx = heroCanvas.getContext('2d');
    var particles = [];
    var particleCount = 60;
    var mouse = { x: -9999, y: -9999 };
    var canvasW, canvasH;

    function resizeCanvas() {
      var rect = heroCanvas.parentElement.getBoundingClientRect();
      canvasW = rect.width;
      canvasH = rect.height;
      heroCanvas.width = canvasW;
      heroCanvas.height = canvasH;
    }

    function Particle() {
      this.x = Math.random() * canvasW;
      this.y = Math.random() * canvasH;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 0.5;
      this.opacity = Math.random() * 0.5 + 0.1;
    }

    function initParticles() {
      particles = [];
      for (var i = 0; i < particleCount; i++) {
        particles.push(new Particle());
      }
    }

    function drawParticles() {
      ctx.clearRect(0, 0, canvasW, canvasH);

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];

        /* Move */
        p.x += p.vx;
        p.y += p.vy;

        /* Wrap around edges */
        if (p.x < 0) p.x = canvasW;
        if (p.x > canvasW) p.x = 0;
        if (p.y < 0) p.y = canvasH;
        if (p.y > canvasH) p.y = 0;

        /* Draw particle */
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(201, 168, 76, ' + p.opacity + ')';
        ctx.fill();

        /* Connect nearby particles */
        for (var j = i + 1; j < particles.length; j++) {
          var p2 = particles[j];
          var dx = p.x - p2.x;
          var dy = p.y - p2.y;
          var dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 150) {
            var lineOpacity = (1 - dist / 150) * 0.15;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.strokeStyle = 'rgba(201, 168, 76, ' + lineOpacity + ')';
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }

        /* Mouse interaction */
        var mdx = p.x - mouse.x;
        var mdy = p.y - mouse.y;
        var mDist = Math.sqrt(mdx * mdx + mdy * mdy);
        if (mDist < 120) {
          var force = (120 - mDist) / 120 * 0.02;
          p.vx += mdx * force;
          p.vy += mdy * force;
        }

        /* Dampen velocity */
        p.vx *= 0.99;
        p.vy *= 0.99;
      }

      requestAnimationFrame(drawParticles);
    }

    resizeCanvas();
    initParticles();
    drawParticles();

    window.addEventListener('resize', function () {
      resizeCanvas();
      if (particles.length === 0) initParticles();
    });

    document.addEventListener('mousemove', function (e) {
      var rect = heroCanvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    });
  }

})();
