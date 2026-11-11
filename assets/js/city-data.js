"use strict";
// GeoNames city centers. WGS84 degrees, north/east positive. CC BY 4.0; see asset-credits.md.
Arcway.cities = Object.freeze([
  {
    id: "hyderabad",
    name: "Hyderabad",
    region: "South",
    state: "Telangana",
    lat: 17.38405,
    lng: 78.45636,
  },
  {
    id: "mumbai",
    name: "Mumbai",
    region: "West",
    state: "Maharashtra",
    lat: 19.07283,
    lng: 72.88261,
  },
  {
    id: "bengaluru",
    name: "Bengaluru",
    region: "South",
    state: "Karnataka",
    lat: 12.97194,
    lng: 77.59369,
  },
  {
    id: "chennai",
    name: "Chennai",
    region: "South",
    state: "Tamil Nadu",
    lat: 13.08784,
    lng: 80.27847,
  },
  {
    id: "delhi",
    name: "Delhi",
    region: "North",
    state: "Delhi",
    lat: 28.65195,
    lng: 77.23149,
  },
  {
    id: "kolkata",
    name: "Kolkata",
    region: "East",
    state: "West Bengal",
    lat: 22.56263,
    lng: 88.36304,
  },
  {
    id: "kochi",
    name: "Kochi",
    region: "South",
    state: "Kerala",
    lat: 9.93988,
    lng: 76.26022,
  },
  {
    id: "pune",
    name: "Pune",
    region: "West",
    state: "Maharashtra",
    lat: 18.51957,
    lng: 73.85535,
  },
  {
    id: "ahmedabad",
    name: "Ahmedabad",
    region: "West",
    state: "Gujarat",
    lat: 23.02579,
    lng: 72.58727,
  },
]);
Arcway.city = (id) => Arcway.cities.find((c) => c.id === id);
Arcway.routes = [
  ["hyderabad", "mumbai"],
  ["hyderabad", "bengaluru"],
  ["mumbai", "delhi"],
  ["chennai", "kolkata"],
  ["mumbai", "kochi"],
].map(([origin, destination], i) => ({
  id: i,
  origin,
  destination,
  startLat: Arcway.city(origin).lat,
  startLng: Arcway.city(origin).lng,
  endLat: Arcway.city(destination).lat,
  endLng: Arcway.city(destination).lng,
}));

// Geographic exploration is separate from domestic shipping eligibility.
// GeoNames WGS84 centers; attribution and exact record URLs are in documentation.
Arcway.internationalCities = Object.freeze([
  {
    id: "dubai",
    name: "Dubai",
    country: "United Arab Emirates",
    lat: 25.07725,
    lng: 55.30927,
  },
  {
    id: "singapore",
    name: "Singapore",
    country: "Singapore",
    lat: 1.28967,
    lng: 103.85007,
  },
  {
    id: "london",
    name: "London",
    country: "United Kingdom",
    lat: 51.50853,
    lng: -0.12574,
  },
  {
    id: "frankfurt",
    name: "Frankfurt",
    country: "Germany",
    lat: 50.11552,
    lng: 8.68417,
  },
  {
    id: "new-york",
    name: "New York",
    country: "United States",
    lat: 40.71427,
    lng: -74.00597,
  },
]);
Arcway.networkCities = [...Arcway.cities, ...Arcway.internationalCities];
Arcway.networkCity = (id) =>
  Arcway.networkCities.find((city) => city.id === id);
Arcway.internationalRoutes = [
  ["mumbai", "dubai"],
  ["mumbai", "singapore"],
  ["delhi", "london"],
  ["bengaluru", "singapore"],
  ["hyderabad", "frankfurt"],
].map(([origin, destination], index) => ({
  id: "international-" + index,
  origin,
  destination,
  startLat: Arcway.networkCity(origin).lat,
  startLng: Arcway.networkCity(origin).lng,
  endLat: Arcway.networkCity(destination).lat,
  endLng: Arcway.networkCity(destination).lng,
}));
Arcway.networks = Object.freeze({
  domestic: {
    name: "Domestic Network",
    cities: Arcway.cities,
    routes: Arcway.routes,
  },
  international: {
    name: "International Network",
    cities: Arcway.networkCities.filter((city) =>
      [
        "mumbai",
        "delhi",
        "bengaluru",
        "hyderabad",
        ...Arcway.internationalCities.map((c) => c.id),
      ].includes(city.id),
    ),
    routes: Arcway.internationalRoutes,
  },
});

// Spherical midpoint fits both endpoints without averaging longitude across a seam.
Arcway.routeCamera = (route) => {
  const rad = (value) => (value * Math.PI) / 180;
  const a = Arcway.networkCity(route.origin),
    b = Arcway.networkCity(route.destination);
  const vector = (city) => [
    Math.cos(rad(city.lat)) * Math.cos(rad(city.lng)),
    Math.cos(rad(city.lat)) * Math.sin(rad(city.lng)),
    Math.sin(rad(city.lat)),
  ];
  const u = vector(a),
    v = vector(b),
    middle = u.map((n, i) => n + v[i]);
  const angle = Math.acos(
    Math.max(
      -1,
      Math.min(
        1,
        u.reduce((sum, n, i) => sum + n * v[i], 0),
      ),
    ),
  );
  return {
    lat:
      (Math.atan2(middle[2], Math.hypot(middle[0], middle[1])) * 180) / Math.PI,
    lng: (Math.atan2(middle[1], middle[0]) * 180) / Math.PI,
    altitude: angle > 0.65 ? 1.8 : 1.4,
  };
};
