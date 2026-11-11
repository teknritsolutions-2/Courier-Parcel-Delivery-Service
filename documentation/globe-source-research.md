# Globe redesign source research

Reviewed 11 November 2026. This is a source/API research register; it does not claim visual or implementation verification.

## International city centers

The following values were read directly from each GeoNames populated-place record. Coordinates are WGS84 latitude/longitude in degrees, with north/east positive and south/west negative. These are city centers rather than airports, warehouses, depots or confirmed ARCWAY destinations.

| City | GeoNames ID | Latitude | Longitude | Primary source |
| --- | ---: | ---: | ---: | --- |
| Dubai, UAE | 292223 | 25.07725 | 55.30927 | https://www.geonames.org/292223/dubai.html |
| Singapore | 1880252 | 1.28967 | 103.85007 | https://www.geonames.org/1880252/singapore.html |
| London, United Kingdom | 2643743 | 51.50853 | -0.12574 | https://www.geonames.org/2643743/london.html |
| Frankfurt am Main, Germany | 2925533 | 50.11552 | 8.68417 | https://www.geonames.org/2925533/frankfurt-am-main.html |
| New York City, USA | 5128581 | 40.71427 | -74.00597 | https://www.geonames.org/5128581/new-york-city.html |

GeoNames terms: https://www.geonames.org/export/ — attribution is required; commercial use is allowed and data is supplied as-is. Credit GeoNames with its URL in the asset register. These centers are deliberately consistent with the existing Indian-city data source.

Keep globe-only international cities separate from the calculator/booking coverage dataset. Adding a conceptual marker must not expand actual service eligibility or suggest confirmed operations.

## Accurate land geometry

Recommended small-scale dataset: **Natural Earth 1:110m land polygons, version 5.1.2**.

- Pinned direct GeoJSON: https://raw.githubusercontent.com/nvkelso/natural-earth-vector/v5.1.2/geojson/ne_110m_land.geojson
- Versioned source tree: https://github.com/nvkelso/natural-earth-vector/tree/v5.1.2/110m_physical
- Land-layer description: https://www.naturalearthdata.com/downloads/110m-physical-vectors/110m-land/
- Primary usage terms: https://www.naturalearthdata.com/about/terms-of-use/

The direct file was retrieved and parsed: **138,160 bytes**, GeoJSON **FeatureCollection**, **127 Polygon features**; properties identify `featurecla: Land`. It provides continental/island outlines without administrative boundaries. Use feature `geometry` directly rather than hand-drawing continental shapes. All Natural Earth versions are public domain according to the terms page; attribution is optional, but “Made with Natural Earth” is a useful source acknowledgement.

This is a generalized global dataset suitable for a compact globe, not parcel navigation or legal boundary work. Small islands can be absent at 1:110m scale; geographic city markers remain valid even when their island is simplified.

The photographic NASA texture is unnecessary in the new design. Remove its runtime reference and update current asset credits when the replacement ships.

## Globe.GL 2.46.2 API

Primary versioned API source: https://raw.githubusercontent.com/vasturiano/globe.gl/v2.46.2/README.md

Official web reference: https://globe.gl/

The local UMD bundle exports `Globe` on the global object. It bundles Three.js internally (its header identifies internal Three.js revision 185); it does **not** provide a documented global `THREE` namespace. There is no need to add a second Three.js build just to recolor the existing sphere.

### Surface material and lighting

`globe.globeMaterial()` returns the existing Three.js **MeshPhongMaterial**. Its `color`, `specular`, `shininess`, `transparent`, `opacity`, `depthWrite` and `needsUpdate` properties can be adjusted directly. The `color`/`specular` objects expose `.set(...)`. This avoids reliance on an unavailable `THREE` constructor.

`globe.lights()` returns existing scene lights. The default includes an ambient and an overhead directional light; their intensity/color/position can be tuned without constructing additional classes. `globe.scene()`, `camera()` and `renderer()` expose the respective objects. Subtle material variation plus soft ambient illumination is preferable to a strong atmosphere halo. Determine final opacity from actual screenshots; a starting point around 0.8–0.9 still retains a visible spherical body. Keep depth testing and depth writing enabled unless a tested alternative is needed.

### Land caps and coastlines

Supported methods:

- `.polygonsData(features)`
- `.polygonGeoJsonGeometry('geometry')` — Polygon and MultiPolygon supported.
- `.polygonCapColor(colorOrAccessor)`
- `.polygonCapMaterial(materialOrAccessor)` — takes precedence over cap color when supplied.
- `.polygonSideColor(colorOrAccessor)`
- `.polygonSideMaterial(materialOrAccessor)` — takes precedence over side color.
- `.polygonStrokeColor(colorOrAccessor)` — falsy disables strokes.
- `.polygonAltitude(numberOrAccessor)` — globe-radius units; a small positive value avoids z-fighting.
- `.polygonCapCurvatureResolution(numberOrAccessor)` — angular degrees; lower values increase tessellation.
- `.polygonsTransitionDuration(0)` — prevents decorative rising/extrusion animation.
- `.polygonLabel(...)` — optional hover information, not a substitute for visible route text.

Use low extrusion, softly colored land and restrained coastline strokes; avoid bright opaque raised continents. If reusing the existing material constructor through `new globe.globeMaterial().constructor(...)`, first store the constructor in a variable; chained `new` syntax is error-prone. Custom cap material is optional and should be tested for transparent sorting.

### Readable city labels and back-side occlusion

The native text label height is in angular degrees, not CSS pixels, so apparent text size changes with camera distance. The current code used `labelDotOrientation('left')`; **`left` is not supported**. Documented values are only `right`, `top`, and `bottom`.

For fixed-pixel labels, supported methods are:

- `.htmlElementsData(cities)`
- `.htmlLat('lat')`
- `.htmlLng('lng')`
- `.htmlAltitude(0.01)`
- `.htmlElement(city => HTMLElement)`
- `.htmlTransitionDuration(0)`
- `.htmlElementVisibilityModifier((element, isVisible) => { ... })` (optional)

The API documents that the default behavior automatically hides the Three.js HTML object when it is behind the globe. It is safe to omit the visibility modifier. If supplying one, explicitly set the element's visibility according to `isVisible`; retain any independent collision/selected state logic. Limit city names to selected endpoints (and one inspected city if needed), using the route list for complete keyboard access.

Transparent ocean material can allow opaque back-side **point geometry** to show faintly even though DOM labels are hidden. For explicit front-surface point filtering, use the sphere visibility condition:

`dot(surfacePoint, cameraPosition) > globeRadius * globeRadius`

Here `surfacePoint = globe.getCoords(city.lat, city.lng, 0)`, camera position comes from `globe.camera().position`, and radius from `getGlobeRadius()`. This condition follows the tangent plane of the opaque geographic surface. With a unit camera direction and normalized city vector it becomes `dot(cityUnit, cameraUnit) > 1 / (1 + cameraAltitude)`. Re-evaluate on `onZoom` and update `.pointsData` only when the visible-ID set changes, avoiding unnecessary geometry rebuilding every frame. This recommendation is a geometric inference, not a separate Globe.GL API promise.

### Routes and camera

`arcsData` uses `arcStartLat`, `arcStartLng`, `arcEndLat`, `arcEndLng` to place endpoints geographically. `arcAltitude` is in globe-radius units; using automatic altitude or a distance-scaled low value produces natural raised shortest-arc geometry. `arcDashAnimateTime(0)` disables progression. Keep `arcsTransitionDuration(0)` under reduced motion.

`pointOfView({lat, lng, altitude}, durationMs)` controls the camera. To fit two selected endpoints, compute their spherical vector midpoint rather than averaging longitudes (which fails across the antimeridian). Increase altitude for widely separated endpoints and include the raised arc in the fit. The recommended India-to-Europe/SE Asia routes are well below antipodal separation; they can both be kept on the visible hemisphere when centered this way. Keep unselected arcs subdued and show only the active network, with fewer paths on phones.

All international connections remain conceptual transport-network illustrations, not carrier lanes or commercial flight trajectories.
