"use strict";
Arcway.escape = (value) =>
  String(value ?? "").replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );
Arcway.money = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n);
Arcway.date = (date) =>
  date
    ? new Intl.DateTimeFormat("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(date.length === 10 ? date + "T12:00:00+05:30" : date))
    : "Not scheduled";
Arcway.today = () =>
  new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
Arcway.storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem("arcway." + key);
      return value ? JSON.parse(value) : fallback;
    } catch (_) {
      return fallback;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem("arcway." + key, JSON.stringify(value));
      return true;
    } catch (_) {
      return false;
    }
  },
};
Arcway.toast = (message) => {
  let el = document.querySelector(".toast");
  if (!el) {
    el = document.createElement("div");
    el.className = "toast";
    el.setAttribute("role", "status");
    document.body.append(el);
  }
  el.textContent = message;
  clearTimeout(Arcway.toastTimer);
  Arcway.toastTimer = setTimeout(() => el.remove(), 6000);
};
Arcway.cityOptions = (selected) =>
  Arcway.cities
    .map(
      (c) =>
        `<option value="${c.id}" ${c.id === selected ? "selected" : ""}>${c.name}</option>`,
    )
    .join("");
Arcway.serviceOptions = (selected) =>
  Object.entries(Arcway.services)
    .map(
      ([id, s]) =>
        `<option value="${id}" ${id === selected ? "selected" : ""}>${s.name}</option>`,
    )
    .join("");
Arcway.fillCities = () =>
  document.querySelectorAll("select[data-cities]").forEach((select) => {
    select.innerHTML = Arcway.cityOptions(
      select.dataset.selected || "hyderabad",
    );
  });
Arcway.link = (file) =>
  (document.body.dataset.page === "home" ? "pages/" : "") + file;
