const links = document.querySelectorAll('.section-link');
const zones = document.querySelectorAll('.hover-zone');
const locators = document.querySelectorAll('.locator');

function clearActive() {
  links.forEach(link => link.classList.remove('active'));
  zones.forEach(zone => zone.classList.remove('active'));
  locators.forEach(locator => locator.classList.remove('active'));
}

function setActive(id) {
  clearActive();

  const link = document.querySelector(`.section-link[data-section="${id}"]`);
  const zone = document.querySelector(`.hover-zone[data-section="${id}"]`);
  const locator = document.querySelector(`.locator[data-section="${id}"]`);

  if (link) link.classList.add('active');
  if (zone) zone.classList.add('active');
  if (locator) locator.classList.add('active');
}

function goToZone(id) {
  const link = document.querySelector(`.section-link[data-section="${id}"]`);
  if (link && link.getAttribute('href')) {
    window.location.href = link.getAttribute('href');
  }
}

function bindHover(el) {
  const id = el.dataset.section;
  if (!id) return;

  el.addEventListener('mouseenter', () => setActive(id));
  el.addEventListener('focus', () => setActive(id));
  el.addEventListener('mouseleave', clearActive);
  el.addEventListener('blur', clearActive);
}

function bindZoneClick(zone) {
  const id = zone.dataset.section;
  if (!id) return;

  zone.addEventListener('click', (event) => {
    event.preventDefault();
    goToZone(id);
  });
}

links.forEach(bindHover);
zones.forEach(bindHover);
zones.forEach(bindZoneClick);

/* mobile menu */
const menuToggle = document.querySelector('.menu-toggle');

if (menuToggle) {
  menuToggle.addEventListener('click', () => {
    if (window.innerWidth <= 768 && document.body.classList.contains('has-mobile-menu')) {
      document.body.classList.toggle('menu-open');
      menuToggle.setAttribute(
        'aria-expanded',
        document.body.classList.contains('menu-open') ? 'true' : 'false'
      );
    }
  });
}