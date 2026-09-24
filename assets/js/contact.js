// Contact form: builds a prefilled email and opens the visitor's mail app.
// Nothing is sent to or stored on this website.
const TO = "hello@thetenderdesk.co.uk";
const SUBJECTS = {
  tenders: "Tenders enquiry",
  website: "Website enquiry",
  automation: "AI automation enquiry",
  bid: "Bid writing enquiry",
  several: "Enquiry: more than one service",
  unsure: "General enquiry",
};

export function initContact(form) {
  if (!form) return;
  const need = form.elements.need;
  const tradeField = form.querySelector("[data-trade-field]");
  const status = form.querySelector("[data-form-status]");

  // Preselect from links like /#contact?need=website or data-need buttons.
  document.querySelectorAll("[data-need]").forEach((a) => {
    a.addEventListener("click", () => { need.value = a.dataset.need; sync(); });
  });

  function sync() {
    const showTrade = ["tenders", "bid", "several"].includes(need.value);
    tradeField.hidden = !showTrade;
  }
  need.addEventListener("change", sync);
  sync();

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!form.reportValidity()) return;
    const f = form.elements;
    const company = f.company.value.trim();
    const subject = `${SUBJECTS[need.value] || "Enquiry"}${company ? ` from ${company}` : ""}`;
    const lines = [
      `Name: ${f.name.value.trim()}`,
      company && `Company: ${company}`,
      `Needs: ${need.options[need.selectedIndex].text}`,
      !tradeField.hidden && f.trade.value && `Trade: ${f.trade.value}`,
      f.area.value.trim() && `Area: ${f.area.value.trim()}`,
      f.phone.value.trim() && `Phone: ${f.phone.value.trim()}`,
      "",
      f.message.value.trim(),
    ].filter((l) => l !== false && l !== undefined && l !== null);
    const href = `mailto:${TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(lines.join("\n"))}`;
    window.location.href = href;
    if (status) status.textContent = `Opening your email app. If nothing happens, email ${TO} directly.`;
  });
}
