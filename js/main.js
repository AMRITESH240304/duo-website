/* Duo site — hero sticker/avatar placement + small interactions. */

(function () {
  // Loose, hand-picked positions around the phone. Percent-based so it
  // reflows on resize. Kept clear of the center column and the play badge.
  const PLACEMENTS = [
    { src: "assets/stickers/mic.png", top: "8%", left: "6%", size: 58, r: -10 },
    { src: "assets/stickers/bell.png", top: "14%", left: "84%", size: 54, r: 12 },
    { src: "assets/stickers/message.png", top: "30%", left: "3%", size: 50, r: 8 },
    { src: "assets/stickers/headset.png", top: "62%", left: "5%", size: 60, r: -6 },
    { src: "assets/stickers/handshake.png", top: "70%", left: "88%", size: 56, r: 10 },
    { src: "assets/stickers/boysNgirls.png", top: "40%", left: "90%", size: 62, r: -8 },
    { src: "assets/stickers/gift.png", top: "84%", left: "18%", size: 46, r: 14 },
    { src: "assets/stickers/online_orb.png", top: "20%", left: "42%", size: 40, r: 0 },
    { src: "assets/avatars/cute-duck.png", top: "50%", left: "12%", size: 52, r: -12 },
    { src: "assets/avatars/cool-owl.png", top: "78%", left: "70%", size: 50, r: 9 },
    { src: "assets/avatars/blue-fish.png", top: "10%", left: "64%", size: 48, r: -9 },
  ];

  function scatterFloaties() {
    const layer = document.querySelector(".float-layer");
    if (!layer) return;

    const isSmall = window.matchMedia("(max-width: 720px)").matches;
    const items = isSmall ? PLACEMENTS.slice(0, 6) : PLACEMENTS;

    layer.innerHTML = "";
    items.forEach((spec, i) => {
      const img = document.createElement("img");
      img.src = spec.src;
      img.alt = "";
      img.loading = "lazy";
      img.className = "floatie";
      img.style.top = spec.top;
      img.style.left = spec.left;
      img.style.width = spec.size + "px";
      img.style.setProperty("--r", spec.r + "deg");
      img.style.setProperty("--r2", spec.r + 6 + "deg");
      img.style.animationDelay = i * 0.35 + "s";
      img.style.animationDuration = 6 + (i % 4) + "s";
      layer.appendChild(img);
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    scatterFloaties();
    let resizeTimer;
    window.addEventListener("resize", () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(scatterFloaties, 200);
    });
  });
})();
