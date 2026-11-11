# Asset credits and source register

Reviewed 11 November 2026. Assets are bundled locally; no runtime CDN is required.

## Earth land geometry — current visualization

The photographic Earth texture was removed in the visual refinement. The current Earth uses **Natural Earth 1:110m land polygons, pinned version 5.1.2**. Local file: `assets/data/ne_110m_land.geojson`, a 138,160-byte FeatureCollection containing 127 Polygon features.

- [Pinned download](https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson)
- [Land-layer description](https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/)
- [Natural Earth public-domain terms](https://www.naturalearthdata.com/about/terms-of-use/)
- SHA-256: `9e0729ee253ca7d7a5c4ae9395fb1902264c5377c52e224d13dd85010e2835d9`

The genuine land geometry is rendered over Globe.GL's spherical surface with a soft ice-blue material. A depth-only front surface prevents back-side continents appearing through the translucent ocean. The static fallback uses the same land polygons and coordinate-based great-circle route samples projected equirectangularly. Neither uses invented silhouettes. Generalization at 1:110m can omit small islands; city coordinates remain independent geographic references.

The retired NASA raster is not shipped or loaded by the current site. Historical screenshots and earlier QA descriptions refer to the initial version only.

## Geographic data

Coordinate source: [GeoNames largest Indian cities](https://www.geonames.org/IN/largest-cities-in-india.html), [GeoNames India search](https://www.geonames.org/advanced-search.html?country=IN) and [Kochi record 1273874](https://www.geonames.org/1273874/kochi.html). [GeoNames terms](https://www.geonames.org/export/): Creative Commons Attribution 4.0. City centers are geographic references, not depot locations or verified service coverage. Detailed WGS84 coordinates are centralized in `city-data.js`. Five international city centers (Dubai, Singapore, London, Frankfurt and New York) are listed with exact GeoNames records in `globe-source-research.md`. GeoNames attribution is also reachable through the public footer’s Asset credits link.

The small public route diagram is an equirectangular city-coordinate diagram with a graticule, not an administrative boundary map. Its five connections are illustrative. The Earth routes use Globe.GL spherical arcs from those same coordinates. No international service is claimed.

## Photography

| Local asset | Source | Subject | Terms |
| --- | --- | --- | --- |
| `warehouse.jpg` | [Unsplash image 1586528116311-ad8dd3c8310d](https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d) | Warehouse parcel operations | [Unsplash License](https://unsplash.com/license) |
| `parcels.jpg` | [Pexels photo 4481259](https://www.pexels.com/photo/4481259/) / [download](https://images.pexels.com/photos/4481259/pexels-photo-4481259.jpeg) | People and parcels in storage aisles | [Pexels License](https://www.pexels.com/license/) |
| `packing.jpg` | [Pexels photo 4246120](https://www.pexels.com/photo/4246120/) / [download](https://images.pexels.com/photos/4246120/pexels-photo-4246120.jpeg) | Sealing a cardboard parcel with tape | [Pexels License](https://www.pexels.com/license/) |

Stock photographs illustrate the service concept; pictured facilities and people are not represented as ARCWAY property or staff. Unsuitable candidate photos were removed before delivery. Images were visually reviewed, resized for their containers and checked in responsive screenshots. Source photo pages sometimes reject automated fetching; the actual image binaries and platform licensing pages were accessible.

## Libraries

- [Globe.GL](https://globe.gl/), **2.46.2**, MIT, local `assets/vendor/globe.gl-2.46.2.min.js`; source [release distribution](https://cdn.jsdelivr.net/npm/globe.gl@2.46.2/dist/globe.gl.min.js). License included as `globe-LICENSE`. Uses bundled Three.js/WebGL and its geographic visualization dependencies. Initialized on intersection; renderer pixel ratio capped at 1.5.
- [jsPDF](https://github.com/parallax/jsPDF), **3.0.3**, MIT, local `assets/vendor/jspdf-3.0.3.umd.min.js`, license in `jspdf-LICENSE`. Loaded only when a draft invoice PDF is requested.

## Fonts and graphics

- Barlow Condensed, DM Sans, IBM Plex Mono: [Google Fonts](https://github.com/google/fonts), SIL Open Font License 1.1. Local TTF files and font-specific OFL notices are included. Font weights are explicitly declared.
- ARCWAY route-arc symbol, favicon, route diagrams and line icons: original SVG/code for this project.
- Google and Apple marks identify the corresponding unavailable provider options. They do not indicate endorsement or an active OAuth integration.

ARCWAY is a working brand; trademark availability has not been established.
