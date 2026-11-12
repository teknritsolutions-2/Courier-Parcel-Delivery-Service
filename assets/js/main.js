"use strict";
Arcway.icons = {
  arrow: '<path d="M4 12h16m-6-6 6 6-6 6"/>',
  chevron: '<path d="m6 9 6 6 6-6"/>',
  box: '<path d="m12 3 9 5-9 5-9-5 9-5ZM3 8v9l9 5 9-5V8M12 13v9M7 5l10 6"/>',
  truck:
    '<path d="M3 6h11v11H3zM14 10h4l3 4v3h-7"/><circle cx="7" cy="18" r="2"/><circle cx="17" cy="18" r="2"/>',
  bolt: '<path d="m13 2-9 12h7l-1 8 10-12h-7l1-8Z"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 5 5"/>',
  sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
  menu: '<path d="M4 6h16M4 12h16M4 18h16"/>',
  close: '<path d="m6 6 12 12M6 18 18 6"/>',
  reset: '<path d="M3 10a9 9 0 1 1 1 7M3 4v6h6"/>',
  up: '<path d="m6 14 6-6 6 6"/>',
  pin: '<path d="M19 10c0 6-7 11-7 11S5 16 5 10a7 7 0 0 1 14 0Z"/><circle cx="12" cy="10" r="2.5"/>',
  download: '<path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-3a8 8 0 0 1 16 0v3"/>',
  calendar:
    '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 11h18"/>',
  eye: '<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
  mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
  check: '<path d="m5 12 4 4L19 6"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
  grid: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>',
  file: '<path d="M14 2H5v20h14V7l-5-5ZM14 2v5h5M8 12h8M8 16h6"/>',
};
Arcway.icon = (name, cls = "") =>
  `<svg class="icon ${cls}" viewBox="0 0 24 24" aria-hidden="true">${Arcway.icons[name] || Arcway.icons.box}</svg>`;
Arcway.logo = (href) =>
  `<a class="brand" href="${href}" aria-label="ARCWAY home"><svg class="brand-symbol" viewBox="0 0 44 44" aria-hidden="true"><path fill="currentColor" d="M3 37 17.5 7h7L39 37h-8.5L21 16.5 11.5 37Z"/><path class="brand-route" d="M8 30h12c8 0 14-4 18-11m-8 0h8v8"/></svg><span class="brand-wordmark">ARCWAY<span class="accent">.</span></span></a>`;
(() => {
  const page = document.body.dataset.page,
    base = page === "home" ? "" : "../",
    pages = base + "pages/";
  const links = [
    ["services.html", "Services", "services"],
    ["rate-calculator.html", "Rate Calculator", "rate-calculator"],
    ["tracking.html", "Track Parcel", "tracking"],
    ["coverage.html", "Coverage", "coverage"],
    ["contact.html", "Contact", "contact"],
  ];
  const header = document.querySelector("[data-header]");
  if (header)
    header.innerHTML = `<div class="site-header"><div class="container nav-wrap">${Arcway.logo(base + "index.html")}<nav class="main-nav" id="main-nav" aria-label="Main navigation"><details class="home-nav"><summary>Home ${Arcway.icon("chevron")}</summary><div class="home-menu"><a href="${base}index.html" ${page === "home" ? 'aria-current="page"' : ""}>Home 1 — Explore</a><a href="${pages}home2.html" ${page === "home2" ? 'aria-current="page"' : ""}>Home 2 — Send</a></div></details>${links.map(([url, label, id]) => `<a href="${pages + url}" ${page === id ? 'aria-current="page"' : ""}>${label}</a>`).join("")}<a href="${pages}dashboard.html" class="mobile-dashboard">Dashboard ↗</a><div class="nav-tools"><button class="btn btn-outline" data-theme-toggle aria-label="Switch theme">${Arcway.icon("sun")} Theme</button><button class="btn btn-outline" data-direction aria-label="Switch direction">RTL</button></div></nav><div class="nav-actions"><button class="icon-btn" data-theme-toggle aria-label="Switch to dark theme">${Arcway.icon("sun")}</button><button class="icon-btn" data-direction aria-label="Switch to right-to-left layout" title="Switch reading direction">RTL</button><a class="login-link" href="${pages}login.html">Login</a><button class="icon-btn mobile-toggle" aria-expanded="false" aria-controls="main-nav" aria-label="Open navigation">${Arcway.icon("menu")}</button></div></div></div>`;
  const footer = document.querySelector("[data-footer]");
  if (footer)
    footer.innerHTML = `<footer class="site-footer"><div class="container"><div class="footer-grid"><div>${Arcway.logo(base + "index.html")}<p>Every parcel has a path.<br>A simpler way to plan yours.</p><span class="mono footer-tagline">PRECISION IN MOTION</span></div><div><h3>EXPLORE ARCWAY</h3><a href="${base}index.html">Home 1 — Explore</a><a href="${pages}home2.html">Home 2 — Send</a><a href="${pages}services.html">Our services</a><a href="${pages}coverage.html">Delivery network</a></div><div><h3>SHIPPING TOOLS</h3><a href="${pages}rate-calculator.html">Calculate a rate</a><a href="${pages}tracking.html">Track a parcel</a><a href="${pages}dashboard.html#book">Request a pickup</a><a href="${pages}services.html#packaging">Packaging guide</a></div><div><h3>YOUR ACCOUNT</h3><a href="${pages}login.html" aria-label="Customer Login"><span class="customer-prefix">Customer </span>Login</a><a href="${pages}signup.html">Create an account</a><a href="${pages}dashboard.html">Customer Dashboard</a><a href="${pages}contact.html">Contact & support</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ARCWAY. Every parcel has a path.</span></div></div></footer>`;
  document
    .querySelectorAll("[data-icon]")
    .forEach(
      (e) =>
        (e.innerHTML = Arcway.icon(
          e.dataset.icon,
          e.dataset.icon === "arrow" ? "directional" : "",
        )),
    );
  document
    .querySelectorAll("[data-logo]")
    .forEach((e) => (e.innerHTML = Arcway.logo(base + "index.html")));
  Arcway.fillCities();
  const themeButtons = document.querySelectorAll("[data-theme-toggle]"),
    dirButtons = document.querySelectorAll("[data-direction]");
  function sync() {
    const dark = document.documentElement.dataset.theme === "dark",
      rtl = document.documentElement.dir === "rtl";
    themeButtons.forEach((b) => {
      b.setAttribute(
        "aria-label",
        `Switch to ${dark ? "light" : "dark"} theme`,
      );
      b.setAttribute("aria-pressed", String(dark));
    });
    dirButtons.forEach((b) => {
      b.textContent = rtl ? "LTR" : "RTL";
      b.setAttribute(
        "aria-label",
        `Switch to ${rtl ? "left-to-right" : "right-to-left"} layout`,
      );
      b.setAttribute("aria-pressed", String(rtl));
    });
  }
  themeButtons.forEach((b) =>
    b.addEventListener("click", () => {
      const value =
        document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      document.documentElement.dataset.theme = value;
      try {
        localStorage.setItem("arcway.theme", value);
      } catch (_) {}
      sync();
    }),
  );
  dirButtons.forEach((b) =>
    b.addEventListener("click", () => {
      const value = document.documentElement.dir === "rtl" ? "ltr" : "rtl";
      document.documentElement.dir = value;
      try {
        localStorage.setItem("arcway.direction", value);
      } catch (_) {}
      sync();
    }),
  );
  sync();
  const toggle = document.querySelector(".mobile-toggle"),
    nav = document.querySelector(".main-nav");
  const compactNav = matchMedia("(max-width: 1320px)");
  let navDrawer;
  if (nav && header) {
    navDrawer = document.createElement("dialog");
    navDrawer.className = "nav-drawer";
    navDrawer.setAttribute("aria-label", "Main navigation");
    navDrawer.innerHTML = `<div class="nav-drawer-head">${Arcway.logo(base + "index.html")}<button class="icon-btn" type="button" data-close-navigation aria-label="Close navigation">${Arcway.icon("close")}</button></div><div class="nav-drawer-body"><a class="btn btn-primary nav-drawer-login" href="${pages}login.html">Login ${Arcway.icon("arrow")}</a></div>`;
    header.append(navDrawer);
    navDrawer
      .querySelector("[data-close-navigation]")
      .addEventListener("click", closeMenu);
    navDrawer.addEventListener("keydown", (event) => {
      if (event.key !== "Tab") return;
      const focusable = [
        ...navDrawer.querySelectorAll('a, button, summary, [tabindex="0"]'),
      ].filter((element) => !element.disabled && element.checkVisibility());
      if (!focusable.length) return;
      event.preventDefault();
      const index = focusable.indexOf(document.activeElement);
      const next =
        (index + (event.shiftKey ? -1 : 1) + focusable.length) %
        focusable.length;
      focusable[next].focus();
    });
    navDrawer.addEventListener("cancel", (event) => {
      event.preventDefault();
      closeMenu();
    });
    navDrawer.addEventListener("click", (event) => {
      if (event.target !== navDrawer) return;
      const bounds = navDrawer.getBoundingClientRect();
      if (
        event.clientX < bounds.left ||
        event.clientX > bounds.right ||
        event.clientY < bounds.top ||
        event.clientY > bounds.bottom
      )
        closeMenu();
    });
    nav.addEventListener("click", (event) => {
      if (event.target.closest("a")) closeMenu();
    });
    function placeNavigation() {
      closeMenu();
      if (compactNav.matches)
        navDrawer.querySelector(".nav-drawer-body").prepend(nav);
      else
        header
          .querySelector(".nav-wrap")
          .insertBefore(nav, header.querySelector(".nav-actions"));
    }
    compactNav.addEventListener("change", placeNavigation);
    placeNavigation();
  }
  function closeMenu() {
    nav?.classList.remove("is-open");
    nav?.querySelectorAll("details[open]").forEach((item) => {
      item.open = false;
    });
    if (navDrawer?.open) navDrawer.close();
    document.documentElement.classList.remove("navigation-open");
    toggle?.setAttribute("aria-expanded", "false");
    toggle?.setAttribute("aria-label", "Open navigation");
  }
  toggle?.addEventListener("click", () => {
    if (navDrawer.open) return closeMenu();
    nav.classList.add("is-open");
    toggle.setAttribute("aria-expanded", "true");
    toggle.setAttribute("aria-label", "Close navigation");
    document.documentElement.classList.add("navigation-open");
    navDrawer.showModal();
    navDrawer.querySelector("[data-close-navigation]").focus();
  });
  document.addEventListener("click", (e) => {
    document.querySelectorAll(".home-nav[open]").forEach((d) => {
      if (!d.contains(e.target)) d.open = false;
    });
    if (toggle && !e.target.closest("[data-header]")) closeMenu();
  });
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (nav?.classList.contains("is-open")) {
        closeMenu();
        toggle.focus();
      }
      document.querySelectorAll(".home-nav[open]").forEach((d) => {
        d.open = false;
        d.querySelector("summary").focus();
      });
    }
  });
  document.querySelectorAll("[data-tracking-shortcut]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.reportValidity()) {
        const id = new FormData(form).get("tracking").trim().toUpperCase();
        location.href = pages + "tracking.html?id=" + encodeURIComponent(id);
      }
    }),
  );
  document.querySelectorAll("[data-mini-estimate]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.reportValidity())
        location.href =
          pages +
          "rate-calculator.html?" +
          new URLSearchParams(new FormData(form)).toString();
    }),
  );
  document.querySelectorAll("[data-quick-book]").forEach((form) =>
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      if (form.reportValidity())
        location.href =
          pages +
          "dashboard.html?" +
          new URLSearchParams(new FormData(form)).toString() +
          "#book";
    }),
  );
  const top = document.querySelector(".back-top");
  if (top) {
    function placeBackToTop() {
      const footerBottom = footer?.querySelector(".footer-bottom");
      if (compactNav.matches && footerBottom) footerBottom.append(top);
      else document.body.append(top);
    }
    compactNav.addEventListener("change", placeBackToTop);
    placeBackToTop();
    const check = () => (top.hidden = window.scrollY < 450);
    window.addEventListener("scroll", check, { passive: true });
    check();
    top.addEventListener("click", () =>
      window.scrollTo({
        top: 0,
        behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
          ? "instant"
          : "smooth",
      }),
    );
  }
  document
    .querySelectorAll("[data-close-dialog]")
    .forEach((b) =>
      b.addEventListener("click", () => b.closest("dialog").close()),
    );
  window.addEventListener("storage", (e) => {
    if (e.key?.startsWith("arcway.shipments"))
      window.dispatchEvent(new Event("arcway:shipments"));
  });
})();
