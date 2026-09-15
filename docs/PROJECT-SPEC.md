# מסע אל הפירמידה — Project Specification

**Site title:** מסע אל הפירמידה
**Subtitle:** לומדים, חוקרים ובונים
**Strapline:** הנדסה לכיתה ו׳ | בית ספר גבים
**Language:** Hebrew only, full RTL
**Audience:** Grade 6 (ages 11–12)
**Delivery:** Static site, published via GitHub Pages
**Status:** D1–D12 approved. Phases 0–7 complete — both units, the toolbox, the progress
dashboard, the final assessment and the certificate are built and tested, and the content
review is recorded in [CONTENT-REVIEW.md](CONTENT-REVIEW.md). Phase 8 (publish) awaits
approval and the author-email change.

---

## 0. Source material analysis (completed)

The PDF was read in full: 19 scanned pages = textbook pages **66–84** of a Hebrew Grade 6 mathematics
book. It has now been moved to `source-materials/` and will be excluded from git.

| Textbook pages | Section | Content found |
|---|---|---|
| 66 | א. הכרת הפירמידה | Definition: base polygon + triangular lateral faces meeting at apex; terms בסיס / מעטפת / קודקוד הראש; type named by base shape |
| 67 | | Reasoning about which pyramid matches a described property; equilateral-triangle pyramid — any face can be the base |
| 68 | | Pyramid vs. non-pyramid sorting (cone, prism, truncated pyramid, stepped solid, non-polyhedron distractors) |
| 69 | פאות, צלעות, קודקודים | Hands-on build (straws + plasticine); table linking base-side count *n* → vertices, edges, faces |
| 70 | | Riddles: given faces/edges/vertices, deduce base; odd/even reasoning about edge & vertex counts |
| 71 | | Pyramid vs. prism from edge count alone ("can't tell" cases); Euler relation F + V − E = 2 |
| 72 | פריסה של פירמידה | Matching pyramids to their nets |
| 73 | | Three candidate nets per pyramid — identify the one that is *not* a valid net |
| 74 | ב. חישוב נפח | Measuring the perpendicular height; *h* notation; height in a pyramid vs. in a prism |
| 75 | | Rice-pouring experiment: pyramid fills matching prism exactly 3 times |
| 76 | | Rule: pyramid volume = ⅓ of prism with same base and height; paired computations |
| 77 | | Formula worked example (base area × height) : 3; chocolate-mould word problem |
| 78 | | Candle-shop matching: solids to shelves labelled by volume |
| 79 | | Equal-gift chocolate problem; reverse problems (find *h*, find base side) |
| 80 | | Composite solids (prism + pyramid); popcorn-box value-for-money comparison |
| 81 | | Burn-time candle problem; planter capacity; real building (Moody Gardens pyramid) |
| 82–83 | בדקו את עצמכם | Self-check: nets of prisms vs. pyramids; volume pairs; composite solid |
| 84 | סיכום הפרק | Chapter summary of all definitions and the volume rule |

**Copyright handling:** the PDF is used as a *pedagogical reference only*. Every diagram, number,
question wording and illustration on the website will be newly authored. No scan, illustration or
verbatim question text will appear on the site or in the repository.

---

## 1. Site map

```
index.html                      דף הבית — Hub
│
├── יחידה 1 — הכרת הפירמידה     (unit-1)
│   ├── 1.1  מהי פירמידה?
│   ├── 1.2  פירמידה או לא פירמידה?
│   ├── 1.3  סוגי פירמידות לפי הבסיס
│   ├── 1.4  מרכיבי הפירמידה
│   ├── 1.5  חוקרים את הקשרים
│   ├── 1.6  פירמידה והפריסה שלה
│   ├── 1.7  מקפלים את הפריסה
│   ├── 1.8  נכון או לא נכון?
│   └── 1.9  בדקו את עצמכם — יחידה 1
│
├── יחידה 2 — חישוב נפח פירמידה  (unit-2)
│   ├── 2.1  גובה הפירמידה
│   ├── 2.2  שטח הבסיס
│   ├── 2.3  מנסרה ופירמידה — השוואה
│   ├── 2.4  למה מחלקים בשלוש?
│   ├── 2.5  סרטון: נפח פירמידה   ← YouTube + comprehension gate
│   ├── 2.6  בונים את הנוסחה
│   ├── 2.7  תרגול מודרך
│   ├── 2.8  תרגול עצמאי
│   ├── 2.9  מה חסר? (נעלם)
│   ├── 2.10 בעיות מהחיים
│   └── 2.11 בדקו את עצמכם — יחידה 2
│
├── ארגז הכלים                  (toolbox — free-play 3D explorer + net folder + formula card)
├── ההתקדמות שלי                (progress dashboard)
└── מבחן סיום + תעודת סיום       (final assessment + badge)
```

Three top-level nav items in the header: **דף הבית**, **ארגז הכלים**, **ההתקדמות שלי**.
Routing via hash URLs (`#/unit-1/1.4`) so GitHub Pages needs no server rewrites and the
browser Back button works.

---

## 2. Exact learning sequence

The sequence is **concrete → visual → verbal → symbolic → applied**, mirroring how the source
chapter builds the idea, but rebuilt as interaction rather than paper.

**Unit 1**
1. **See it** (1.1) — rotate a real pyramid, meet the words בסיס / מעטפת / פאה / צלע / קודקוד / קודקוד הראש.
2. **Bound the concept** (1.2) — decide what *is not* a pyramid, and why. Misconceptions are met head-on: cone, truncated pyramid, prism, stepped solid.
3. **Classify** (1.3) — the base names the pyramid. Change the base from 3 to 8 sides and watch the name change.
4. **Name the parts** (1.4) — labelling on a live model, base highlighted separately from the מעטפת.
5. **Find the pattern** (1.5) — fill a table for n = 3,4,5,6, then state the three rules in words:
   V = n + 1, E = 2n, F = n + 1. Close with the Euler check F + V − E = 2.
6. **Flatten it** (1.6) — match pyramids to nets, reject impostor nets.
7. **Fold it back** (1.7) — animated folding closes the 2D↔3D loop.
8. **Justify** (1.8) — true/false with a required reason, feedback explains the reasoning, not just the verdict.
9. **Check** (1.9).

**Unit 2**
10. **The right height** (2.1) — the perpendicular height, distinguished from lateral edge and slant height. This is the single biggest source of error, so it comes first.
11. **The base area** (2.2) — square, rectangle, triangle bases.
12. **Compare** (2.3) — a prism and pyramid on identical bases with identical heights, side by side.
13. **Discover the third** (2.4) — pour the pyramid into the prism: exactly three fills. Learner *predicts* first, then checks.
14. **Watch and summarise** (2.5) — the video, gated by one comprehension question.
15. **Build the formula** (2.6) — assemble `(שטח הבסיס × גובה) : 3` from parts (textbook notation, D10).
16. **Practise with support** (2.7) — three-step scaffold, each step checked.
17. **Practise alone** (2.8).
18. **Work backwards** (2.9) — given volume, find height or base.
19. **Apply** (2.10) — packaging, candles, planters, a real building.
20. **Assess** (2.11 + final exam) → תעודת סיום.

**Gating rule:** activities are *recommended* in order, and a locked activity shows a soft lock with
"אפשר להיכנס, אבל כדאי קודם…". Only two things are hard-gated: the video's ממשיכים לתרגול button, and
the final certificate (requires ≥ 75% on the final assessment). Everything else stays open — a
Grade 6 learner who gets stuck must never be trapped.

---

## 3. Activity table

Columns: purpose · interaction type · feedback.

### Unit 1 — הכרת הפירמידה

| # | Activity | Purpose | Interaction | Feedback |
|---|---|---|---|---|
| 1.1 | מהי פירמידה? | Form the concept image; acquire vocabulary | Free-rotate 3D model; tap a part to reveal its name; "next fact" reveal cards | Non-scored exploration. Each reveal gives a one-sentence explanation. Completion = all 6 parts revealed |
| 1.2 | פירמידה או לא פירמידה? | Bound the concept against near-misses | Drag-and-drop 8 solids into two bins (**פירמידה** / **לא פירמידה**); tap-to-select fallback | Per-item on drop: ✔ green + reason ("כל הפאות משולשים ונפגשים בקודקוד אחד") / ✘ amber + specific misconception ("לחרוט יש בסיס עגול — לא מצולע"). Retry allowed, score = first-attempt |
| 1.3 | סוגי פירמידות לפי הבסיס | Type is determined by the base | Slider changes base sides 3→8 on the live 3D model; then match 5 name-cards to 5 shapes | Live: the name updates as the slider moves. Matching: instant ✔/✘ with the base shape highlighted in the model |
| 1.4 | מרכיבי הפירמידה | Precise use of the six terms | Drag 6 Hebrew labels onto hotspots on the model (בסיס, פאה צדדית, מעטפת, צלע בסיס, צלע צדדית, קודקוד הראש) | Snap + ✔ on correct hotspot; on error the label springs back and a hint highlights the correct region for 1.5 s. All-correct → the model plays a short "exploded" animation |
| 1.5 | חוקרים את הקשרים | Generalise n → V, E, F | Fill a 4-row table (numeric inputs) while the 3D model rebuilds for each n; then complete three rule sentences from dropdowns | Row-level ✔/✘ on blur; a wrong cell offers "ספרו יחד איתי" which animates counting the actual vertices/edges on the model. Final: Euler check F+V−E=2 confirmed on their own numbers |
| 1.6 | פירמידה והפריסה שלה | 3D ↔ 2D correspondence | Drag 4 net SVGs onto 4 pyramids; 2 impostor nets included | ✔ with "הבסיס הוא מחומש ויש 5 משולשים"; ✘ explains what's wrong ("יש כאן 4 משולשים בלבד — חסרה פאה") |
| 1.7 | מקפלים את הפריסה | Make the fold physically intuitive | Fold slider 0→100% + ▶ play; base-shape selector | Non-scored. Counters update live during the fold ("משולשים שקופלו: 3 מתוך 5"). Completion = one full fold |
| 1.8 | נכון או לא נכון? | Verbal reasoning, misconception repair | 8 statements, נכון / לא נכון, then choose the reason from 3 options | Two-stage: verdict feedback, then reasoning feedback. A correct verdict with wrong reasoning is marked "כמעט" — the reasoning is what's scored |
| 1.9 | בדקו את עצמכם — יחידה 1 | Formative check | 8 mixed items (MC, matching, 1 numeric) | Score + per-item review with links back to the activity that teaches it |

### Unit 2 — חישוב נפח פירמידה

| # | Activity | Purpose | Interaction | Feedback |
|---|---|---|---|---|
| 2.1 | גובה הפירמידה | Separate perpendicular height from lateral edge and slant height | On a rotatable model with 3 candidate segments drawn, tap the true גובה; 4 rounds, base type changes each round | ✘ on lateral edge → "זו צלע צדדית — היא מגיעה לקודקוד של הבסיס, לא לנקודה שמתחת לקודקוד הראש". A right-angle marker animates in on the correct answer |
| 2.2 | שטח הבסיס | Retrieve area formulas in a 3D context | Given a pyramid with base dimensions shown, type the base area; bases: square, rectangle, right triangle | Numeric check with tolerance 0; wrong → shows the base flattened into 2D with the formula reminder |
| 2.3 | מנסרה ופירמידה | Same base, same height — the fair comparison | Side-by-side 3D, linked camera, shared base-shape and height sliders | Non-scored. A live readout shows both volumes and the ratio 3 : 1 once the learner opts to reveal it |
| 2.4 | למה מחלקים בשלוש? | The conceptual heart of the unit | Predict first (how many pyramid-fulls fill the prism? 2 / 3 / 4), then run a pouring animation | Prediction is recorded, never punished. After the animation: "מילאנו בדיוק 3 פעמים" + the general statement. Learners who predicted 3 get an extra "ניחוש מצוין" |
| 2.5 | סרטון: נפח פירמידה | Consolidation in another modality | Responsive YouTube embed. Prompt above; one comprehension question below | Above: *צפו בסרטון הקצר וסכמו לעצמכם: אילו נתונים דרושים כדי לחשב נפח של פירמידה?* Below: *מהם שני הנתונים שצריך לדעת כדי לחשב נפח של פירמידה?* Correct → unlocks **ממשיכים לתרגול** |
| 2.6 | בונים את הנוסחה | Symbolise the rule | Drag tiles (שטח הבסיס, גובה, ×, :, 3, and the brackets) into a formula frame | Wrong order → the frame shakes and one tile is highlighted with a hint. Correct → the formula locks in and becomes the persistent formula card in the toolbox |
| 2.7 | תרגול מודרך | Scaffolded procedure | 3 problems, each in 3 checked steps: (1) base area (2) × height (3) : 3 | Step-level ✔/✘; a wrong step blocks the next one and offers a worked hint. Step 3 wrong → reminder that dividing by 3 comes last |
| 2.8 | תרגול עצמאי | Fluency | 6 single-input problems, mixed base types, includes one with base area given directly and one where it must be computed | Instant ✔/✘, two attempts, then a full worked solution. Running score bar |
| 2.9 | מה חסר? | Reverse the formula | 4 problems: given V and base area find h; given V and h find base area; given V, h and a square base find the side | ✘ → shows the rearranged relation as a sentence, not algebra: "אם מכפילים ומחלקים ב־3 ומקבלים 32, אז לפני החלוקה היה 96" |
| 2.10 | בעיות מהחיים | Transfer | 5 word problems: packaging capacity, a candle's burn time, a planter, a composite solid (prism + pyramid roof), a real pyramid building. Each has a units step | ✘ on units is distinguished from ✘ on arithmetic ("החישוב נכון — אבל התשובה בליטרים, לא בסמ״ק") |
| 2.11 | בדקו את עצמכם — יחידה 2 | Formative check | 8 mixed items | Score + per-item review with back-links |

### Cross-cutting

| # | Activity | Purpose | Interaction | Feedback |
|---|---|---|---|---|
| T | ארגז הכלים | Reference and free play | Full 3D explorer (all toggles), net folder, formula card, glossary of the 6 terms | None — a reference surface, always unlocked |
| F | מבחן סיום | Summative | 12 items sampling both units, no hints, one attempt per item | Score at the end only, then a full review. ≥ 80% → תעודת סיום with the learner's name and date |

**Item counts:** 14 scored activities, ~70 scored items. All numbers, contexts and wordings are new.

---

## 4. Purpose of each activity

Covered inline in §3, column *Purpose*. In summary the arc is:
concept formation (1.1) → concept boundary (1.2) → classification (1.3) → precise vocabulary (1.4) →
generalisation (1.5) → representation change (1.6–1.7) → verbal reasoning (1.8) →
attribute identification (2.1–2.2) → comparison (2.3) → conceptual derivation (2.4–2.5) →
symbolisation (2.6) → procedural fluency (2.7–2.8) → inverse reasoning (2.9) → transfer (2.10).

---

## 5. Interaction types used

Seven types, deliberately limited so nothing needs re-learning:

1. **3D manipulation** — rotate, and change base/height with sliders.
2. **Tap-to-identify** — tap the right part or segment on a model.
3. **Drag-and-drop** — into bins, onto hotspots, into a formula frame. *Every* drag interaction also
   works as tap-source-then-tap-target, for touch, keyboard and motor accessibility.
4. **Multiple choice / true-false** — with a required reasoning step.
5. **Numeric input** — a custom on-screen number pad on mobile, `inputmode="decimal"`.
6. **Table completion** — for the pattern-finding investigation.
7. **Animation with a prediction step** — pour animation, fold animation.

---

## 6. Feedback design

A single feedback contract across the whole site:

- **Immediate**, on the item, never batched to the end (except the final exam).
- **Never bare.** Every ✔ says *why* it's right; every ✘ names the specific misconception.
- **Colour is never the only channel** — ✔/✘ glyph + text, plus `aria-live="polite"` announcement.
- **Wrong answers are diagnosed, not just counted.** Each distractor in the content data carries its
  own `misconception` string. Example set for 2.1: lateral edge / slant height / base edge each get
  a different explanation.
- **Two attempts** on scored practice items, then a worked solution; first-attempt correctness is
  what is stored.
- **Tone:** encouraging, second-person plural (as in the textbook: "חשבו", "בדקו"), never "טעית".
  Wrong = "כמעט — שימו לב ש…".
- **Non-scored explorations** give running descriptive feedback instead of verdicts.

---

## 7. Visual design system

**Direction:** `<html dir="rtl" lang="he">`. Logical CSS properties throughout
(`margin-inline-start`, `padding-inline`, `inset-inline`) — no `left`/`right`.

**Typography** (Google Fonts, both with full Hebrew coverage, SIL Open Font License):
- Headings: **Secular One** — 700
- Body & UI: **Rubik** — 400 / 500 / 700
- Numerals and formulas: Rubik tabular figures, LTR-isolated inside RTL text with `<bdi>`
- Base size 17px mobile / 18px desktop, line-height 1.65 — generous for Hebrew at this age

**Colour** (accessible pyramid/desert palette, all text pairs ≥ 4.5:1):

| Token | Value | Use |
|---|---|---|
| `--ink` | `#16233A` | Text, header background |
| `--sand` | `#FAF6EF` | Page background |
| `--surface` | `#FFFFFF` | Cards |
| `--gold` | `#E0A32E` | Primary accent, brand, badge |
| `--unit-1` | `#1F8A8C` | Unit 1 identity (teal) |
| `--unit-2` | `#C2571E` | Unit 2 identity (terracotta) |
| `--success` | `#1E7A4B` | Correct |
| `--warn` | `#B4451E` | Incorrect (never pure red) |
| `--muted` | `#6B7280` | Secondary text |

Dark mode: full token swap under `prefers-color-scheme: dark`, with the 3D scene switching to a
dark ground plane and lighter edge lines.

**Layout:** 12-column fluid grid, `max-width: 1100px`. Hub cards in a
`repeat(auto-fit, minmax(280px, 1fr))` grid → 3 up desktop, 2 up tablet, 1 up mobile.

**Components:** header bar with brand + 3 nav buttons; unit banner; activity card (icon, title,
one-line purpose, progress ring, state chip); question card; feedback strip; step scaffold;
3D stage with a control rail; net canvas; progress bar; certificate.

**Motion:** 150–250 ms ease-out for UI, up to 2.5 s for the pour and fold animations. All motion is
disabled under `prefers-reduced-motion` — the pour and fold then become step-through frames with a
slider, so no content is lost.

**Iconography:** original inline SVG (a small pyramid glyph set), plus a few emoji for card
identity, matching the reference site's approach. No third-party icon fonts.

---

## 8. Technical approach — 3D model

**Library:** Three.js r160+, loaded from `https://cdnjs.cloudflare.com`, pinned to an exact version.
No build step, no npm — GitHub Pages serves the files as-is.

**Geometry is generated, never imported.** One module, `pyramid-geometry.js`, exposes:

```
buildPyramid({ n, radius, height })
  → { baseVertices[], apex, faces[], edges[], normals[] }
```

Base vertices are placed on a circle at angle `2πk/n`, k = 0…n−1; the apex sits at
`(0, height, 0)`. From that single description the module derives every rendered layer, so the
whole site has exactly **one** source of geometric truth and the 3D model, the net, the fold
animation and the printed vertex/edge/face counts can never disagree.

**Render layers, each independently toggleable:**

| Layer | Three.js object | Notes |
|---|---|---|
| בסיס | `ShapeGeometry` fan, distinct colour | Highlightable on its own |
| מעטפת (פאות צדדיות) | `BufferGeometry`, `MeshStandardMaterial`, `transparent` with an opacity slider | Semi-transparency is what makes the interior height visible |
| צלעות | `LineSegments` with `LineBasicMaterial`; base edges and lateral edges are separate groups | Different colours per group |
| קודקודים | small `SphereGeometry` instances | Tappable |
| גובה | dashed `Line` from apex to base centre + a right-angle marker + the foot point | The pedagogically critical layer |
| תוויות | HTML labels positioned by projecting 3D points to screen space each frame | Real DOM text ⇒ selectable, screen-reader accessible, correct Hebrew shaping — not texture text |

**Controls:** `OrbitControls` with panning disabled, polar angle clamped so the model can't be
flipped upside-down, damping on, auto-rotate off by default with a ▶ toggle. A "אפס תצוגה" button
returns to the canonical three-quarter view.

**Interaction:** `Raycaster` on pointer events for tap-to-identify and label hotspots.

**Performance:** one shared `WebGLRenderer` and scene, reused across activities;
`pixelRatio` capped at 2; the render loop runs only while the scene is dirty or being dragged
(`requestAnimationFrame` on demand, not continuously) — important for battery on school tablets.

**Fallback:** if WebGL is unavailable, `pyramid-geometry.js` output is rendered as a static
projected **SVG** from three preset angles, with the same toggles and the same labels. No activity
requires WebGL to be answerable.

---

## 9. Technical approach — interactive nets

**Nets are SVG, computed from the same geometry module.** For a pyramid with base side *s* and slant
height *l*, the net is the base polygon with a triangle attached to each base edge, laid out by
rotating each triangle out around its edge in the plane. This gives exact, consistent nets for any
n from 3 to 8, and guarantees the net always matches the 3D model on screen beside it.

**Matching activity (1.6):** each net is an inline SVG in a draggable card; drop targets are the
pyramid cards. Impostor nets are generated by deliberate mutation of a valid net — remove one
triangle, replace the base with the wrong polygon, or attach two triangles to one edge — so each
distractor maps to a named misconception.

**Folding animation (1.7)** — technically practical, and this is the recommended approach:

The fold is done in Three.js, not SVG. Because every lateral face of a pyramid hinges on exactly one
base edge, the entire fold is a **single parameter** `t ∈ [0,1]`: each lateral triangle is rotated
about its own base edge from the flat plane (angle 0) to the closed dihedral angle (angle θ), where
θ is computed from the geometry. One shared `t`, driven by a slider or an eased tween on ▶.
No physics, no mesh deformation, no per-frame re-triangulation — the triangles are rigid and only
their transform matrices change. It runs comfortably at 60 fps on a phone.

At `t = 0` the camera looks straight down and the scene reads exactly as the flat 2D net;
at `t = 1` it's the solid. The camera eases from top-down to three-quarter across the fold.
Under `prefers-reduced-motion`, ▶ is hidden and only the slider remains.

---

## 10. Progress saving

**Mechanism:** `localStorage`, a single versioned JSON document under one key.

```
key: "gevim.pyramid.progress.v1"

{
  "version": 1,
  "student": { "name": "", "createdAt": "..." },
  "activities": {
    "1.4": { "state": "completed", "score": 6, "max": 6,
             "firstAttempt": 5, "attempts": 2, "updatedAt": "..." }
  },
  "flags": { "videoQuestionPassed": true, "finalPassed": false },
  "final": { "score": 0, "max": 12, "takenAt": null },
  "badge": { "earned": false, "earnedAt": null }
}
```

- Written debounced (500 ms) after every scored item and on `visibilitychange`.
- Wrapped in `try/catch` — private-browsing and blocked-storage cases degrade to an in-memory store
  and show a quiet one-line notice: "ההתקדמות לא תישמר בדפדפן הזה".
- `version` allows a migration function if the schema changes after publication, so a student's
  progress survives site updates.
- **ההתקדמות שלי** page: per-unit rings, per-activity list with state and score, overall percentage,
  the badge, and two buttons — **איפוס התקדמות** (with a confirm step) and **הורדת סיכום** (renders
  the summary as a printable page; no server involved).
- Progress is per-device and per-browser. This is stated plainly on the progress page so students
  and teachers aren't surprised. No accounts, no server, no data leaves the device — which also
  keeps the project clear of student-privacy concerns.

---

## 11. Accessibility and mobile requirements

**Accessibility (target: WCAG 2.1 AA)**
- Correct RTL semantics: `dir="rtl"`, `lang="he"`; numbers and formulas isolated with `<bdi>` so
  they don't reorder.
- Full keyboard operation. Every drag has a keyboard/tap equivalent (select source → select target).
  The 3D view is rotatable with arrow keys when focused; `Home` resets.
- Visible focus ring (3px, `--gold`, 2px offset) on every interactive element.
- All feedback announced via `aria-live="polite"`; scores via `aria-live` on the progress region.
- Colour never sole carrier of meaning — ✔/✘ glyph and text always accompany it.
- Contrast ≥ 4.5:1 body, ≥ 3:1 large text and UI boundaries; verified per token pair.
- The 3D canvas has an `aria-label` plus a visually-hidden text description of the current model
  ("פירמידה מרובעת: 5 פאות, 8 צלעות, 5 קודקודים"), updated live — a screen-reader user gets the
  same information the sighted user gets from the picture.
- `prefers-reduced-motion` respected everywhere.
- Headings form a correct outline; landmarks (`header`/`nav`/`main`/`footer`) present.

**Mobile**
- Mobile-first CSS; breakpoints at 640px and 1024px.
- Touch targets ≥ 44×44 px, spacing ≥ 8 px.
- 3D stage: `aspect-ratio` capped, max 55vh, so controls stay on screen without scrolling.
  One finger rotates the model; the page itself never hijacks scroll (`touch-action` scoped to the
  canvas only).
- Numeric answers use a custom on-screen keypad in addition to the native keyboard, so the OS
  keyboard never covers the question.
- Sticky bottom action bar on small screens (בדיקה / הבא), safe-area insets respected.
- Drag-and-drop on touch uses Pointer Events with the tap-tap fallback always visible as a hint.
- Tested at 360×640, 390×844, 768×1024, 1280×800, 1920×1080.
- Target: interactive within 2.5 s on a mid-range school tablet over school Wi-Fi; Three.js is
  loaded lazily, only on the first activity that needs it.

---

## 12. Copyright-safe asset plan

| Asset class | Source | Licence position |
|---|---|---|
| All 3D models | Generated at runtime by our own code from base-side count and height | Original |
| All 2D diagrams and nets | Generated inline SVG from the same module | Original |
| Icons | Original inline SVG set + standard Unicode emoji | Original / not copyrightable |
| Fonts | Rubik, Secular One via Google Fonts | SIL Open Font License |
| Three.js | cdnjs, pinned version | MIT |
| Photographs | **None.** Real-world contexts are drawn as original SVG (a pyramid-roofed building, a popcorn box, a planter) | Original |
| Video | YouTube `youtube-nocookie.com` iframe embed of the provided URL | Embedded under YouTube's standard terms. Not downloaded, not rehosted, not copied |
| Question text and numbers | All newly written in Hebrew; every numeric value differs from the textbook's | Original |
| Source PDF | `source-materials/`, git-ignored, never deployed | Reference only, never published |

**Enforcement:**
- `.gitignore` contains `source-materials/` and `*.pdf` from the very first commit.
- The deployable site lives in a dedicated folder; nothing outside it is published.
- A short `docs/ASSET-PROVENANCE.md` records the origin and licence of every asset, kept current.
- A pre-deployment check confirms no file in the published folder is a PDF or scanned image.

---

## 13. Recommended file structure

```
Pyramid-Practice-Hub/
├── .gitignore                 # source-materials/, *.pdf, .DS_Store
├── README.md                  # Hebrew + English, how to run and publish
├── .nojekyll                  # so GitHub Pages serves files starting with _
├── index.html                 # the only HTML file — shell + hash routing
│
├── assets/
│   ├── css/
│   │   ├── tokens.css         # colours, type scale, spacing, radii, shadows
│   │   ├── base.css           # reset, RTL defaults, typography
│   │   ├── components.css     # cards, buttons, feedback, progress, keypad
│   │   ├── activities.css     # per-activity layouts
│   │   └── print.css          # certificate + progress summary
│   │
│   ├── js/
│   │   ├── main.js            # bootstrap
│   │   ├── router.js          # hash routing
│   │   ├── store.js           # localStorage progress, versioned + migrations
│   │   ├── ui.js              # shared render helpers, feedback strip, a11y announcer
│   │   ├── geometry/
│   │   │   ├── pyramid-geometry.js   # single source of geometric truth
│   │   │   ├── scene.js              # shared Three.js renderer/scene/camera
│   │   │   ├── layers.js             # base/faces/edges/vertices/height toggles
│   │   │   ├── labels.js             # DOM labels projected from 3D
│   │   │   ├── net.js                # SVG net generation
│   │   │   ├── fold.js               # single-parameter fold animation
│   │   │   └── svg-fallback.js       # no-WebGL static projection
│   │   ├── activities/
│   │   │   ├── explore-3d.js         # 1.1, 1.3, T
│   │   │   ├── sort-bins.js          # 1.2
│   │   │   ├── label-hotspots.js     # 1.4
│   │   │   ├── table-investigate.js  # 1.5
│   │   │   ├── match-nets.js         # 1.6
│   │   │   ├── fold-explorer.js      # 1.7
│   │   │   ├── true-false.js         # 1.8
│   │   │   ├── identify-height.js    # 2.1
│   │   │   ├── compare-solids.js     # 2.3
│   │   │   ├── pour-animation.js     # 2.4
│   │   │   ├── video-gate.js         # 2.5
│   │   │   ├── formula-builder.js    # 2.6
│   │   │   ├── guided-steps.js       # 2.7
│   │   │   ├── numeric-practice.js   # 2.2, 2.8, 2.9
│   │   │   ├── word-problems.js      # 2.10
│   │   │   └── quiz.js               # 1.9, 2.11, final
│   │   └── vendor/
│   │       └── three.min.js          # pinned, or CDN link — see decision D4
│   │
│   └── img/
│       └── icons.svg          # original SVG sprite
│
├── data/
│   ├── unit-1.json            # activity definitions, items, distractors, misconception text
│   ├── unit-2.json
│   ├── final-exam.json
│   └── strings.he.json        # all UI strings, one place, easy to proofread
│
├── docs/
│   ├── PROJECT-SPEC.md        # this document
│   ├── ASSET-PROVENANCE.md
│   └── CONTENT-REVIEW.md      # Hebrew proofreading checklist
│
└── source-materials/          # GIT-IGNORED, NEVER DEPLOYED
    └── CamScanner 06.09.2026 20.04.pdf
```

**Why content lives in JSON, not in JS:** every question, distractor and feedback line sits in
`data/*.json`, so a teacher can review or fix Hebrew wording without touching code, and so the
activity engines stay generic and reusable.

---

## 14. Development phases

| Phase | Deliverable | Depends on |
|---|---|---|
| **0. Setup** | Repo init, `.gitignore` (PDF excluded first), `.nojekyll`, README, empty structure, GitHub Pages enabled and reachable | approval |
| **1. Design system + shell** | `tokens.css`, `base.css`, header, RTL layout, hash router, hub page with placeholder cards, `store.js` with progress schema and the progress page. **Reviewable in the browser at the end of this phase.** | 0 |
| **2. Geometry engine** | `pyramid-geometry.js`, `scene.js`, `layers.js`, `labels.js`, `net.js`, `fold.js`, `svg-fallback.js` — proven on a private demo page with every base type 3–8 and every toggle. This is the highest-risk piece, so it is built and verified before any activity depends on it | 1 |
| **3. Unit 1 content + activities** | 1.1–1.9 complete with Hebrew content in `data/unit-1.json`, all feedback written | 2 |
| **4. Unit 2 content + activities** | 2.1–2.11, including the pour animation, the video gate and the formula builder | 2, 3 |
| **5. Assessment + badge** | Final exam, scoring, certificate, printable summary | 3, 4 |
| **6. Accessibility + responsive pass** | Keyboard paths, screen-reader descriptions, contrast verification, reduced-motion, the five viewport sizes, no-WebGL path | 5 |
| **7. Content review** | Full Hebrew proofread, mathematical accuracy check of all ~70 items, verification that no wording or number matches the textbook | 6 |
| **8. Publish** | Final pre-deployment check that no PDF or scan is in the published tree, deploy to GitHub Pages, verify live on desktop, tablet and phone | 7 |

Phases 1, 3 and 4 each end with something you can open and try, so feedback arrives early rather
than at the end.

---

## 15. Decision register

Status legend: **APPROVED** = decided by the project owner · **OPEN** = awaiting a decision ·
**DEFAULT** = my recommendation stands under the general approval given on 2026-09-07; will be
implemented as recommended unless changed.

| # | Decision | Recommendation | Selection | Impact on the website |
|---|---|---|---|---|
| D1 | Publish from repo root, or from a separate `site/` folder? | Repo root | **APPROVED**: publish from the repository root | `index.html` sits at the top level; `source-materials/` is excluded by `.gitignore`. No Pages workflow needed |
| D2 | Repo owner, name, remote | — | **APPROVED**: owner `ai-digital-projects`, repo `pyramid-learning-hub`. Local git only; **no remote created, connected or pushed until explicitly approved** | Live URL will be `https://ai-digital-projects.github.io/pyramid-learning-hub/`. Base paths written relative so the URL can change without edits |
| D3 | One large `index.html`, or modular ES modules? | Modular | **DEFAULT** (covered by general technical approval) | Separate files per activity and per geometry concern; a bug in one activity can't break others. Identical behaviour on GitHub Pages |
| D4 | Three.js from CDN, or vendored? | Vendored | **APPROVED**: vendored in-project | Core activities work on a school network that blocks CDNs and cannot break when a CDN version is withdrawn. Adds ~600 KB to the repo; first load slightly slower, then cached |
| D5 | Base-side range for the 3D model | 3–8 | **DEFAULT** | Supports the n → V/E/F pattern investigation with four clean rows and two extension cases. No cost — geometry is generated |
| D6 | Student name for the certificate | Ask once, optional, stored locally | **APPROVED, AMENDED**: never asked during normal use; optional first-name field **only** on the certificate screen; **not written to localStorage** | Site is fully anonymous end to end. Certificate is personalised at the moment of display/print only. Consequence: the name must be re-typed if the certificate is reprinted in a later session |
| D7 | Gating strictness | Soft locks throughout, except two hard gates | **DEFAULT** | Recommended order shown, but a stuck learner is never trapped. Hard gates only on the video's **ממשיכים לתרגול** button and the certificate (≥ pass mark) |
| D8 | Final assessment: item count and pass mark | 12 items, one attempt each, 80% | **APPROVED, AMENDED**: 12 items, pass mark **75% (9 of 12)**. One answer per question per attempt. On a fail: a supportive summary naming the topics to review, links back to the relevant activities, and the whole assessment may be retaken | Badge is reachable without being cheap. Failing is a routing event, not a dead end — the result screen becomes a personalised revision plan. Store keeps the best attempt and the attempt count |
| D9 | Teacher view — answer key or printable worksheets | Not in scope | **APPROVED**: excluded from the first release; **recorded as a possible future enhancement**, not to be built now | No teacher surface ships in v1. Noted in §16 so it is not forgotten |
| D10 | Volume-formula notation | Match the textbook | **APPROVED**: primary form is `(שטח הבסיס × גובה) : 3`. An equivalent fraction form is permitted **as a secondary visual explanation only**; no conflicting notation anywhere | Formula card, formula builder (2.6), guided steps (2.7) and all worked solutions use the `:` form. The fraction appears once, in 2.4, purely to show the "one third" idea visually |
| D11 | Hebrew register | Plural imperative — חשבו / בדקו / סמנו | **DEFAULT** | Matches the wording students already meet in class. Applied consistently across all ~70 items and every UI string |
| D12 | Footer attribution | Generic, no textbook named | **DEFAULT** | Footer reads e.g. "נבנה עבור תלמידי כיתה ו׳, בית ספר גבים". Naming the source book would invite the assumption that its content was reproduced |

All twelve decisions are now settled. Phases 0 and 1 are authorised.

---

## 16. Deferred to a future release

| Item | Origin | Note |
|---|---|---|
| Teacher view — answer key, printable worksheets | D9 | Explicitly excluded from the first release by the project owner. Revisit after v1 is in classroom use |

---

## 17. Assessment retake behaviour (from D8)

- 12 items; within a single attempt each question is answered **once** — no second try, no hints.
- Pass mark **9 / 12 (75%)**.
- **On a pass:** תעודת סיום, with the optional first-name field described in D6.
- **On a fail:** a supportive summary — never a bare score. It lists the topics that came out weak
  (e.g. "כדאי לחזור על: גובה הפירמידה, מציאת נתון חסר"), each linking directly back to the activity
  that teaches it, and offers **חזרה לתרגול** and **מבחן חוזר**.
- The whole assessment may be retaken. The store keeps the best attempt, the latest attempt and the
  attempt count; the certificate reflects the best attempt.
- Item order and, where the content allows, the numbers are varied between attempts, so a retake
  is genuine re-assessment rather than memory of the sequence.
