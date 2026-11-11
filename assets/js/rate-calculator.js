"use strict";
(() => {
  const form = document.querySelector("#rate-form");
  if (!form) return;
  const params = new URLSearchParams(location.search);
  ["origin", "destination", "weight", "service"].forEach((key) => {
    if (params.has(key) && form.elements[key])
      form.elements[key].value = params.get(key);
  });
  const result = document.querySelector("#estimate-result"),
    feedback = document.querySelector("#rate-feedback");
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    feedback.textContent = "";
    if (!form.reportValidity()) return;
    try {
      const data = Object.fromEntries(new FormData(form));
      const r = Arcway.calculate(data);
      const kg = (n) => n.toFixed(2) + " kg";
      result.innerHTML = `<span class="eyebrow">Your estimate</span><span class="badge">${r.service}</span><div class="summary-route"><strong>${r.origin.name}</strong>${Arcway.icon("arrow", "directional")}<strong>${r.destination.name}</strong></div><dl class="breakdown"><div><dt>Actual weight</dt><dd>${kg(r.weight)}</dd></div><div><dt>Volumetric weight</dt><dd>${kg(r.volumetric)}</dd></div><div><dt>Billable weight</dt><dd>${kg(r.billable)}</dd></div></dl><hr style="border:0;border-top:1px solid var(--line)"><dl class="breakdown"><div><dt>Base · first 0.5 kg</dt><dd>${Arcway.money(r.base)}</dd></div><div><dt>Weight charge · ${r.increments} × 0.5 kg</dt><dd>${Arcway.money(r.additional)}</dd></div><div><dt>Distance zone · ${r.distance > 1000 ? "over" : "up to"} 1,000 km</dt><dd>${Arcway.money(r.zone)}</dd></div></dl><div class="estimate-total"><span>Estimated total</span><strong>${Arcway.money(r.total)}</strong></div><p class="form-note">Indicative pricing, excluding taxes. Confirm availability, final charges and delivery dates with your carrier.</p><a class="btn btn-primary" href="dashboard.html?${new URLSearchParams(data)}#book">Continue to Pickup Request ${Arcway.icon("arrow", "directional")}</a>`;
      result.setAttribute("tabindex", "-1");
      result.focus({ preventScroll: true });
      if (innerWidth < 801)
        result.scrollIntoView({
          behavior: matchMedia("(prefers-reduced-motion: reduce)").matches
            ? "instant"
            : "smooth",
          block: "start",
        });
    } catch (error) {
      feedback.textContent = error.message;
      result.innerHTML =
        '<div class="summary-empty"><h3>Check your parcel details</h3><p>' +
        Arcway.escape(error.message) +
        "</p></div>";
    }
  });
  form.addEventListener("input", () => {
    if (!result.querySelector(".summary-empty")) {
      result.innerHTML =
        '<div class="summary-empty"><h3>Details updated</h3><p>Calculate again to refresh your estimate.</p></div>';
    }
  });
  if (params.has("origin")) form.requestSubmit();
})();
