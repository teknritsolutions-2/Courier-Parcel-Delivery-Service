"use strict";
/* Shared select-only comboboxes. Native fields retain values, validation and
   form serialization; menus use readable text and viewport-aware placement. */
(() => {
  const controls = new Set();
  const enhanced = new WeakSet();
  let sequence = 0;
  let opened = null;

  function nameFor(select) {
    if (select.getAttribute("aria-label"))
      return select.getAttribute("aria-label");
    const labels = [...(select.labels || [])].map((label) => {
      const copy = label.cloneNode(true);
      copy
        .querySelectorAll("select,.select-control,small,svg")
        .forEach((el) => el.remove());
      return copy.textContent.trim();
    });
    return labels.join(" ").replace(/\s+/g, " ") || "Choose an option";
  }

  function close() {
    if (!opened) return;
    opened.trigger.setAttribute("aria-expanded", "false");
    opened.trigger.removeAttribute("aria-controls");
    opened.trigger.removeAttribute("aria-activedescendant");
    opened.menu.remove();
    opened.menu = null;
    opened = null;
  }

  function sync(control) {
    const { select, trigger, text } = control;
    const label = select.selectedOptions[0]?.textContent || "Choose an option";
    if (text.textContent !== label) text.textContent = label;
    trigger.setAttribute("aria-label", `${nameFor(select)}: ${label}`);
    trigger.setAttribute("aria-required", String(select.required));
    trigger.setAttribute("aria-disabled", String(select.disabled));
    trigger.tabIndex = select.disabled ? -1 : 0;
    if (select.validity.valid) {
      trigger.removeAttribute("aria-invalid");
      if (select.hasAttribute("aria-describedby"))
        trigger.setAttribute(
          "aria-describedby",
          select.getAttribute("aria-describedby"),
        );
      else trigger.removeAttribute("aria-describedby");
      if (!control.error.hidden) control.error.hidden = true;
    }
  }

  function refresh() {
    for (const control of controls) {
      if (!control.select.isConnected) {
        if (opened === control) close();
        controls.delete(control);
      } else sync(control);
    }
  }

  function enabled(control, index) {
    const option = control.select.options[index];
    return (
      option &&
      !option.disabled &&
      !option.hidden &&
      !(
        option.parentElement.tagName === "OPTGROUP" &&
        option.parentElement.disabled
      )
    );
  }

  function activate(control, index) {
    if (!control.menu || !enabled(control, index)) return;
    control.active = index;
    [...control.menu.children].forEach((el) => {
      el.classList.toggle("is-active", Number(el.dataset.index) === index);
    });
    const item = control.menu.querySelector(`[data-index="${index}"]`);
    control.trigger.setAttribute("aria-activedescendant", item.id);
    const top = item.offsetTop;
    const bottom = top + item.offsetHeight;
    if (top < control.menu.scrollTop) control.menu.scrollTop = top;
    else if (bottom > control.menu.scrollTop + control.menu.clientHeight)
      control.menu.scrollTop = bottom - control.menu.clientHeight;
  }

  function choose(control, index) {
    if (!enabled(control, index)) return;
    const changed = control.select.selectedIndex !== index;
    control.select.selectedIndex = index;
    close();
    sync(control);
    if (changed) {
      control.select.dispatchEvent(new Event("input", { bubbles: true }));
      control.select.dispatchEvent(new Event("change", { bubbles: true }));
    }
    if (control.trigger.isConnected)
      control.trigger.focus({ preventScroll: true });
    else if (control.select.id)
      queueMicrotask(() => {
        scan();
        document
          .getElementById(control.select.id)
          ?.closest(".select-control")
          ?.querySelector(".select-trigger")
          ?.focus({ preventScroll: true });
      });
  }

  function open(control) {
    if (control.select.disabled) return;
    if (opened === control) return;
    close();
    control.trigger.scrollIntoView({
      block: "nearest",
      inline: "nearest",
      behavior: "instant",
    });
    const menu = document.createElement("div");
    menu.className = "select-menu";
    menu.id = `select-menu-${control.id}`;
    menu.setAttribute("role", "listbox");
    menu.setAttribute("aria-label", nameFor(control.select));
    menu.dir = document.documentElement.dir || "ltr";
    menu.classList.toggle(
      "select-menu-inverse",
      Boolean(
        control.select.closest(
          ".globe-toolbar,.route-select-field,.estimate-band",
        ),
      ),
    );
    [...control.select.options].forEach((option, index) => {
      if (option.hidden) return;
      const item = document.createElement("div");
      item.className = "select-option";
      item.id = `${menu.id}-option-${index}`;
      item.dataset.index = index;
      item.textContent = option.textContent;
      item.setAttribute("role", "option");
      item.setAttribute("aria-selected", String(option.selected));
      item.setAttribute("aria-disabled", String(!enabled(control, index)));
      item.addEventListener("pointermove", () => activate(control, index));
      item.addEventListener("pointerdown", (event) => event.preventDefault());
      item.addEventListener("click", () => choose(control, index));
      menu.append(item);
    });
    (control.trigger.closest("dialog[open]") || document.body).append(menu);
    control.menu = menu;
    opened = control;
    const rect = control.trigger.getBoundingClientRect();
    control.anchor = { top: rect.top, left: rect.left };
    const viewport = window.visualViewport;
    const viewLeft = viewport?.offsetLeft || 0;
    const viewTop = viewport?.offsetTop || 0;
    const viewWidth = viewport?.width || innerWidth;
    const viewHeight = viewport?.height || innerHeight;
    const width = Math.min(Math.max(rect.width, 220), viewWidth - 24);
    const below = viewTop + viewHeight - rect.bottom - 18;
    const above = rect.top - viewTop - 18;
    const down = below >= Math.min(240, above);
    menu.style.width = `${width}px`;
    menu.style.maxHeight = `${Math.max(44, Math.min(320, down ? below : above))}px`;
    menu.style.left = `${Math.max(
      viewLeft + 12,
      Math.min(
        viewLeft + viewWidth - width - 12,
        menu.dir === "rtl" ? rect.right - width : rect.left,
      ),
    )}px`;
    menu.style.top = `${down ? rect.bottom + 6 : rect.top - menu.getBoundingClientRect().height - 6}px`;
    control.trigger.setAttribute("aria-expanded", "true");
    control.trigger.setAttribute("aria-controls", menu.id);
    const initial = enabled(control, control.select.selectedIndex)
      ? control.select.selectedIndex
      : [...control.select.options].findIndex((_, index) =>
          enabled(control, index),
        );
    activate(control, initial);
  }

  function enhance(select) {
    if (enhanced.has(select) || select.multiple || select.size > 1) return;
    enhanced.add(select);
    const wrapper = document.createElement("span");
    wrapper.className = "select-control";
    const trigger = document.createElement("span");
    trigger.className = "select-trigger";
    trigger.tabIndex = 0;
    trigger.setAttribute("role", "combobox");
    trigger.setAttribute("aria-haspopup", "listbox");
    trigger.setAttribute("aria-expanded", "false");
    const text = document.createElement("span");
    text.className = "select-value";
    trigger.append(text);
    trigger.insertAdjacentHTML(
      "beforeend",
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
    );
    const error = document.createElement("span");
    error.className = "select-error";
    error.id = `select-error-${++sequence}`;
    error.hidden = true;
    error.setAttribute("role", "status");
    const control = {
      id: sequence,
      select,
      trigger,
      text,
      error,
      menu: null,
      active: 0,
      typed: "",
      typedAt: 0,
    };
    select.before(wrapper);
    wrapper.append(select, trigger, error);
    select.classList.add("select-native");
    select.tabIndex = -1;
    select.setAttribute("aria-hidden", "true");
    controls.add(control);
    sync(control);
    select.addEventListener("change", () => sync(control));
    select.addEventListener("focus", () => trigger.focus());
    trigger.addEventListener("blur", () =>
      select.dispatchEvent(new Event("blur", { bubbles: false })),
    );
    select.addEventListener("invalid", (event) => {
      event.preventDefault();
      error.textContent = select.validationMessage || "Choose an option.";
      error.hidden = false;
      trigger.setAttribute("aria-invalid", "true");
      trigger.setAttribute("aria-describedby", error.id);
      const firstInvalid = select.form?.querySelector(
        "input:invalid,select:invalid,textarea:invalid",
      );
      if (!firstInvalid || firstInvalid === select) trigger.focus();
    });
    trigger.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (select.disabled) return;
      trigger.focus();
      if (opened === control) close();
      else open(control);
    });
    for (const label of select.labels || [])
      label.addEventListener("click", (event) => {
        if (!wrapper.contains(event.target)) {
          event.preventDefault();
          if (select.disabled) return;
          trigger.focus();
          open(control);
        }
      });
    trigger.addEventListener("keydown", (event) => {
      if (select.disabled) return;
      const options = [...select.options]
        .map((_, index) => index)
        .filter((index) => enabled(control, index));
      if (!options.length) return;
      if (["ArrowDown", "ArrowUp", "Home", "End"].includes(event.key)) {
        event.preventDefault();
        const wasOpen = opened === control;
        open(control);
        const position = options.indexOf(control.active);
        const index =
          event.key === "Home"
            ? options[0]
            : event.key === "End"
              ? options.at(-1)
              : !wasOpen
                ? control.active
                : options[
                    Math.max(
                      0,
                      Math.min(
                        options.length - 1,
                        position + (event.key === "ArrowDown" ? 1 : -1),
                      ),
                    )
                  ];
        activate(control, index);
      } else if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        if (opened === control) choose(control, control.active);
        else open(control);
      } else if (event.key === "Escape") {
        if (opened === control) {
          event.preventDefault();
          event.stopPropagation();
          close();
        }
      } else if (event.key === "Tab") close();
      else if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.metaKey &&
        !event.altKey
      ) {
        event.preventDefault();
        const now = Date.now();
        control.typed =
          now - control.typedAt < 700
            ? control.typed + event.key.toLowerCase()
            : event.key.toLowerCase();
        control.typedAt = now;
        const query = [...control.typed].every(
          (letter) => letter === control.typed[0],
        )
          ? control.typed[0]
          : control.typed;
        const start =
          opened === control ? control.active : select.selectedIndex;
        const ordered = options
          .filter((i) => i > start)
          .concat(options.filter((i) => i <= start));
        const match = ordered.find((i) =>
          select.options[i].textContent.trim().toLowerCase().startsWith(query),
        );
        if (match !== undefined) {
          if (opened === control) activate(control, match);
          else choose(control, match);
        }
      }
    });
  }

  function scan() {
    document.querySelectorAll("select").forEach(enhance);
    refresh();
  }
  scan();
  new MutationObserver((mutations) => {
    if (
      opened &&
      mutations.some(
        (m) => m.target === opened.select || opened.select.contains(m.target),
      )
    )
      close();
    scan();
  }).observe(document.body, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ["disabled", "required", "selected", "hidden"],
  });
  document.addEventListener("pointerdown", (event) => {
    if (
      opened &&
      !opened.trigger.contains(event.target) &&
      !opened.menu.contains(event.target)
    )
      close();
  });
  document.addEventListener("focusin", (event) => {
    if (
      opened &&
      !opened.trigger.contains(event.target) &&
      !opened.menu.contains(event.target)
    )
      close();
  });
  document.addEventListener("click", () => queueMicrotask(refresh));
  document.addEventListener("reset", (event) =>
    setTimeout(() => {
      if (opened?.select.form === event.target) close();
      for (const control of controls)
        if (control.select.form === event.target) {
          control.error.hidden = true;
          control.trigger.removeAttribute("aria-invalid");
          control.trigger.removeAttribute("aria-describedby");
        }
      refresh();
    }, 0),
  );
  document.addEventListener(
    "scroll",
    (event) => {
      if (
        opened &&
        event.target !== opened.menu &&
        !opened.menu.contains(event.target)
      ) {
        const rect = opened.trigger.getBoundingClientRect();
        if (
          Math.abs(rect.top - opened.anchor.top) > 1 ||
          Math.abs(rect.left - opened.anchor.left) > 1
        )
          close();
      }
    },
    true,
  );
  window.addEventListener("resize", close);
  window.visualViewport?.addEventListener("resize", close);
  window.addEventListener("pagehide", close);
})();
