"use strict";
(() => {
  const form = document.querySelector("[data-auth-form]");
  if (!form) return;
  const feedback = document.querySelector("#auth-feedback");
  document.querySelectorAll("[data-password-toggle]").forEach((button) =>
    button.addEventListener("click", () => {
      const input = document.getElementById(button.dataset.passwordToggle);
      const reveal = input.type === "password";
      input.type = reveal ? "text" : "password";
      button.setAttribute(
        "aria-label",
        `${reveal ? "Hide" : "Show"} ${input.name === "confirm" ? "confirmation " : ""}password`,
      );
      button.setAttribute("aria-pressed", String(reveal));
    }),
  );
  const password = form.elements.password,
    confirm = form.elements.confirm;
  const validateConfirm = () => {
    if (confirm)
      confirm.setCustomValidity(
        confirm.value !== password.value ? "Passwords must match." : "",
      );
  };
  password.addEventListener("input", validateConfirm);
  confirm?.addEventListener("input", validateConfirm);
  const remembered = Arcway.storage.get("remember", false);
  if (form.elements.remember)
    form.elements.remember.checked = remembered === true;
  form.addEventListener("submit", (e) => {
    e.preventDefault();
    validateConfirm();
    if (!form.reportValidity()) return;
    if (form.elements.remember)
      Arcway.storage.set("remember", form.elements.remember.checked);
    feedback.textContent =
      form.dataset.authForm === "signup"
        ? "Your input is valid. No account was created: account registration requires a connected authentication service. You can explore the Customer Dashboard directly."
        : "Your input is valid. Sign-in requires a connected authentication service. You can explore the Customer Dashboard directly.";
    password.value = "";
    if (confirm) confirm.value = "";
  });
  document
    .querySelectorAll("[data-provider]")
    .forEach((b) =>
      b.addEventListener(
        "click",
        () =>
          (feedback.textContent = `${b.dataset.provider} sign-in is not connected. No sign-in attempt was made. Explore the Customer Dashboard directly below.`),
      ),
    );
  const dialog = document.querySelector("#forgot-dialog");
  document
    .querySelector("[data-forgot]")
    ?.addEventListener("click", () => dialog.showModal());
  document.querySelector("#forgot-form")?.addEventListener("submit", (e) => {
    e.preventDefault();
    if (e.target.reportValidity())
      document.querySelector("#forgot-feedback").textContent =
        "Password recovery is not connected. No reset email was sent.";
  });
})();
