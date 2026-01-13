(function () {
  var header = document.querySelector('.dr-header');
  if (!header) return;

  var toggle = header.querySelector('.dr-nav-toggle');
  var panel = header.querySelector('.dr-nav-menu-panel');

  if (!toggle || !panel) return;

  function closeMenu() {
    toggle.classList.remove('is-active');
    panel.classList.remove('is-open');
    toggle.setAttribute('aria-expanded', 'false');
    panel.setAttribute('aria-hidden', 'true');
  }

  toggle.addEventListener('click', function () {
    var isOpen = toggle.classList.toggle('is-active');
    if (isOpen) {
      panel.classList.add('is-open');
      toggle.setAttribute('aria-expanded', 'true');
      panel.setAttribute('aria-hidden', 'false');
    } else {
      closeMenu();
    }
  });

  header.addEventListener('click', function (event) {
    if (!panel.classList.contains('is-open')) return;
    var isInsidePanel = panel.contains(event.target);
    var isToggle = toggle.contains(event.target);
    if (!isInsidePanel && !isToggle) {
      closeMenu();
    }
  });
})();
