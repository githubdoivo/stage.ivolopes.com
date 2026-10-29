// Stage: fills the theatre in the visitor's language and runs the show.
// Raise the Curtain → the curtain flies out, the title board comes down and the
// props appear. Tassels change the performance; the shell and the messenger
// lower the programme and the contact card.
(function () {
  const $ = (id) => document.getElementById(id);
  const esc = (s) => String(s).replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[ch]));
  const calm = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const wait = (ms) => new Promise((r) => setTimeout(r, calm ? 0 : ms));
  const house = $("house");

  // Language: ?lang=, then the visitor's last choice, then the browser's language
  let saved = null;
  try { saved = localStorage.getItem("lang"); } catch (_) {}
  const asked = new URLSearchParams(location.search).get("lang");
  let lang = asked || saved || ((navigator.language || "").toLowerCase().startsWith("pt") ? "pt" : "en");
  if (!window.STAGE[lang]) lang = "en";

  // The props only take focus once the curtain is up
  const props = [...document.querySelectorAll(".prop")];
  const setProps = (on) => props.forEach((p) => { p.tabIndex = on ? 0 : -1; p.setAttribute("aria-hidden", on ? "false" : "true"); });
  setProps(false);

  let c, at = 0, open = null, busy = false, opener = null;
  function show(i) {
    at = (i + c.scenes.length) % c.scenes.length;
    const s = c.scenes[at];
    [...$("scenes").children].forEach((im, k) => im.classList.toggle("on", k === at));
    $("c-title").textContent = s.title;
    const bits = [s.year, s.place].filter(Boolean).map(esc);
    if (s.role) bits.push(`<b>${esc(s.role)}</b>`);
    $("c-meta").innerHTML = bits.join(" · ");
    $("c-text").textContent = s.text || "";
  }
  function row([y, w, p, r]) {
    const where = [p, r].filter(Boolean).map(esc).join(" · ");
    return `<li${y ? "" : ' class="solo"'}>${y ? `<span class="y">${esc(y)}</span>` : ""}<span class="w">${esc(w)}</span>${where ? `<span class="p">${where}</span>` : ""}</li>`;
  }
  function fill() {
    c = window.STAGE[lang];
    document.documentElement.lang = c.lang;
    document.title = c.title;
    $("lang").textContent = c.other; $("lang").setAttribute("aria-label", c.otherLabel);
    $("raise").textContent = c.raise;
    $("prev").setAttribute("aria-label", c.prev); $("next").setAttribute("aria-label", c.next);
    $("prev-tag").textContent = c.prev; $("next-tag").textContent = c.next;
    $("prog-tag").textContent = c.progTag; $("card-tag").textContent = c.cardTag;
    $("open-programme").setAttribute("aria-label", c.openProg); $("open-card").setAttribute("aria-label", c.openCard);
    document.querySelectorAll("[data-away]").forEach((b) => b.setAttribute("aria-label", c.away));
    if (!$("scenes").children.length) {
      $("scenes").innerHTML = c.scenes.map((s, i) => `<img src="img/${esc(s.img)}.webp" alt=""${i ? ' loading="lazy"' : ""}>`).join("");
    }
    show(at);
    $("p-title").textContent = c.programme; $("p-sub").textContent = c.programmeSub;
    $("groups").innerHTML = c.groups.map((g) => `<section class="group"><div class="group-head"><img src="img/ink-${esc(g.icon)}.webp" alt=""><h3>${esc(g.name)}</h3></div>
      <ul class="rows">${g.rows.map(row).join("")}</ul></section>`).join("");
    $("t-title").textContent = c.cardTitle; $("t-text").textContent = c.cardText; $("copy").textContent = c.copy;
  }
  fill();

  $("lang").addEventListener("click", () => {
    lang = lang === "pt" ? "en" : "pt";
    try { localStorage.setItem("lang", lang); } catch (_) {}
    if (asked) history.replaceState(null, "", location.pathname + location.hash);
    fill();
  });

  // Raise the Curtain: the props show their names once, then only on hover or focus
  $("raise").addEventListener("click", async () => {
    house.classList.add("up");
    $("board").style.setProperty("--wait", "1.1s"); $("board").classList.add("down");
    setProps(true);
    await wait(1800);
    house.classList.add("hint");
    $("next").focus({ preventScroll: true });
    await wait(3600);
    house.classList.remove("hint");
  });

  // A tug on a tassel: the board flies up, the curtain drops, the backdrop changes, all comes back
  async function change(step, pull) {
    if (busy || open) return;
    busy = true;
    pull.classList.add("tug"); await wait(260); pull.classList.remove("tug");
    $("board").style.setProperty("--wait", "0s"); $("board").classList.remove("down");
    house.classList.remove("up"); await wait(1300);
    show(at + step);
    house.classList.add("up");
    $("board").style.setProperty("--wait", "1s"); $("board").classList.add("down");
    await wait(1200);
    busy = false;
  }
  $("prev").addEventListener("click", (e) => change(-1, e.currentTarget));
  $("next").addEventListener("click", (e) => change(1, e.currentTarget));

  // The programme and the card come down in front; ✕, Esc or a tap outside puts them away
  async function openPaper(id, from) {
    if (open || busy) return;
    open = $(id); opener = from; from.classList.add("on");
    open.hidden = false;
    house.classList.add("reading");
    requestAnimationFrame(() => requestAnimationFrame(() => open.classList.add("down")));
    await wait(900);
    if (open) open.querySelector("[data-away]").focus({ preventScroll: true });
  }
  async function putAway() {
    if (!open) return;
    const el = open; open = null;
    el.classList.remove("down"); house.classList.remove("reading");
    await wait(900);
    el.hidden = true;
    if (opener) { opener.classList.remove("on"); opener.focus({ preventScroll: true }); }
  }
  $("open-programme").addEventListener("click", (e) => openPaper("sheet", e.currentTarget));
  $("open-card").addEventListener("click", (e) => openPaper("card", e.currentTarget));
  document.querySelectorAll("[data-away]").forEach((b) => b.addEventListener("click", putAway));
  $("veil").addEventListener("click", putAway);

  $("copy").addEventListener("click", async () => {
    try { await navigator.clipboard.writeText("mail@ivolopes.com"); $("copy").textContent = c.copied; }
    catch (_) { const r = document.createRange(); r.selectNodeContents(document.querySelector(".mail")); getSelection().removeAllRanges(); getSelection().addRange(r); }
    setTimeout(() => ($("copy").textContent = c.copy), 1800);
  });

  addEventListener("keydown", (e) => {
    if (e.key === "Escape") return putAway();
    if (open && e.key === "Tab") {                // keep focus inside the open paper
      const f = [...open.querySelectorAll("button, a")];
      const i = f.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
      else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      return;
    }
    if (!house.classList.contains("up") || open) return;
    if (e.key === "ArrowRight") change(1, $("next"));
    if (e.key === "ArrowLeft") change(-1, $("prev"));
  });
})();
