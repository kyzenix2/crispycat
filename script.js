/* Dorito Ear Cat
   ca        paste a real 0x address to turn on Buy, Copy, and the chart
   twitter   full https URL, or leave "" to keep the X buttons as placeholders
   telegram  full https URL, or leave "" to hide Telegram everywhere
*/
const SITE = {
  chain: "BNB",
  chainSlug: "bsc",
  ca: "0x9b6a2c3e00f4baabf2313217f5bfeaae4e5c7a72",
  twitter: "https://x.com/crispycat_X",
  telegram: "",
};

const CA_RE = /^0x[a-fA-F0-9]{40}$/;
const TELEGRAM_SVG =
  '<svg viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="M9.04 15.3 8.9 19c.4 0 .6-.2.8-.4l1.9-1.8 4 2.9c.7.4 1.2.2 1.4-.7l2.5-11.8c.2-1-.4-1.4-1.1-1.2L3.3 10.1c-1 .4-1 1-.2 1.2l4.6 1.4L18.3 6c.5-.3 1-.1.6.2L9.04 15.3z"/></svg>';

let toastTimer = 0;

function isRealCa(value) {
  return CA_RE.test((value || "").trim());
}

function safeHttp(value) {
  const raw = (value || "").trim();
  if (!raw) return "";
  try {
    const url = new URL(raw);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch (err) {
    return "";
  }
  return "";
}

function buyUrl(ca) {
  return "https://pancakeswap.finance/swap?outputCurrency=" + encodeURIComponent(ca);
}

function chartUrl(ca) {
  return "https://dexscreener.com/" + SITE.chainSlug + "/" + ca;
}

function wireLink(el, url) {
  if (!url) {
    el.setAttribute("data-placeholder", "");
    el.removeAttribute("target");
    if (el.tagName === "A") el.setAttribute("href", "#");
    return;
  }
  el.href = url;
  el.target = "_blank";
  el.rel = "noopener noreferrer";
  el.removeAttribute("data-placeholder");
}

function showToast(message) {
  const toast = document.getElementById("toast");
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("is-on");
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(function () {
    toast.classList.remove("is-on");
  }, 2200);
}

function legacyCopy(text) {
  const area = document.createElement("textarea");
  area.value = text;
  area.setAttribute("readonly", "");
  area.style.position = "fixed";
  area.style.left = "0";
  area.style.top = "0";
  area.style.opacity = "0";
  document.body.appendChild(area);
  area.focus();
  area.select();
  area.setSelectionRange(0, area.value.length);
  const ok = document.execCommand("copy");
  document.body.removeChild(area);
  if (!ok) throw new Error("copy failed");
}

function mountChart(ca) {
  const frame = document.getElementById("chart-box");
  if (!frame || !isRealCa(ca)) return;
  const iframe = document.createElement("iframe");
  iframe.className = "chart-iframe";
  iframe.title = "Dorito Ear Cat live chart on DexScreener";
  iframe.src = chartUrl(ca) + "?embed=1&theme=dark&trades=0&info=0";
  iframe.loading = "lazy";
  frame.replaceChildren(iframe);
}

function mountTelegram(url) {
  if (!url) return;

  const hero = document.getElementById("hero-actions");
  if (hero) {
    const link = document.createElement("a");
    link.className = "btn btn-icon";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Telegram");
    link.innerHTML = TELEGRAM_SVG;
    hero.appendChild(link);
  }

  const cards = document.getElementById("community-cards");
  if (cards) {
    const article = document.createElement("article");
    article.className = "card community-card";

    const blob = document.createElement("div");
    blob.className = "icon-blob";
    blob.setAttribute("aria-hidden", "true");
    blob.innerHTML = TELEGRAM_SVG;

    const body = document.createElement("div");
    const title = document.createElement("h3");
    title.textContent = "Telegram";
    const text = document.createElement("p");
    text.textContent = "Join the 妙脆角猫 group for the drop, memes, and chatter.";
    body.append(title, text);

    const join = document.createElement("a");
    join.className = "btn btn-primary";
    join.href = url;
    join.target = "_blank";
    join.rel = "noopener noreferrer";
    join.textContent = "Join Telegram";

    article.append(blob, body, join);
    cards.appendChild(article);
  }

  const social = document.getElementById("footer-social");
  if (social) {
    const link = document.createElement("a");
    link.className = "btn btn-icon";
    link.href = url;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.setAttribute("aria-label", "Telegram");
    link.innerHTML = TELEGRAM_SVG;
    social.appendChild(link);
  }
}

function setActive(id) {
  document.querySelectorAll(".nav-link").forEach(function (link) {
    const on = link.getAttribute("href") === "#" + id;
    link.classList.toggle("is-active", on);
    if (on) link.setAttribute("aria-current", "true");
    else link.removeAttribute("aria-current");
  });
}

function bindChrome() {
  const nav = document.getElementById("nav");
  const menu = document.getElementById("mobile-menu");
  const menuBtn = document.getElementById("menu-btn");
  const sections = ["about", "how-to-buy", "community", "chart"]
    .map(function (id) { return document.getElementById(id); })
    .filter(Boolean);

  function closeMenu() {
    menu.classList.add("hidden");
    menuBtn.setAttribute("aria-expanded", "false");
    menuBtn.setAttribute("aria-label", "Open menu");
  }

  function openMenu() {
    menu.classList.remove("hidden");
    menuBtn.setAttribute("aria-expanded", "true");
    menuBtn.setAttribute("aria-label", "Close menu");
  }

  menuBtn.addEventListener("click", function () {
    if (menu.classList.contains("hidden")) openMenu();
    else closeMenu();
  });

  menu.querySelectorAll("a").forEach(function (link) {
    link.addEventListener("click", closeMenu);
  });

  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") closeMenu();
  });

  window.addEventListener("resize", function () {
    if (window.innerWidth >= 1024) closeMenu();
  });

  let ticking = false;
  function onScroll() {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () {
      nav.classList.toggle("is-scrolled", window.scrollY > 8);
      const mark = window.innerHeight * 0.32;
      let current = "";
      sections.forEach(function (section) {
        if (section.getBoundingClientRect().top <= mark) current = section.id;
      });
      setActive(current);
      ticking = false;
    });
  }

  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

function bindActions() {
  document.addEventListener("click", function (event) {
    const placeholder = event.target.closest("[data-placeholder]");
    if (placeholder) {
      event.preventDefault();
      if (placeholder.hasAttribute("data-buy") || placeholder.hasAttribute("data-chart")) {
        showToast("Live once the contract address drops.");
      } else if (placeholder.hasAttribute("data-twitter")) {
        showToast("X link coming soon.");
      }
      return;
    }

    const copyBtn = event.target.closest("[data-copy]");
    if (!copyBtn) return;
    const value = copyBtn.dataset.copyValue || "TBA";
    const label = copyBtn.dataset.label || "Copy";

    function markCopied() {
      const status = document.getElementById("copy-status");
      if (status) status.textContent = "Copied " + value;
      copyBtn.textContent = "Copied!";
      copyBtn.classList.add("is-copied");
      window.clearTimeout(copyBtn._timer);
      copyBtn._timer = window.setTimeout(function () {
        copyBtn.textContent = label;
        copyBtn.classList.remove("is-copied");
      }, 1600);
    }

    try {
      legacyCopy(value);
      markCopied();
      return;
    } catch (err) {
      /* Clipboard API still runs inside the click when execCommand is blocked. */
    }

    const clipboard = navigator.clipboard && window.isSecureContext
      ? navigator.clipboard.writeText(value)
      : Promise.reject(new Error("copy failed"));

    clipboard.then(markCopied).catch(function () {
      showToast("Select the address and copy it manually.");
    });
  });
}

function init() {
  const ca = (SITE.ca || "").trim();
  const real = isRealCa(ca);
  const display = real ? ca : "TBA";

  document.querySelectorAll("[data-ca]").forEach(function (node) {
    node.textContent = display;
  });
  document.querySelectorAll("[data-copy]").forEach(function (node) {
    node.dataset.copyValue = display;
  });

  const buy = real ? buyUrl(ca) : "";
  document.querySelectorAll("[data-buy]").forEach(function (node) {
    wireLink(node, buy);
  });

  const chart = real ? chartUrl(ca) : "";
  document.querySelectorAll("[data-chart]").forEach(function (node) {
    wireLink(node, chart);
  });

  mountChart(ca);

  const twitter = safeHttp(SITE.twitter);
  document.querySelectorAll("[data-twitter]").forEach(function (node) {
    wireLink(node, twitter);
  });

  mountTelegram(safeHttp(SITE.telegram));
  bindChrome();
  bindActions();
}

init();
