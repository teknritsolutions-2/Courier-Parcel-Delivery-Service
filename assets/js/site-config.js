'use strict';
window.Arcway = window.Arcway || {};
Arcway.config = Object.freeze({brand:'ARCWAY',tagline:'Every parcel has a path.',email:null,phone:null,address:null,hours:null,volumetricDivisor:5000,currency:'INR',dataVersion:1});
try { document.documentElement.dataset.theme = localStorage.getItem('arcway.theme') || 'light'; document.documentElement.dir = localStorage.getItem('arcway.direction') || 'ltr'; } catch (_) {}
