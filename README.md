# stage.ivolopes.com

[![CI](https://github.com/githubdoivo/stage/actions/workflows/ci.yml/badge.svg)](https://github.com/githubdoivo/stage/actions/workflows/ci.yml)

**Stage**: dance and acting by Ivo Lopes, as a hand-painted paper toy theatre
inspired by Theatro Circo in Braga. One fixed frame; everything happens on the
stage.

- **Raise the Curtain** is the only button. The curtain flies out, a title
  board comes down on cords, and the props appear.
- **The two tassels** on the arch change the performance (left: previous,
  right: next). The arrow keys do the same. Each performance has its own
  painted backdrop.
- **The prompter's shell** opens the programme (the artistic CV).
- **The messenger** brings the contact card.
- English and Portuguese: `?lang=`, then the visitor's last choice, then the
  browser's language.

## Files

| File | What it is |
| --- | --- |
| `content.js` | Every word, in both languages: performances, programme, labels. **Edit this to add content.** |
| `stage.js` | The show: language, curtain, tassels, papers, keyboard. |
| `stage.css` | Layout. The art is placed in % of the painted front, so it scales with it. |
| `img/` | The painted parts (cut out from the PROMPTS-v3 art, all from one style sheet). |
| `tools/build-og.mjs` | `npm run og` re-renders `og-image.jpg`, the link preview. |

## Adding a performance

1. Paint its backdrop with prompt 9 of PROMPTS-v3 (1536×1024, the important
   part in the middle third, since phones crop the sides).
2. Save it as `img/scene-NAME.webp`.
3. Add an entry to `scenes` in **both** `en` and `pt` in `content.js`
   (`img: "scene-NAME"`, title, year, place, role, one or two lines of text),
   and a row in the programme.
4. Bump the `?v=` stamps in `index.html` and run `npm test`.

The tests check that both languages match and every backdrop exists.

## Replacing a painted part

Each part is one file in `img/`. Keep the size and the transparent cut-out:

- `front.webp` (1536×1024) and `front-phone.webp` (1024×1536): the theatre,
  with the stage opening cut out. If the opening moves, update `--ox --oy --ow
  --oh` (and `--cy` for the cartouche) on `.box` in `stage.css`.
- `curtain.webp`, `seats.webp`, `card.webp`, `programme.webp`: as named.
- `tassel.webp`, `shell(-open).webp`, `messenger(-letter).webp`: the props, at
  rest and active.

## Rules

- Stage never links to the hub or to the other areas.
- EN labels in Title Case; PT in sentence case, impersonal.
- Tap targets 44px or more; works with reduced motion; no sideways scroll.

`npm test` runs the Playwright tests (desktop + phone). Hosted on GitHub Pages.
