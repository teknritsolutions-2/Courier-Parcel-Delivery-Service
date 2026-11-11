"use strict";
(() => {
  const search = document.querySelector("#city-search");
  if (!search) return;
  const filter = document.querySelector("#region-filter"),
    list = document.querySelector("#city-directory"),
    count = document.querySelector("#city-count");
  const render = () => {
    const query = search.value.trim().toLowerCase();
    const cities = Arcway.cities.filter(
      (c) =>
        (c.name + " " + c.state).toLowerCase().includes(query) &&
        (!filter.value || filter.value === c.region),
    );
    count.textContent =
      cities.length + " " + (cities.length === 1 ? "city" : "cities");
    list.innerHTML = cities.length
      ? cities
          .map(
            (c) =>
              `<article class="city-card"><span class="eyebrow">${c.region} India</span><h3>${c.name}</h3><p style="margin-bottom:10px;font-size:14px">${c.state}</p><span class="mono">${c.lat.toFixed(4)}° N / ${c.lng.toFixed(4)}° E</span><a class="text-link" href="rate-calculator.html?origin=${c.id}">Estimate from here ${Arcway.icon("arrow", "directional")}</a></article>`,
          )
          .join("")
      : '<div class="empty-state" style="grid-column:1/-1"><h3>No matching reference city</h3><p>Try another city or clear the region filter.</p></div>';
  };
  search.addEventListener("input", render);
  filter.addEventListener("change", render);
  render();
})();
