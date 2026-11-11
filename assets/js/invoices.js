"use strict";
Arcway.invoiceData = (id) => {
  const s = Arcway.findShipment(id);
  if (!s || !s.invoice)
    throw Error("No draft invoice is linked to this shipment.");
  const r = Arcway.calculate({
    origin: s.origin,
    destination: s.destination,
    service: s.service,
    weight: s.weight,
    length: 10,
    width: 10,
    height: 10,
    weightUnit: "kg",
    dimensionUnit: "cm",
  });
  return {
    reference: s.invoice,
    shipment: s.id,
    date: s.date,
    description: Arcway.services[s.service].name,
    origin: Arcway.city(s.origin).name,
    destination: Arcway.city(s.destination).name,
    base: r.base,
    additional: r.additional,
    zone: r.zone,
    total: s.amount,
    currency: "INR",
  };
};
Arcway.loadPDF = () => {
  if (window.jspdf) return Promise.resolve();
  if (Arcway.pdfPromise) return Arcway.pdfPromise;
  Arcway.pdfPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "../assets/vendor/jspdf-3.0.3.umd.min.js";
    script.onload = resolve;
    script.onerror = () => {
      Arcway.pdfPromise = null;
      script.remove();
      reject(Error("The PDF library could not be loaded. Please try again."));
    };
    document.head.append(script);
  });
  return Arcway.pdfPromise;
};
Arcway.makeInvoicePDF = async (id) => {
  await Arcway.loadPDF();
  const d = Arcway.invoiceData(id);
  const doc = new jspdf.jsPDF({ unit: "mm", format: "a4" });
  doc.setProperties({
    title: d.reference + " - Illustrative ARCWAY record",
    subject:
      "Draft demonstration invoice, not a tax invoice or payment receipt",
    creator: "ARCWAY frontend demonstration",
  });
  doc.setFillColor(23, 36, 44);
  doc.rect(0, 0, 210, 48, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(27);
  doc.text("ARCWAY.", 20, 27);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Every parcel has a path.", 20, 37);
  doc.setTextColor(23, 36, 44);
  doc.setFontSize(22);
  doc.text("DRAFT / ILLUSTRATIVE INVOICE", 20, 67);
  doc.setFontSize(10);
  doc.setTextColor(95, 109, 118);
  doc.text(
    "Not a tax invoice. Not proof of payment. No billing service is connected.",
    20,
    77,
  );
  const rows = [
    ["Draft reference", d.reference],
    ["Shipment reference", d.shipment],
    ["Record date", Arcway.date(d.date)],
    ["Service", d.description],
    ["Route", d.origin + " to " + d.destination],
    ["Currency", "INR"],
  ];
  let y = 95;
  rows.forEach(([label, value]) => {
    doc.setTextColor(95, 109, 118);
    doc.text(label, 20, y);
    doc.setTextColor(23, 36, 44);
    doc.text(value, 98, y);
    y += 11;
  });
  y += 10;
  doc.setFillColor(247, 248, 246);
  doc.rect(20, y - 7, 170, 14, "F");
  doc.setFont("helvetica", "bold");
  doc.text("SAMPLE CHARGE BREAKDOWN", 25, y + 2);
  y += 24;
  doc.setFont("helvetica", "normal");
  [
    ["Base estimate", d.base],
    ["Additional billable weight", d.additional],
    ["Distance zone charge", d.zone],
  ].forEach(([label, value]) => {
    doc.text(label, 25, y);
    doc.text("INR " + value.toFixed(2), 185, y, { align: "right" });
    y += 13;
  });
  doc.setDrawColor(220, 226, 227);
  doc.line(20, y, 190, y);
  y += 15;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text("Illustrative total", 25, y);
  doc.text("INR " + d.total.toFixed(2), 185, y, { align: "right" });
  y += 20;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(95, 109, 118);
  doc.text(
    doc.splitTextToSize(
      "Taxes are not configured and are not included. Sample figures illustrate the interface only. No official business billing details, tax registrations, charges collected, or delivery guarantees are represented.",
      165,
    ),
    20,
    y,
  );
  doc.setFontSize(9);
  doc.text("ARCWAY - Frontend demonstration | " + d.reference, 20, 282);
  doc.text("1 / 1", 190, 282, { align: "right" });
  return { doc, filename: d.reference + ".pdf" };
};
Arcway.downloadInvoice = async (id, button) => {
  if (button) button.disabled = true;
  try {
    const { doc, filename } = await Arcway.makeInvoicePDF(id);
    doc.save(filename);
  } catch (error) {
    Arcway.toast(error.message);
  } finally {
    if (button) button.disabled = false;
  }
};
Arcway.viewInvoice = (id) => {
  try {
    const d = Arcway.invoiceData(id);
    const dialog = document.querySelector("#invoice-dialog");
    dialog.querySelector("[data-invoice-content]").innerHTML =
      `<div class="invoice-preview"><div class="brand">ARCWAY<span class="accent">.</span></div><h3>Draft invoice</h3><p class="mono">${d.reference}</p><span class="mono muted">CURRENCY · INR</span><dl class="breakdown"><div><dt>Shipment</dt><dd>${d.shipment}</dd></div><div><dt>Date</dt><dd>${Arcway.date(d.date)}</dd></div><div><dt>Service</dt><dd>${d.description}</dd></div><div><dt>Route</dt><dd>${d.origin} → ${d.destination}</dd></div></dl><dl class="breakdown"><div><dt>Base estimate</dt><dd>${Arcway.money(d.base)}</dd></div><div><dt>Additional weight</dt><dd>${Arcway.money(d.additional)}</dd></div><div><dt>Distance zone</dt><dd>${Arcway.money(d.zone)}</dd></div></dl><div class="invoice-total"><span>Total</span><span>${Arcway.money(d.total)}</span></div><p class="form-note">Taxes are not included. Not a tax invoice or payment receipt.</p></div><button class="btn btn-primary" style="margin-top:22px;width:100%" data-dialog-download>Download draft PDF ${Arcway.icon("download")}</button>`;
    dialog.querySelector("[data-dialog-download]").onclick = (e) =>
      Arcway.downloadInvoice(id, e.currentTarget);
    dialog.showModal();
  } catch (error) {
    Arcway.toast(error.message);
  }
};
