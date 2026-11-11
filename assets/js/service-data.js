"use strict";
// Illustrative pricing only. Base includes first 0.5 kg; each additional 0.5 kg is charged.
Arcway.services = Object.freeze({
  local: { name: "Local Delivery", base: 55, increment: 18, zone: 0 },
  domestic: { name: "Domestic Shipping", base: 95, increment: 32, zone: 35 },
  express: { name: "Express Shipping", base: 165, increment: 55, zone: 55 },
});
Arcway.distance = (a, b) => {
  const r = (x) => (x * Math.PI) / 180;
  const h =
    Math.sin(r(b.lat - a.lat) / 2) ** 2 +
    Math.cos(r(a.lat)) *
      Math.cos(r(b.lat)) *
      Math.sin(r(b.lng - a.lng) / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));
};
Arcway.calculate = (data) => {
  const origin = Arcway.city(data.origin),
    destination = Arcway.city(data.destination),
    service = Arcway.services[data.service];
  if (!origin || !destination || !service)
    throw Error("Choose a pickup city, destination city and service.");
  if (data.service === "local" && data.origin !== data.destination)
    throw Error(
      "Local Delivery requires the same pickup and destination city. Choose Domestic or Express for an intercity parcel.",
    );
  if (
    !["kg", "g", "lb"].includes(data.weightUnit || "kg") ||
    !["cm", "in"].includes(data.dimensionUnit || "cm")
  )
    throw Error("Select supported measurement units.");
  const weight =
    Number(data.weight) *
    { kg: 1, g: 0.001, lb: 0.45359237 }[data.weightUnit || "kg"];
  const factor = data.dimensionUnit === "in" ? 2.54 : 1;
  const dimensions = ["length", "width", "height"].map(
    (k) => Number(data[k]) * factor,
  );
  if (!Number.isFinite(weight) || weight <= 0 || weight > 70)
    throw Error(
      "Actual parcel weight must be greater than 0 and at most 70 kg.",
    );
  if (dimensions.some((n) => !Number.isFinite(n) || n <= 0 || n > 200))
    throw Error(
      "Each parcel dimension must be greater than 0 and at most 200 cm.",
    );
  const volumetric =
    dimensions.reduce((a, b) => a * b, 1) / Arcway.config.volumetricDivisor;
  const billable = Math.ceil(Math.max(weight, volumetric) * 2 - 1e-10) / 2;
  if (billable > 70)
    throw Error(
      "This calculator supports a maximum billable weight of 70 kg. Reduce the parcel dimensions or contact the carrier for a quote.",
    );
  const increments = Math.max(0, Math.round((billable - 0.5) * 2));
  const additional = increments * service.increment;
  const distance = Arcway.distance(origin, destination);
  const zone = distance > 1000 ? service.zone : 0;
  return {
    origin,
    destination,
    service: service.name,
    weight,
    volumetric,
    billable,
    base: service.base,
    additional,
    zone,
    increments,
    total: service.base + additional + zone,
    distance,
  };
};
