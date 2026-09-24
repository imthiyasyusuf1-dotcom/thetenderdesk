// Entry point: wires up small, independent modules.
import { initNav } from "./nav.js";
import { initReveal } from "./reveal.js";
import { initChat } from "./chat.js";
import { initContact } from "./contact.js";

document.documentElement.classList.remove("no-js");
initNav();
initReveal();
initChat(document.querySelector("[data-chat]"));
initContact(document.querySelector("[data-contact-form]"));

const year = document.querySelector("[data-year]");
if (year) year.textContent = String(new Date().getFullYear());
