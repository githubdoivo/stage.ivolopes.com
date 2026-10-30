// Stage: every word on the site, in English and Portuguese.
//
// To add a performance: paint its backdrop (PROMPTS-v3, prompt 9), save it as
// img/scene-NAME.webp, and add one entry to `scenes` in BOTH languages, plus a
// row in the programme. year, place and role are optional.
//
// EN labels use Title Case; PT uses sentence case and stays impersonal.
window.STAGE = {
  en: {
    lang: "en", title: "Stage · Ivo Lopes", other: "PT", otherLabel: "Ver em português",
    raise: "Raise the Curtain",
    prev: "Previous Performance", next: "Next Performance", progTag: "Programme", cardTag: "Contact",
    openProg: "Open the Programme", openCard: "Open the Contact Card", away: "Close",
    copy: "Copy Email", copied: "Copied",
    scenes: [
      { img: "scene-1", title: "Opening Soon", year: "", place: "", role: "", text: "The first performances are being painted, one backdrop at a time." },
      { img: "scene-2", title: "In Rehearsal", year: "", place: "", role: "", text: "Dance and acting, scene by scene." },
    ],
    programme: "Programme", programmeSub: "Artistic CV",
    groups: [
      { icon: "dancer", name: "Dance", rows: [["", "To Be Announced", "", ""]] },
      { icon: "masks", name: "Theatre", rows: [["", "To Be Announced", "", ""]] },
      { icon: "quill", name: "Creation", rows: [["", "To Be Announced", "", ""]] },
    ],
    cardTitle: "Get in Touch", cardText: "For collaborations, performances and other opportunities.",
  },
  pt: {
    lang: "pt", title: "Stage · Ivo Lopes", other: "EN", otherLabel: "View in English",
    raise: "Subir o Pano",
    prev: "Espetáculo Anterior", next: "Espetáculo Seguinte", progTag: "Programa", cardTag: "Contacto",
    openProg: "Abrir o Programa", openCard: "Abrir o Cartão de Contacto", away: "Fechar",
    copy: "Copiar Email", copied: "Copiado",
    scenes: [
      { img: "scene-1", title: "Estreia em Breve", year: "", place: "", role: "", text: "Os primeiros espetáculos estão a ser pintados, um cenário de cada vez." },
      { img: "scene-2", title: "Em Ensaio", year: "", place: "", role: "", text: "Dança e teatro, cena a cena." },
    ],
    programme: "Programa", programmeSub: "Currículo Artístico",
    groups: [
      { icon: "dancer", name: "Dança", rows: [["", "A Anunciar", "", ""]] },
      { icon: "masks", name: "Teatro", rows: [["", "A Anunciar", "", ""]] },
      { icon: "quill", name: "Criação", rows: [["", "A Anunciar", "", ""]] },
    ],
    cardTitle: "Contacto", cardText: "Para colaborações, espetáculos e outras oportunidades.",
  },
};
