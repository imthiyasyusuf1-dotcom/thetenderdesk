// Mobile menu toggle and header shadow on scroll.
export function initNav() {
  const header = document.querySelector(".site-header");
  const toggle = document.querySelector(".nav__toggle");
  const panel = document.getElementById("nav-panel");
  if (!header) return;

  const onScroll = () => header.classList.toggle("is-scrolled", window.scrollY > 8);
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });

  if (!toggle || !panel) return;
  const setOpen = (open) => {
    toggle.setAttribute("aria-expanded", String(open));
    panel.classList.toggle("is-open", open);
  };
  toggle.addEventListener("click", () => setOpen(toggle.getAttribute("aria-expanded") !== "true"));
  panel.addEventListener("click", (e) => { if (e.target.closest("a")) setOpen(false); });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && panel.classList.contains("is-open")) { setOpen(false); toggle.focus(); }
  });
}
