// "OTHER" drop-down in the main menu (every page).
// Wide screens with a mouse also open it on hover (css/style.css); this script makes it
// work by click / tap and keyboard, and closes it on an outside click or the Esc key.
(function () {
  document.querySelectorAll(".nav-more").forEach(function (item) {
    var btn = item.querySelector(".nav-more-btn");
    function set(open) {
      item.classList.toggle("is-open", open);
      btn.setAttribute("aria-expanded", open ? "true" : "false");
    }
    btn.addEventListener("click", function (e) {
      e.stopPropagation();
      set(!item.classList.contains("is-open"));
    });
    document.addEventListener("click", function (e) {
      if (!item.contains(e.target)) set(false);
    });
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && item.classList.contains("is-open")) { set(false); btn.focus(); }
    });
  });
})();
