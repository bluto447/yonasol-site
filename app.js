/* ============================================
   YONASOL — App JavaScript
   ============================================ */

(function () {
  'use strict';

  // =============================================
  // NAVIGATION
  // =============================================
  const navbar = document.getElementById('navbar');
  const navToggle = document.getElementById('navToggle');
  const navLinks = document.getElementById('navLinks');
  const allNavLinks = document.querySelectorAll('.nav-link');
  const sections = document.querySelectorAll('.section, .hero');

  // Scroll state for nav
  let lastScroll = 0;
  window.addEventListener('scroll', function () {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
    lastScroll = currentScroll;
  });

  // Mobile menu toggle
  navToggle.addEventListener('click', function () {
    navToggle.classList.toggle('active');
    navLinks.classList.toggle('open');
  });

  // Close mobile menu on link click
  allNavLinks.forEach(function (link) {
    link.addEventListener('click', function () {
      navToggle.classList.remove('active');
      navLinks.classList.remove('open');
    });
  });

  // Active nav link based on scroll position
  function updateActiveNav() {
    var scrollPos = window.pageYOffset + 200;
    sections.forEach(function (section) {
      var top = section.offsetTop;
      var height = section.offsetHeight;
      var id = section.getAttribute('id');
      if (scrollPos >= top && scrollPos < top + height) {
        allNavLinks.forEach(function (link) {
          link.classList.remove('active');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('active');
          }
        });
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav);
  updateActiveNav();

  // =============================================
  // SCROLL ANIMATIONS (Intersection Observer)
  // =============================================
  var animateElements = document.querySelectorAll('.animate-in');
  var observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  };

  var observer = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  animateElements.forEach(function (el) {
    observer.observe(el);
  });

  // =============================================
  // HERO CANVAS — Dot Grid / Network Animation
  // =============================================
  var canvas = document.getElementById('heroCanvas');
  var ctx = canvas.getContext('2d');
  var particles = [];
  var mouseX = -1000;
  var mouseY = -1000;
  var animFrameId;

  function resizeCanvas() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resizeCanvas();
  window.addEventListener('resize', resizeCanvas);

  // Create particles
  var PARTICLE_COUNT = 80;
  function initParticles() {
    particles = [];
    for (var i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        baseAlpha: Math.random() * 0.4 + 0.1
      });
    }
  }
  initParticles();

  canvas.addEventListener('mousemove', function (e) {
    var rect = canvas.getBoundingClientRect();
    mouseX = e.clientX - rect.left;
    mouseY = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', function () {
    mouseX = -1000;
    mouseY = -1000;
  });

  function drawParticles() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // Update position
      p.x += p.vx;
      p.y += p.vy;

      // Wrap around edges
      if (p.x < 0) p.x = canvas.width;
      if (p.x > canvas.width) p.x = 0;
      if (p.y < 0) p.y = canvas.height;
      if (p.y > canvas.height) p.y = 0;

      // Mouse interaction — slight attraction
      var dx = mouseX - p.x;
      var dy = mouseY - p.y;
      var dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 200) {
        p.vx += dx * 0.00005;
        p.vy += dy * 0.00005;
      }

      // Dampen velocity
      p.vx *= 0.999;
      p.vy *= 0.999;

      // Draw particle
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(0, 229, 199, ' + p.baseAlpha + ')';
      ctx.fill();

      // Draw connections
      for (var j = i + 1; j < particles.length; j++) {
        var p2 = particles[j];
        var ddx = p.x - p2.x;
        var ddy = p.y - p2.y;
        var distance = Math.sqrt(ddx * ddx + ddy * ddy);
        if (distance < 150) {
          var alpha = (1 - distance / 150) * 0.15;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.strokeStyle = 'rgba(0, 229, 199, ' + alpha + ')';
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }

    animFrameId = requestAnimationFrame(drawParticles);
  }
  drawParticles();

  // Pause animation when not visible
  var heroSection = document.getElementById('home');
  var heroObserver = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting) {
      if (!animFrameId) drawParticles();
    } else {
      if (animFrameId) {
        cancelAnimationFrame(animFrameId);
        animFrameId = null;
      }
    }
  }, { threshold: 0 });
  heroObserver.observe(heroSection);

  // =============================================
  // TERMINAL TYPING ANIMATION
  // =============================================
  var terminalOutput = document.getElementById('terminalOutput');
  var commands = [
    { prompt: '> ', command: 'deploying replylead.ai...', output: '✓ Deployed to production' },
    { prompt: '> ', command: 'analyzing 1,247 leads...', output: '✓ 847 qualified, 23 hot' },
    { prompt: '> ', command: 'revenue: $12.4K MRR ↑23%', output: '' },
    { prompt: '> ', command: 'launching dinnerflow.com...', output: '✓ 312 meal plans generated today' },
    { prompt: '> ', command: 'status: all systems operational', output: '' }
  ];

  var cmdIndex = 0;
  var charIndex = 0;
  var isTyping = true;
  var typingTimeout;

  function typeCommand() {
    if (cmdIndex >= commands.length) {
      // Reset after a pause
      setTimeout(function () {
        terminalOutput.innerHTML = '';
        cmdIndex = 0;
        charIndex = 0;
        typeCommand();
      }, 3000);
      return;
    }

    var current = commands[cmdIndex];

    if (charIndex === 0) {
      // Start new line
      var lineDiv = document.createElement('div');
      lineDiv.className = 'line';
      lineDiv.innerHTML = '<span class="prompt">' + current.prompt + '</span><span class="command"></span>';
      terminalOutput.appendChild(lineDiv);
      // Trigger animation
      requestAnimationFrame(function () {
        lineDiv.style.opacity = '1';
      });
    }

    var lines = terminalOutput.querySelectorAll('.line');
    var currentLine = lines[lines.length - 1];
    var commandSpan = currentLine.querySelector('.command');

    if (charIndex < current.command.length) {
      commandSpan.textContent = current.command.substring(0, charIndex + 1);
      charIndex++;
      var speed = 30 + Math.random() * 40;
      typingTimeout = setTimeout(typeCommand, speed);
    } else {
      // Command done — show output
      if (current.output) {
        var outputSpan = document.createElement('span');
        outputSpan.className = 'output';
        outputSpan.textContent = current.output;
        outputSpan.style.color = current.output.startsWith('✓') ? '#00e5c7' : '#8888a0';
        currentLine.appendChild(outputSpan);
      }
      charIndex = 0;
      cmdIndex++;
      typingTimeout = setTimeout(typeCommand, 800);
    }
  }

  // Start typing after a short delay
  setTimeout(typeCommand, 1500);

  // =============================================
  // PRODUCT CARD TILT EFFECT
  // =============================================
  var tiltCards = document.querySelectorAll('[data-tilt]');
  tiltCards.forEach(function (card) {
    card.addEventListener('mousemove', function (e) {
      var rect = card.getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      var centerX = rect.width / 2;
      var centerY = rect.height / 2;
      var rotateX = (y - centerY) / centerY * -3;
      var rotateY = (x - centerX) / centerX * 3;
      card.style.transform = 'translateY(-6px) perspective(1000px) rotateX(' + rotateX + 'deg) rotateY(' + rotateY + 'deg)';
    });
    card.addEventListener('mouseleave', function () {
      card.style.transform = '';
    });
  });

  // =============================================
  // CONTACT FORM
  // =============================================
  var contactForm = document.getElementById('contactForm');
  contactForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var btn = contactForm.querySelector('.submit-btn');
    var textDefault = btn.querySelector('.submit-text');
    var textSending = btn.querySelector('.submit-sending');
    var textSent = btn.querySelector('.submit-sent');

    // Simulate sending
    textDefault.style.display = 'none';
    textSending.style.display = 'inline';
    btn.disabled = true;

    setTimeout(function () {
      textSending.style.display = 'none';
      textSent.style.display = 'inline';
      btn.classList.add('sent');

      // Reset after 3s
      setTimeout(function () {
        textSent.style.display = 'none';
        textDefault.style.display = 'inline';
        btn.classList.remove('sent');
        btn.disabled = false;
        contactForm.reset();
      }, 3000);
    }, 1200);
  });

  // =============================================
  // SMOOTH SCROLL FOR ANCHOR LINKS
  // =============================================
  document.querySelectorAll('a[href^="#"]').forEach(function (anchor) {
    anchor.addEventListener('click', function (e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        var offset = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--nav-height')) || 72;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({
          top: top,
          behavior: 'smooth'
        });
        // Update hash without jumping
        history.pushState(null, null, this.getAttribute('href'));
      }
    });
  });

  // =============================================
  // HANDLE HASH ON LOAD
  // =============================================
  if (window.location.hash) {
    var target = document.querySelector(window.location.hash);
    if (target) {
      setTimeout(function () {
        var offset = 72;
        var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
        window.scrollTo({ top: top, behavior: 'smooth' });
      }, 100);
    }
  }

})();