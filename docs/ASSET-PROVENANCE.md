# Asset provenance

Every asset shipped in this repository, where it came from, and under what licence.
Kept current as required by §12 of [PROJECT-SPEC.md](PROJECT-SPEC.md).

Last verified: **2026-09-27**, against commit `0afb181`.

---

## Summary

The published site contains **no binary media at all** — no images, no video files, no
audio, no font files. Every visual on the site is either an SVG drawn at runtime by our own
code, or a Unicode emoji. This is deliberate: it removes the entire class of copyright risk
that comes with reusing pictures, and it keeps the repository small.

| File type | Count | Notes |
|---|---|---|
| `.js` | 32 | 30 original, 2 vendored (Three.js, OrbitControls) |
| `.css` | 7 | all original |
| `.md` | 5 | all original |
| `.html` | 1 | original |
| Images / video / audio / fonts | **0** | none tracked |

---

## Original work (written for this project)

| Asset | Where | Notes |
|---|---|---|
| All 3D models and 2D diagrams | `assets/js/geometry/` | Generated at runtime from `pyramid-geometry.js`. No imported models, no traced drawings |
| Pyramid nets and the fold animation | `assets/js/geometry/net-view.js` | Computed from the same geometry data |
| Special solids (cone, cuboid, triangular prism, truncated pyramid, oblique pyramid, labelled pyramid) | `assets/js/shapes.js` | Coordinates worked out specifically for this project |
| Brand mark and decorative pyramid outline | `assets/js/icons.js` | Original inline SVG |
| The desert scene on the home page — sky, sun, clouds, three pyramids, dunes, palms | `assets/js/scene.js` | Drawn from plain geometric shapes written for this project. Nothing is traced from the design reference, and no picture file is loaded. It is decoration, so it carries `aria-hidden` |
| The pyramid that builds itself on the unit-completion screen, and the confetti | `assets/js/celebrate.js` | Seven trapezoid courses computed in the file, plus a radial glow. Original |
| Composite figures for the word problems — two packets side by side, a structure in two parts | `assets/js/figures.js` | Composed from the shared geometry engine, at one shared scale, so the drawing cannot contradict the numbers in the question |
| Measurement labels and their leader lines on figures | `assets/js/geometry/solid-view.js` | Positions computed from the geometry itself, not hand-placed |
| Favicon | `index.html` (inline `data:` URI) | Original inline SVG, two paths |
| All activity content — 102 questions, explanations, misconception notes, feedback | `data/unit-1.js`, `data/unit-2.js` | Newly written in Hebrew for this project |
| Final exam — 12 items with topics and explanations | `data/final-exam.js` | Newly written |
| All interface strings | `data/strings.he.js` | Newly written |
| Design system — colour, type scale, spacing, components | `assets/css/` | Original |

**Numeric values.** Every number used in every question was chosen for this project. None was
copied from the reference material.

---

## Third-party code (vendored into the repository)

| Library | Version | File | Licence | Why vendored |
|---|---|---|---|---|
| Three.js | r128 | `assets/js/vendor/three.min.js` (589 KB) | MIT — `Copyright 2010-2021 Three.js Authors`, SPDX header retained in file | Decision D4: the site must work on a school network that blocks CDNs, and must not break if a CDN version is withdrawn |
| OrbitControls | r128 (matching) | `assets/js/vendor/OrbitControls.js` (26 KB) | MIT, same project | Same reason |

Both retain their original licence headers. Neither is modified.

Three.js is used **only** in the toolbox's 3D model, and only when WebGL is available. Every
learning activity has a fully functional SVG path, so no scored task depends on it.

---

## External resources loaded at runtime

| Resource | Where | Terms | If blocked |
|---|---|---|---|
| Google Fonts — Rubik, Secular One | `index.html` stylesheet link | SIL Open Font License 1.1 (both faces) | The site falls back to the local system Hebrew stack declared in `tokens.css`. Layout and behaviour are unaffected; only the typeface changes |
| YouTube video `nCu2PMvQVIc` | `assets/js/activities/video.js` | Embedded through `youtube-nocookie.com` under YouTube's standard embed terms. **Not downloaded, not rehosted, not copied** | Activity 2.5 shows a Hebrew written summary of the video and a notice explaining the block. The comprehension question and the gate still work, and the rest of the site is unaffected |

These are the only two outbound requests the site makes. There is no analytics, no tracking,
no third-party script, and no data leaves the learner's device.

---

## Reference material — excluded

The scanned textbook chapter lives in `source-materials/` and is used as a **pedagogical
reference only**: to understand which concepts the chapter teaches, in what order, and which
misconceptions it targets.

It is **not** part of the project output:

- `source-materials/` and `*.pdf` are excluded in `.gitignore` (lines 4–6), written before
  the first commit
- `git check-ignore` confirms the exclusion
- A scan of every commit in the repository finds no PDF and no `source-materials` path
- No scan, illustration, diagram or question wording from it appears anywhere on the site

---

## Verification commands

```bash
git check-ignore -v source-materials/
git log --all --pretty=format: --name-only | sort -u | grep -iE "\.pdf|source-material"
git ls-tree -r --name-only HEAD | grep -iE "\.(png|jpe?g|gif|svg|mp4|woff2?|ttf|pdf)$"
```

The first should report the ignore rule; the second and third should return nothing.
