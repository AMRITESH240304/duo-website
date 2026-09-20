/* Duo site — subtle scroll motion on the hero phone + feature reveals.
 * Transform-only, so nothing reflows and nothing shifts layout.
 */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function heroParallax() {
    const shell = document.querySelector(".phone-shell");
    const orbit = document.querySelector(".orbit");
    if (!shell || reduced.matches) return;

    let ticking = false;

    function update() {
      ticking = false;
      // Only the first viewport of scrolling drives the effect.
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      shell.style.transform =
        "translate3d(0," + (-34 * p).toFixed(2) + "px,0) scale(" + (1 - 0.04 * p).toFixed(4) + ")";
      if (orbit) {
        orbit.style.transform = "translate3d(0," + (22 * p).toFixed(2) + "px,0)";
      }
    }

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(update);
      },
      { passive: true }
    );

    update();
  }

  function revealOnScroll() {
    const items = document.querySelectorAll(".reveal");
    if (!items.length) return;

    if (reduced.matches || !("IntersectionObserver" in window)) {
      items.forEach((el) => el.classList.add("in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in");
          io.unobserve(entry.target);
        });
      },
      { rootMargin: "0px 0px -12% 0px", threshold: 0.15 }
    );

    items.forEach((el) => io.observe(el));
  }

  document.addEventListener("DOMContentLoaded", () => {
    heroParallax();
    revealOnScroll();
  });
})();
