// In-page section navigation (Conference Venue page).
// Wide screens: a column of dots fixed on the left; the dot of the section in view is highlighted.
// Phones: a round button at the bottom right that opens the same links as a small menu.
(function () {
  var nav = document.querySelector(".section-nav");
  if (!nav) return;
  var toggle = nav.querySelector(".section-nav-toggle");
  var links = Array.prototype.slice.call(nav.querySelectorAll("a[href^='#']"));
  var sections = links.map(function (a) { return document.querySelector(a.getAttribute("href")); });

  function setOpen(open) {
    nav.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  }
  toggle.addEventListener("click", function () { setOpen(!nav.classList.contains("is-open")); });
  links.forEach(function (a) { a.addEventListener("click", function () { setOpen(false); }); });
  document.addEventListener("click", function (e) { if (!nav.contains(e.target)) setOpen(false); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") setOpen(false); });

  // Highlight the section whose top has passed the upper third of the screen
  function update() {
    var line = window.innerHeight * 0.35;
    var current = 0;
    sections.forEach(function (s, i) { if (s && s.getBoundingClientRect().top <= line) current = i; });
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) current = sections.length - 1;
    links.forEach(function (a, i) {
      if (i === current) a.setAttribute("aria-current", "true");
      else a.removeAttribute("aria-current");
    });
  }
  window.addEventListener("scroll", update, { passive: true });
  window.addEventListener("resize", update);
  update();
})();
