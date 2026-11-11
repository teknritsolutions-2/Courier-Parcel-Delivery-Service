"use strict";

// The explorer is deliberately independent of calculator eligibility and pricing.
(() => {
  const shell = document.querySelector(".globe-shell");
  if (!shell) return;
  const stage = shell.querySelector(".globe-stage");
  const explorer = shell.closest(".network-explorer");
  const label = explorer.querySelector("[data-route-label]");
  const detail = explorer.querySelector("[data-city-info]");
  const citySelect = explorer.querySelector("[data-globe-city]");
  const rotateButton = explorer.querySelector("[data-globe-rotate]");
  const resetButton = explorer.querySelector("[data-globe-reset]");
  const routeList = document.querySelector(".route-options");
  const routeSelect = document.querySelector("[data-route-select]");
  const networkButtons = explorer.querySelectorAll("button[data-network]");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)");
  const compact = matchMedia("(max-width: 600px)");
  const base = document.body.dataset.page === "home" ? "assets/" : "../assets/";
  let network = "domestic",
    selected = Arcway.routes[0];
  let globe,
    land,
    rotating = false,
    disposed = false,
    inView = true;
  let visibleIds = "",
    resizeObserver,
    visibilityObserver;
  let focusedCity = null;

  const currentNetwork = () => Arcway.networks[network];
  const city = (id) => Arcway.networkCity(id);
  const coord = (n, positive, negative) =>
    `${Math.abs(n).toFixed(2)}° ${n < 0 ? negative : positive}`;
  const coordinateText = (c) =>
    `${coord(c.lat, "N", "S")}, ${coord(c.lng, "E", "W")}`;
  const selectedCities = () =>
    focusedCity
      ? [focusedCity]
      : [city(selected.origin), city(selected.destination)];
  const visibleRoutes = () => {
    const routes = currentNetwork().routes;
    return compact.matches
      ? [selected, ...routes.filter((r) => r.id !== selected.id).slice(0, 2)]
      : routes;
  };

  function stopRotation() {
    rotating = false;
    if (globe) globe.controls().autoRotate = false;
    rotateButton.setAttribute("aria-pressed", "false");
    rotateButton.setAttribute("aria-label", "Start slow Earth rotation");
  }

  function makeLabel(c) {
    const other = selectedCities().find((d) => d.id !== c.id);
    const element = document.createElement("div");
    element.className =
      "globe-city-label" + (other && c.lng < other.lng ? " west" : "");
    const text = document.createElement("span");
    text.className = "globe-city-name";
    text.textContent = c.name;
    element.append(text);
    return element;
  }

  // Prevent far-side city meshes showing through the translucent ocean material.
  // For a surface point P and camera C, visibility is dot(P, C) > radius².
  function updateVisiblePoints() {
    if (!globe || disposed) return;
    const candidates = compact.matches
      ? currentNetwork().cities.filter(
          (c) =>
            visibleRoutes().some(
              (r) => r.origin === c.id || r.destination === c.id,
            ) || focusedCity?.id === c.id,
        )
      : currentNetwork().cities;
    const camera = globe.camera().position;
    const radiusPoint = globe.getCoords(0, 0, 0);
    const radiusSquared =
      radiusPoint.x ** 2 + radiusPoint.y ** 2 + radiusPoint.z ** 2;
    const points = candidates.filter((c) => {
      const p = globe.getCoords(c.lat, c.lng, 0);
      return p.x * camera.x + p.y * camera.y + p.z * camera.z > radiusSquared;
    });
    const ids = points.map((c) => c.id).join(",");
    if (ids !== visibleIds) {
      visibleIds = ids;
      globe.pointsData(points);
    }
  }

  function renderGlobe(moveCamera = true) {
    if (!globe || disposed) return;
    globe
      .arcsData(
        visibleRoutes().flatMap((route) =>
          route.id === selected.id && !reduced.matches
            ? [
                { ...route, layer: "base" },
                { ...route, layer: "progress" },
              ]
            : [{ ...route, layer: "base" }],
        ),
      )
      .arcColor((r) =>
        r.id === selected.id
          ? r.layer === "progress"
            ? "#f36b3f"
            : "rgba(213,98,57,0.72)"
          : "rgba(81,125,148,0.66)",
      )
      .arcStroke((r) =>
        r.id === selected.id ? (r.layer === "progress" ? 0.72 : 0.36) : 0.28,
      )
      .arcDashLength((r) => (r.layer === "progress" ? 0.25 : 1))
      .arcDashGap((r) => (r.layer === "progress" ? 0.95 : 0))
      .arcDashAnimateTime(reduced.matches ? 0 : 5400)
      .htmlElementsData(
        selectedCities().map(({ id, name, lat, lng }) => ({
          id,
          name,
          lat,
          lng,
        })),
      )
      .pointRadius((c) =>
        selectedCities().some((d) => d.id === c.id) ? 0.5 : 0.28,
      );
    visibleIds = "";
    updateVisiblePoints();
    if (moveCamera) {
      const view = focusedCity
        ? { lat: focusedCity.lat, lng: focusedCity.lng, altitude: 1.4 }
        : Arcway.routeCamera(selected);
      globe.pointOfView(view, reduced.matches ? 0 : 700);
    }
  }

  function renderControls() {
    networkButtons.forEach((button) =>
      button.setAttribute(
        "aria-pressed",
        String(button.dataset.network === network),
      ),
    );
    shell.dataset.network = network;
    citySelect.innerHTML =
      '<option value="">Inspect a city</option>' +
      currentNetwork()
        .cities.map((c) => `<option value="${c.id}">${c.name}</option>`)
        .join("");
    routeList.innerHTML = currentNetwork()
      .routes.map(
        (r) =>
          `<button type="button" class="route-option" data-route="${r.id}" aria-pressed="${r.id === selected.id}"><span>${city(r.origin).name}</span><span aria-hidden="true">→</span><span>${city(r.destination).name}</span></button>`,
      )
      .join("");
    routeList.querySelectorAll("[data-route]").forEach((button) =>
      button.addEventListener("click", () => {
        const route = currentNetwork().routes.find(
          (r) => String(r.id) === button.dataset.route,
        );
        if (route) selectRoute(route);
      }),
    );
    routeSelect.innerHTML = currentNetwork()
      .routes.map(
        (r) =>
          `<option value="${r.id}" ${r.id === selected.id ? "selected" : ""}>${city(r.origin).name} → ${city(r.destination).name}</option>`,
      )
      .join("");
    label.textContent = `${city(selected.origin).name} → ${city(selected.destination).name}`;
    detail.textContent =
      network === "domestic"
        ? "Within India"
        : `India → ${city(selected.destination).country}`;
  }

  function selectRoute(route) {
    stopRotation();
    selected = route;
    focusedCity = null;
    renderControls();
    renderGlobe();
    renderFallback();
  }

  function inspectCity(c) {
    if (!c) return;
    stopRotation();
    focusedCity = c;
    citySelect.value = c.id;
    detail.textContent = `${c.name} · ${coordinateText(c)}`;
    renderGlobe();
    renderFallback();
  }

  networkButtons.forEach((button) =>
    button.addEventListener("click", () => {
      network = button.dataset.network;
      selectRoute(currentNetwork().routes[0]);
    }),
  );
  routeSelect.addEventListener("change", () => {
    const route = currentNetwork().routes.find(
      (r) => String(r.id) === routeSelect.value,
    );
    if (route) selectRoute(route);
  });
  citySelect.addEventListener("change", () =>
    inspectCity(city(citySelect.value)),
  );
  resetButton.addEventListener("click", () =>
    selectRoute(currentNetwork().routes[0]),
  );
  rotateButton.addEventListener("click", () => {
    if (!globe || disposed) return;
    if (reduced.matches) {
      Arcway.toast(
        "Slow rotation is off while reduced motion is enabled. Choose a city or route to explore.",
      );
      return;
    }
    rotating = !rotating;
    globe.controls().autoRotate = rotating;
    rotateButton.setAttribute("aria-pressed", String(rotating));
    rotateButton.setAttribute(
      "aria-label",
      rotating ? "Pause Earth rotation" : "Start slow Earth rotation",
    );
  });

  // Static fallback: the SAME Natural Earth polygons and a coordinate-based
  // great-circle route, projected equirectangularly. No invented land silhouettes.
  function renderFallback() {
    if (!land) return;
    const map = shell.querySelector("[data-network-map]");
    const project = (lat, lng) => [
      ((lng + 180) * 600) / 360,
      ((85 - lat) * 290) / 170,
    ];
    const line = (coordinates) =>
      coordinates
        .map(
          ([lng, lat], i) =>
            `${i ? "L" : "M"}${project(lat, lng)
              .map((n) => n.toFixed(2))
              .join(",")}`,
        )
        .join(" ") + " Z";
    const paths = land.features
      .map(
        (feature) =>
          `<path class="land" fill-rule="evenodd" d="${feature.geometry.coordinates.map(line).join(" ")}"/>`,
      )
      .join("");
    function greatCircle(route) {
      const a = city(route.origin),
        b = city(route.destination),
        rad = Math.PI / 180;
      const vector = (c) => [
        Math.cos(c.lat * rad) * Math.cos(c.lng * rad),
        Math.cos(c.lat * rad) * Math.sin(c.lng * rad),
        Math.sin(c.lat * rad),
      ];
      const u = vector(a),
        v = vector(b);
      const omega = Math.acos(
        Math.max(
          -1,
          Math.min(
            1,
            u.reduce((sum, n, i) => sum + n * v[i], 0),
          ),
        ),
      );
      return Array.from({ length: 41 }, (_, i) => {
        const t = i / 40,
          x = Math.sin((1 - t) * omega) / Math.sin(omega),
          y = Math.sin(t * omega) / Math.sin(omega);
        const p = u.map((n, j) => n * x + v[j] * y);
        return project(
          Math.atan2(p[2], Math.hypot(p[0], p[1])) / rad,
          Math.atan2(p[1], p[0]) / rad,
        );
      })
        .map(
          (p, i) => `${i ? "L" : "M"}${p.map((n) => n.toFixed(2)).join(",")}`,
        )
        .join(" ");
    }
    const arcs = visibleRoutes()
      .map(
        (r) =>
          `<path class="map-arc ${r.id === selected.id ? "selected" : ""}" d="${greatCircle(r)}"/>`,
      )
      .join("");
    const dots = currentNetwork()
      .cities.map((c) => {
        const [x, y] = project(c.lat, c.lng);
        return `<circle class="map-dot" cx="${x}" cy="${y}" r="${selectedCities().some((d) => d.id === c.id) ? 3.5 : 2}"/>`;
      })
      .join("");
    map.innerHTML = `<svg viewBox="0 0 600 290" role="img" aria-label="${currentNetwork().name}: ${city(selected.origin).name} to ${city(selected.destination).name}. Accurate Natural Earth land geometry.">${paths}${arcs}${dots}</svg>`;
  }

  function fallback() {
    stopRotation();
    shell.classList.remove("globe-ready");
    shell.classList.add("globe-unavailable");
    if (globe && !disposed) {
      disposed = true;
      globe.pauseAnimation();
      resizeObserver?.disconnect();
      visibilityObserver?.disconnect();
      globe.controls().removeEventListener("change", updateVisiblePoints);
      globe._destructor();
    }
    stage.replaceChildren();
    rotateButton.disabled = true;
    renderFallback();
  }

  function loadLibrary() {
    if (window.Globe) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = base + "vendor/globe.gl-2.46.2.min.js";
      script.onload = resolve;
      script.onerror = () => reject(Error("Globe library unavailable"));
      document.head.append(script);
    });
  }

  async function initialize() {
    try {
      const response = await fetch(base + "data/ne_110m_land.geojson", {
        signal: AbortSignal.timeout(12000),
      });
      if (!response.ok) throw Error("Land geometry unavailable");
      land = await response.json();
      renderFallback();
      const test = document.createElement("canvas");
      const context = test.getContext("webgl2");
      if (!context) return fallback();
      context.getExtension("WEBGL_lose_context")?.loseContext();
      await loadLibrary();
      globe = new Globe(stage, {
        animateIn: false,
        rendererConfig: { alpha: true, antialias: devicePixelRatio < 2 },
      })
        .width(shell.clientWidth)
        .height(shell.clientHeight)
        .backgroundColor("rgba(0,0,0,0)")
        .showAtmosphere(true)
        .atmosphereColor("#b5d8ed")
        .atmosphereAltitude(0.075)
        .polygonsData(land.features)
        .polygonAltitude(0.002)
        .polygonCapColor(() => "rgba(161,196,215,0.88)")
        .polygonSideColor(() => "rgba(140,180,200,0.22)")
        .polygonStrokeColor(() => "#8cb4c8")
        .polygonsTransitionDuration(0)
        .pointLat("lat")
        .pointLng("lng")
        .pointAltitude(0.009)
        .pointColor(() => "#f36b3f")
        .pointLabel((c) => `${c.name} · ${coordinateText(c)}`)
        .pointsTransitionDuration(0)
        .onPointClick(inspectCity)
        .arcStartLat("startLat")
        .arcStartLng("startLng")
        .arcEndLat("endLat")
        .arcEndLng("endLng")
        .arcAltitude((r) =>
          network === "domestic"
            ? 0.045
            : Math.min(
                0.27,
                Arcway.distance(city(r.origin), city(r.destination)) / 28000,
              ),
        )
        .arcCurveResolution(48)
        .arcsTransitionDuration(0)
        .onArcClick(selectRoute)
        .htmlLat("lat")
        .htmlLng("lng")
        .htmlAltitude(0.02)
        .htmlElement(makeLabel)
        .htmlTransitionDuration(0);
      const material = globe.globeMaterial();
      material.color.set("#dceef7");
      material.specular.set("#b0d1e2");
      material.shininess = 32;
      material.transparent = true;
      material.opacity = 0.88;
      material.emissive.set("#bfdbe9");
      material.emissiveIntensity = 0.7;
      material.depthWrite = true;
      // Depth-only front surface prevents rear coastlines/land showing through
      // the translucent shell. Reuse the existing mesh; no extra Three build.
      function installDepthMask(attempt = 0) {
        if (disposed) return;
        let earthMesh;
        globe.scene().traverse((object) => {
          if (object.isMesh && object.material === material) earthMesh = object;
        });
        // Globe.GL mounts its base sphere on the next render cycle.
        if (!earthMesh) {
          if (attempt < 12)
            requestAnimationFrame(() => installDepthMask(attempt + 1));
          return;
        }
        const depthMask = earthMesh.clone(false);
        depthMask.material = material.clone();
        depthMask.material.colorWrite = false;
        depthMask.material.transparent = false;
        depthMask.material.depthWrite = true;
        depthMask.material.side = 0; // FrontSide
        depthMask.renderOrder = -10;
        earthMesh.parent.add(depthMask);
      }
      installDepthMask();
      globe.lights().forEach((light) => {
        if (light.isAmbientLight) light.intensity = 2.1;
      });
      globe.renderer().setPixelRatio(Math.min(devicePixelRatio, 1.5));
      const controls = globe.controls();
      controls.enableZoom = false;
      controls.enablePan = false;
      controls.autoRotate = false;
      controls.autoRotateSpeed = 0.1;
      controls.addEventListener("start", stopRotation);
      controls.addEventListener("change", updateVisiblePoints);
      globe.pointOfView(Arcway.routeCamera(selected));
      renderGlobe(false);
      shell.classList.add("globe-ready");
      stage
        .querySelector("canvas")
        ?.addEventListener("webglcontextlost", (event) => {
          event.preventDefault();
          globe.pauseAnimation();
          fallback();
        });
      resizeObserver = new ResizeObserver(() => {
        globe.width(shell.clientWidth).height(shell.clientHeight);
      });
      resizeObserver.observe(shell);
      visibilityObserver = new IntersectionObserver(
        (entries) => {
          inView = entries[0].isIntersecting;
          if (inView && !document.hidden) globe.resumeAnimation();
          else globe.pauseAnimation();
        },
        { threshold: 0.05 },
      );
      visibilityObserver.observe(shell);
    } catch (error) {
      console.warn("Network explorer fallback:", error.message);
      fallback();
    }
  }

  document.addEventListener("visibilitychange", () => {
    if (!globe || disposed) return;
    if (!document.hidden && inView) globe.resumeAnimation();
    else globe.pauseAnimation();
  });
  reduced.addEventListener("change", () => {
    stopRotation();
    renderGlobe(false);
  });
  compact.addEventListener("change", () => {
    renderGlobe(false);
    renderFallback();
  });
  window.addEventListener("pageshow", (event) => {
    if (event.persisted && globe && !disposed) globe.resumeAnimation();
  });
  window.addEventListener("pagehide", (event) => {
    if (!globe || disposed) return;
    globe.pauseAnimation();
    if (event.persisted) return;
    disposed = true;
    resizeObserver?.disconnect();
    visibilityObserver?.disconnect();
    globe.controls().removeEventListener("change", updateVisiblePoints);
    globe._destructor();
  });

  renderControls();
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries.some((entry) => entry.isIntersecting)) {
        observer.disconnect();
        initialize();
      }
    },
    { rootMargin: "100px" },
  );
  observer.observe(shell);
})();
