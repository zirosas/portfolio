(function () {
  var root = document.documentElement;
  var themeButton = document.querySelector('.theme-toggle');
  var themeIcon = themeButton && themeButton.querySelector('.theme-toggle-icon');
  var themeLabel = themeButton && themeButton.querySelector('.theme-toggle-label');
  var darkPreference = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
  var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function savedTheme() {
    try { return localStorage.getItem('theme'); } catch (error) { return null; }
  }

  function renderTheme() {
    if (!themeButton) return;
    var dark = root.getAttribute('data-theme') === 'dark';
    themeButton.setAttribute('aria-pressed', String(dark));
    themeButton.setAttribute('aria-label', dark ? 'Switch to light theme' : 'Switch to dark theme');
    themeIcon.textContent = dark ? '☀' : '☾';
    themeLabel.textContent = dark ? 'Light' : 'Dark';
  }

  if (themeButton) {
    themeButton.addEventListener('click', function () {
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch (error) {}
      renderTheme();
    });
    renderTheme();
  }
  if (darkPreference) {
    var syncPreference = function (event) {
      if (savedTheme()) return;
      root.setAttribute('data-theme', event.matches ? 'dark' : 'light');
      renderTheme();
    };
    if (darkPreference.addEventListener) darkPreference.addEventListener('change', syncPreference);
    else if (darkPreference.addListener) darkPreference.addListener(syncPreference);
  }

  var sections = Array.prototype.slice.call(document.querySelectorAll('main > section'));
  var navLinks = Array.prototype.slice.call(document.querySelectorAll('.site-header nav a'));
  var dataScene = document.querySelector('.data-scene');
  var chartPoints = Array.prototype.slice.call(document.querySelectorAll('.chart-point'));
  var chartAnnotations = Array.prototype.slice.call(document.querySelectorAll('.chart-annotation'));
  var chartCrosshair = document.querySelector('.chart-crosshair');
  var artScene = document.querySelector('.art-scene');
  var processLayers = Array.prototype.slice.call(document.querySelectorAll('.process-layer'));
  var processSteps = Array.prototype.slice.call(document.querySelectorAll('.process-steps li'));
  var interfacePreview = document.querySelector('.interface-preview');
  var previewButton = document.querySelector('.preview-button');
  var heroScene = document.querySelector('.hero-scene');
  var contactScene = document.querySelector('.contact-scene');
  var pending = false;

  previewButton.addEventListener('click', function () {
    var engaged = interfacePreview.classList.toggle('is-engaged');
    previewButton.setAttribute('aria-pressed', String(engaged));
    previewButton.textContent = engaged ? 'Reset interaction ↺' : 'Try the interaction ↗';
    interfacePreview.querySelector('.preview-status').textContent = engaged ? 'RESPONDING' : 'READY';
    interfacePreview.querySelector('.preview-message').textContent = engaged ? 'Now it responds to you.' : 'Ready when you are.';
  });

  function clamp(value) { return Math.max(0, Math.min(1, value)); }
  function progress(element) {
    var box = element.getBoundingClientRect();
    return clamp(-box.top / Math.max(1, box.height - window.innerHeight));
  }
  function update() {
    pending = false;
    var active = sections[0];
    sections.forEach(function (section) {
      if (section.getBoundingClientRect().top <= window.innerHeight * .42) active = section;
    });
    navLinks.forEach(function (link) {
      if (link.getAttribute('href') === '#' + active.id) link.setAttribute('aria-current', 'true');
      else link.removeAttribute('aria-current');
    });
    if (reducedMotion) return;
    var heroProgress = clamp(-heroScene.getBoundingClientRect().top / Math.max(1, heroScene.offsetHeight));
    heroScene.style.setProperty('--portrait-shift', (-38 * heroProgress).toFixed(1) + 'px');
    var dataProgress = progress(dataScene);
    dataScene.style.setProperty('--draw', (1 - dataProgress).toFixed(3));
    dataScene.style.setProperty('--data-opacity', clamp(dataProgress * 2).toFixed(3));
    chartPoints.forEach(function (point, index) {
      var active = dataProgress >= [0, .3, .6, .9][index];
      point.classList.toggle('is-active', active);
      chartAnnotations[index].classList.toggle('is-active', active);
    });
    chartCrosshair.classList.toggle('is-active', dataProgress >= .9);
    var artProgress = progress(artScene);
    artScene.style.setProperty('--sun-shift', (-75 * artProgress).toFixed(1) + 'px');
    artScene.style.setProperty('--disc-shift', (65 * artProgress).toFixed(1) + 'px');
    artScene.style.setProperty('--disc-spin', (28 * artProgress).toFixed(1) + 'deg');
    artScene.style.setProperty('--frame-spin', (-8 + 17 * artProgress).toFixed(1) + 'deg');
    artScene.style.setProperty('--wave-shift', (-55 * artProgress).toFixed(1) + 'px');
    var phaseIndex = Math.min(3, Math.floor(artProgress * 4));
    processLayers.forEach(function (layer, index) { layer.classList.toggle('is-active', index === phaseIndex); });
    processSteps.forEach(function (step, index) { step.classList.toggle('is-active', index === phaseIndex); });
    var contactProgress = clamp((window.innerHeight - contactScene.getBoundingClientRect().top) / Math.max(1, window.innerHeight + contactScene.offsetHeight));
    contactScene.style.setProperty('--orbit-spin', (28 * contactProgress).toFixed(1) + 'deg');
  }
  function requestUpdate() {
    if (pending) return;
    pending = true;
    window.requestAnimationFrame(update);
  }

  if (!reducedMotion && 'IntersectionObserver' in window) {
    var reveals = Array.prototype.slice.call(document.querySelectorAll('[data-reveal]'));
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: .08, rootMargin: '0px 0px -30px 0px' });
    reveals.forEach(function (item) {
      if (item.getBoundingClientRect().top < window.innerHeight - 30) item.classList.add('is-visible');
      else observer.observe(item);
    });
    root.classList.add('motion-ready');
  }
  update();
  window.addEventListener('scroll', requestUpdate, { passive: true });
  window.addEventListener('resize', requestUpdate);
})();
