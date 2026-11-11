# Asset credits and source register

Reviewed 11 November 2026. Assets are bundled locally; no runtime CDN is required.

## Earth imagery

`assets/images/earth-blue-marble.jpg` is the Blue Marble day texture distributed in the [three-globe example assets](https://github.com/vasturiano/three-globe/blob/master/example/img/earth-blue-marble.jpg). Original raster inspected: **4096 × 2048**, JPEG, north-up, 2:1 equirectangular longitude/latitude map. Local optimized copy: **2048 × 1024**. The complete global raster is used without cropping or mirroring, as a spherical texture through Globe.GL.

Imagery credit: **NASA Earth Observatory / Blue Marble**. Reference: [NASA Blue Marble (2002)](https://science.nasa.gov/earth/earth-observatory/the-blue-marble-true-color-global-imagery-at-1km-resolution/), [NASA imagery/media guidelines](https://www.nasa.gov/nasa-brand-center/images-and-media/). The older Visible Earth collection URL now redirects to NASA Science. The direct historical NASA image download stalled; the static three-globe distribution was used instead. NASA imagery is acknowledged on the globe itself. No NASA logo, endorsement or affiliation is represented.

## Geographic data

Coordinate source: [GeoNames largest Indian cities](https://www.geonames.org/IN/largest-cities-in-india.html), [GeoNames India search](https://www.geonames.org/advanced-search.html?country=IN) and [Kochi record 1273874](https://www.geonames.org/1273874/kochi.html). [GeoNames terms](https://www.geonames.org/export/): Creative Commons Attribution 4.0. City centers are geographic references, not depot locations or verified service coverage. Detailed WGS84 coordinates are centralized in `city-data.js`.

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
