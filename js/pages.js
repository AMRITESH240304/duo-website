/* Duo site — founder's note support links, mail links, careers form. */

(function () {
  const cfg = window.DUO_SITE || {};
  const contactEmail = cfg.contactEmail || "duowalkie@gmail.com";
  const careersEmail = cfg.careersEmail || contactEmail;

  function mailto(to, subject, body) {
    const params = [];
    if (subject) params.push("subject=" + encodeURIComponent(subject));
    if (body) params.push("body=" + encodeURIComponent(body));
    return "mailto:" + to + (params.length ? "?" + params.join("&") : "");
  }

  function setupSupport() {
    const section = document.querySelector("[data-support]");
    if (!section) return;

    const support = cfg.support || {};
    if (!support.enabled) {
      section.hidden = true;
      return;
    }

    section.querySelectorAll("[data-support-link]").forEach((card) => {
      const url = support[card.dataset.supportLink];
      if (url) {
        card.href = url;
        card.target = "_blank";
        card.rel = "noopener";
      } else {
        card.classList.add("is-soon");
        card.removeAttribute("href");
        card.setAttribute("aria-disabled", "true");
      }
    });
  }

  function setupMailLinks() {
    document.querySelectorAll("[data-mail]").forEach((link) => {
      const to = link.dataset.mail === "careers" ? careersEmail : contactEmail;
      link.href = mailto(to, link.dataset.mailSubject);
      if (link.hasAttribute("data-mail-show")) link.textContent = to;
    });
  }

  function gmailCompose(to, subject, body) {
    return (
      "https://mail.google.com/mail/?view=cm&fs=1" +
      "&to=" + encodeURIComponent(to) +
      "&su=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body)
    );
  }

  function setupCareersForm() {
    const form = document.getElementById("careers-form");
    if (!form) return;
    const status = form.querySelector(".form-status");
    const button = form.querySelector('button[type="submit"]');
    const fallback = form.querySelector(".form-fallback");
    const buttonLabel = button ? button.textContent : "";

    function setStatus(text, kind) {
      if (!status) return;
      status.textContent = text;
      status.dataset.kind = kind || "";
    }

    function showFallback(subject, body) {
      if (!fallback) return;
      fallback.querySelector('[data-fallback="gmail"]').href = gmailCompose(careersEmail, subject, body);
      fallback.querySelector('[data-fallback="mailto"]').href = mailto(careersEmail, subject, body);
      fallback.hidden = false;
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (!form.reportValidity()) return;

      const data = new FormData(form);
      if (data.get("_honey")) return;

      const name = (data.get("name") || "").trim();
      const email = (data.get("email") || "").trim();
      const area = data.get("area") || "Not sure yet";
      const availability = data.get("availability") || "Not specified";
      const link = (data.get("link") || "").trim();
      const message = (data.get("message") || "").trim();
      const subject = "Careers — " + area + " — " + name;

      const body = [
        message,
        "",
        "—",
        "Name: " + name,
        "Email: " + email,
        "Area: " + area,
        "Availability: " + availability,
        link ? "Link: " + link : null,
      ]
        .filter((line) => line !== null)
        .join("\n");

      if (fallback) fallback.hidden = true;

      if (!cfg.formEndpoint) {
        setStatus("Pick how you'd like to send it:", "");
        showFallback(subject, body);
        return;
      }

      if (button) {
        button.disabled = true;
        button.textContent = "Sending…";
      }
      setStatus("", "");

      try {
        const res = await fetch(cfg.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify({
            _subject: subject,
            _template: "table",
            _captcha: "false",
            name,
            email,
            area,
            availability,
            link: link || "—",
            message,
          }),
        });
        const result = await res.json().catch(() => ({}));
        if (!res.ok || String(result.success) !== "true") {
          throw new Error(result.message || "Send failed");
        }

        form.reset();
        setStatus("Sent. Thanks for writing — we'll get back to you at " + email + ".", "ok");
      } catch (err) {
        setStatus("Couldn't send from the site just now. You can send it yourself instead:", "error");
        showFallback(subject, body);
      } finally {
        if (button) {
          button.disabled = false;
          button.textContent = buttonLabel;
        }
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    setupSupport();
    setupMailLinks();
    setupCareersForm();
  });
})();
