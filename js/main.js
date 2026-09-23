/* Duo site — subtle scroll motion on the hero phone, feature reveals, and the
 * line that threads the four features together as you scroll past them.
 * Transform / stroke only, so nothing reflows and nothing shifts layout.
 */

(function () {
  const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

  function clamp01(n) {
    return n < 0 ? 0 : n > 1 ? 1 : n;
  }

  /* The header sits clear over the hero art and only picks up a background
   * once the page has scrolled, so it stays readable over the sections below. */
  function stickyHeader() {
    const header = document.querySelector(".site-header");
    if (!header) return;

    let ticking = false;

    function update() {
      ticking = false;
      header.classList.toggle("is-stuck", window.scrollY > 24);
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

  function heroParallax() {
    const shell = document.querySelector(".phone-shell");
    if (!shell || reduced.matches) return;

    let ticking = false;

    function update() {
      ticking = false;
      // Only the first viewport of scrolling drives the effect.
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      shell.style.transform =
        "translate3d(0," + (-34 * p).toFixed(2) + "px,0) scale(" + (1 - 0.04 * p).toFixed(4) + ")";
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

  /* Vertical switcher for the hero illustrations. Three states per slide:
   * active (in frame), out (riding up and away) and parked (waiting below with
   * transitions off). Parking is what lets a slide jump from the top back to
   * the bottom without being seen crossing the frame. */
  function heroCarousel() {
    const stage = document.querySelector("[data-hero-carousel]");
    if (!stage) return;

    const slides = Array.from(stage.querySelectorAll(".hero-slide"));
    if (slides.length < 2) return;

    const HOLD = 4200;
    let current = Math.max(0, slides.findIndex((el) => el.classList.contains("is-active")));
    let timer = null;

    function step() {
      const next = (current + 1) % slides.length;
      slides.forEach((el, i) => {
        el.classList.remove("is-active", "is-out", "is-parked");
        if (i === next) el.classList.add("is-active");
        else if (i === current) el.classList.add("is-out");
        else el.classList.add("is-parked");
      });
      current = next;
    }

    function start() {
      if (!timer) timer = setInterval(step, HOLD);
    }

    function stop() {
      clearInterval(timer);
      timer = null;
    }

    // don't burn a timer on a tab nobody is looking at
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) stop();
      else start();
    });

    start();
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

  /* The connector is measured from the real DOM: the dots own their position
   * in CSS (centre on desktop, left margin on narrow screens), and the path is
   * drawn through wherever they actually ended up. So the line follows the
   * layout instead of guessing at it. */
  function featureFlow() {
    const list = document.querySelector("[data-feature-flow]");
    if (!list) return;

    const svg = list.querySelector(".feature-line");
    const track = list.querySelector(".feature-line-track");
    const flow = list.querySelector(".feature-line-flow");
    const nodes = Array.from(list.querySelectorAll(".feature-node"));
    if (!svg || !track || !flow || nodes.length < 2) return;

    let length = 0;
    let stops = [];
    let ticking = false;

    function buildPath(points) {
      let d = "M " + points[0].x.toFixed(1) + " " + points[0].y.toFixed(1);
      for (let i = 1; i < points.length; i++) {
        const a = points[i - 1];
        const b = points[i];
        const ease = (b.y - a.y) * 0.45; // vertical tangents => smooth S-curves
        d +=
          " C " + a.x.toFixed(1) + " " + (a.y + ease).toFixed(1) +
          ", " + b.x.toFixed(1) + " " + (b.y - ease).toFixed(1) +
          ", " + b.x.toFixed(1) + " " + b.y.toFixed(1);
      }
      return d;
    }

    // Where along the drawn stroke each dot sits, so it lights up exactly as
    // the line arrives (the curves make this slightly longer than its y ratio).
    function lengthStops(total) {
      const SAMPLES = 240;
      const ys = [];
      for (let i = 0; i <= SAMPLES; i++) {
        ys.push(flow.getPointAtLength((total * i) / SAMPLES).y);
      }
      return nodes.map((node) => {
        const y = Number(node.dataset.flowY);
        for (let i = 0; i <= SAMPLES; i++) {
          if (ys[i] >= y) return i / SAMPLES;
        }
        return 1;
      });
    }

    function measure() {
      const box = list.getBoundingClientRect();
      if (!box.height || !box.width) return;

      const points = nodes.map((node) => {
        const r = node.getBoundingClientRect();
        const point = {
          x: r.left - box.left + r.width / 2,
          y: r.top - box.top + r.height / 2,
        };
        node.dataset.flowY = point.y;
        return point;
      });

      // run the line in from the top edge of the list and out the bottom
      const d = buildPath([
        { x: points[0].x, y: 0 },
        ...points,
        { x: points[points.length - 1].x, y: box.height },
      ]);

      svg.setAttribute("viewBox", "0 0 " + box.width + " " + box.height);
      track.setAttribute("d", d);
      flow.setAttribute("d", d);

      length = flow.getTotalLength();
      flow.style.strokeDasharray = length;
      stops = lengthStops(length);
      paint();
    }

    function paint() {
      if (!length) return;

      let p = 1;
      if (!reduced.matches) {
        const box = list.getBoundingClientRect();
        // the line follows a reading line a little below mid-viewport
        p = clamp01((window.innerHeight * 0.68 - box.top) / box.height);
      }

      flow.style.strokeDashoffset = (length * (1 - p)).toFixed(2);
      nodes.forEach((node, i) => {
        node.classList.toggle("lit", p >= stops[i] - 0.005);
      });
    }

    window.addEventListener(
      "scroll",
      () => {
        if (ticking) return;
        ticking = true;
        requestAnimationFrame(() => {
          ticking = false;
          paint();
        });
      },
      { passive: true }
    );

    // Lazy-loaded feature art changes the list height as it arrives, so keep
    // re-measuring instead of trusting the first pass.
    if ("ResizeObserver" in window) {
      new ResizeObserver(measure).observe(list);
    } else {
      window.addEventListener("resize", measure);
      window.addEventListener("load", measure);
    }

    measure();
  }

  function heroPhoneVideo() {
    const video = document.querySelector("[data-phone-video]");
    const toggle = document.querySelector("[data-phone-audio]");
    if (!video || !toggle) return;

    function label(key, fallback) {
      const dict = window.DuoI18n && window.DuoI18n.dict;
      return (dict && dict[key]) || fallback;
    }

    function syncUi() {
      const unmuted = !video.muted;
      toggle.setAttribute("aria-pressed", unmuted ? "true" : "false");
      toggle.setAttribute(
        "aria-label",
        unmuted ? label("hero.mute", "Mute demo") : label("hero.unmute", "Unmute demo")
      );
    }

    function fitScreenToVideo() {
      const screen = video.closest(".phone-screen");
      if (!screen || !video.videoWidth || !video.videoHeight) return;
      screen.style.aspectRatio = video.videoWidth + " / " + video.videoHeight;
    }

    function ensurePlaying() {
      if (!video.paused) return;
      const play = video.play();
      if (play && typeof play.catch === "function") play.catch(() => {});
    }

    toggle.addEventListener("click", () => {
      video.muted = !video.muted;
      if (!video.muted) ensurePlaying();
      syncUi();
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) ensurePlaying();
    });

    video.addEventListener("pause", () => {
      if (!document.hidden) ensurePlaying();
    });

    video.addEventListener("loadedmetadata", fitScreenToVideo);
    if (video.readyState >= 1) fitScreenToVideo();

    video.muted = true;
    syncUi();
    ensurePlaying();
  }

  document.addEventListener("DOMContentLoaded", () => {
    stickyHeader();
    heroParallax();
    heroCarousel();
    heroPhoneVideo();
    revealOnScroll();
    featureFlow();
  });
})();
