// Scripted demo chat. No AI and no network calls: it shows the kind of
// conversation a website assistant handles for a local business.
const SCRIPT = {
  start: {
    bot: ["Hi, thanks for getting in touch with Northside Cleaning. I can answer questions or book you a quote visit. What can I help with?"],
    options: [["Get a quote", "quote"], ["Opening hours", "hours"], ["Do you cover my area?", "area"]],
  },
  quote: {
    bot: ["Happy to help. Is this for a home or a business?"],
    options: [["An office", "office"], ["A home", "home"]],
  },
  office: {
    bot: ["Great. Roughly how big is the space?"],
    options: [["Under 200 m²", "size"], ["200 to 800 m²", "size"], ["Bigger than that", "size"]],
  },
  home: {
    bot: ["Lovely. Is it a regular clean or a one-off deep clean?"],
    options: [["Regular clean", "size"], ["One-off deep clean", "size"]],
  },
  size: {
    bot: ["Thanks. We can pop round for a free quote visit. Which suits you?"],
    options: [["Tue 10:00", "booked"], ["Wed 14:30", "booked"], ["Thu 09:00", "booked"]],
  },
  booked: {
    bot: [
      "Booked. You will get a confirmation by text and email in a moment.",
      "Before the visit, the owner will see your answers so nobody has to ask twice.",
    ],
    options: [["Start again", "start"]],
  },
  hours: {
    bot: ["The office is open Monday to Friday, 8am to 6pm. I am here any time, and anything I cannot answer goes straight to the team."],
    options: [["Get a quote", "quote"], ["Start again", "start"]],
  },
  area: {
    bot: ["We cover Aldershot, Farnborough, Farnham, Fleet and Camberley. What is your postcode area?"],
    options: [["GU11", "yes"], ["GU14", "yes"], ["Somewhere else", "other"]],
  },
  yes: { bot: ["Yes, we cover that. Would you like a quote?"], options: [["Get a quote", "quote"], ["Not right now", "bye"]] },
  other: {
    bot: ["I am not sure we cover that. I have passed your question to the team and they will reply today, so you are not left waiting."],
    options: [["Start again", "start"]],
  },
  bye: { bot: ["No problem. If anything comes up, I am here."], options: [["Start again", "start"]] },
};

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

export function initChat(root) {
  if (!root) return;
  const log = root.querySelector("[data-chat-log]");
  const opts = root.querySelector("[data-chat-options]");
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  let busy = false;

  const add = (text, who) => {
    const li = document.createElement("li");
    li.className = `msg msg--${who}`;
    li.textContent = text;
    log.append(li);
    log.scrollTop = log.scrollHeight;
    return li;
  };

  const typing = () => {
    const li = document.createElement("li");
    li.className = "msg msg--bot msg--typing";
    li.setAttribute("aria-hidden", "true");
    li.innerHTML = "<i></i><i></i><i></i>";
    log.append(li);
    log.scrollTop = log.scrollHeight;
    return li;
  };

  async function go(key, userText) {
    if (busy) return;
    busy = true;
    const node = SCRIPT[key];
    opts.replaceChildren();
    if (key === "start") log.replaceChildren();
    if (userText) add(userText, "user");
    for (const line of node.bot) {
      if (!reduce) { const t = typing(); await wait(650 + Math.min(line.length * 12, 900)); t.remove(); }
      add(line, "bot");
    }
    node.options.forEach(([label, next]) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "chat__opt";
      b.textContent = label;
      b.addEventListener("click", () => go(next, next === "start" ? "" : label));
      opts.append(b);
    });
    busy = false;
  }

  // Start when the chat first scrolls into view, so the typing is seen.
  const io = new IntersectionObserver((entries) => {
    if (entries.some((e) => e.isIntersecting)) { io.disconnect(); go("start"); }
  }, { threshold: 0.3 });
  io.observe(root);
}
