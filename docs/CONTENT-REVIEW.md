# Content review — Stage 7

A record of the mathematical and language review of all site content.

Reviewed: **2026-09-15**, against commit `89238bf`.
Scope: 20 activities · 102 activity questions · 12 final-exam items · all interface strings.

---

## 1. Mathematical accuracy

### 1.1 Numeric answers re-derived independently

Every numeric answer in the site was recomputed from its own problem statement, in the
browser, without reading the stored answer — then compared against it.

**41 of 41 correct. No discrepancies.**

| Group | Checks | Result |
|---|---|---|
| 2.2 base areas (square, rectangle, triangle, inverse) | 4 | pass |
| 2.6 formula application | 1 | pass |
| 2.7 guided practice — 3 problems × 3 steps, plus each final step cross-checked against `V = base × h ÷ 3` | 12 | pass |
| 2.8 independent practice | 6 | pass |
| 2.9 missing-value (inverse) problems | 4 | pass |
| 2.10 real-world problems, incl. unit conversion and a composite solid | 4 | pass |
| 2.11 unit self-check | 4 | pass |
| Unit 1 counting answers, checked against the geometry engine | 6 | pass |

### 1.2 Multiple-choice answers carrying a number

Nine multiple-choice items state a computed value in the correct option. Each was recomputed
and matched against the option text. **9 of 9 correct**, including all numeric final-exam items.

### 1.3 Geometry engine

`App.Geometry.selfTest()` returns no problems. It verifies, for every base from 3 to 8 sides:

- vertices = n + 1, edges = 2n, faces = n + 1
- Euler's relation F + V − E = 2
- **height < slant height < lateral edge** — the ordering that underpins activity 2.1
- all net flaps converge exactly on the apex when fully folded (error < 1e-15)
- pyramid volume is exactly one third of the matching prism

Because the 3D model, the SVG drawing, the net, the fold animation and the printed
vertex/edge/face counts are all derived from this one module, they cannot disagree with
each other.

### 1.4 Pedagogical accuracy — points checked with care

| Claim | Verdict |
|---|---|
| "In a triangular pyramid any face can serve as the base" | Correctly qualified in 1.2 Q4: only stated **if all four faces are congruent**. The unqualified claim would be false |
| "The height is the shortest of the three segments" (2.1 Q3) | True for a right pyramid, and the question says *בפירמידה ישרה*. Verified numerically by the engine |
| "The one-third rule" | Correctly conditioned on equal bases **and** equal heights, in 2.3 Q3, 2.4 Q3 and the toolbox formula card |
| Oblique pyramid still has a well-defined height (2.1 Q5) | Correct — perpendicular distance from apex to the base plane |
| Popcorn value comparison (2.10 Q3) | Box holds 3× for 24₪ vs 9₪ — a price ratio of 2.67 against a volume ratio of 3, so the box is better value. Three pyramids would cost 27₪ > 24₪. Arithmetic in the distractor explanations is correct |
| Composite solids (2.10 Q4, 2.11 Q7) | Prism part is **not** divided by 3; only the pyramid part is. Distractor explanations name this specific error |
| Euler's relation attributed to Euler | Correct |

---

## 2. Structural integrity

An automated audit of every question found **no problems**:

- every multiple-choice answer exists among its own options
- no duplicate option ids, and no duplicate option texts in the final exam
- every wrong option has either a specific explanation or a fallback
- no numeric distractor value coincides with the correct answer
- every `pick` target has a matching entry in `partNames`
- every formula-builder answer tile is actually offered among the tiles
- every declared `maxScore` matches the real number of scorable items
- every final-exam item has an answer, an explanation and a topic
- the final exam holds exactly its declared 12 items

---

## 3. Hebrew language

| Check | Result |
|---|---|
| Latin characters in learner-visible text | none |
| Division sign `÷` anywhere (decision D10 mandates `:`) | none |
| Formula notation `(שטח הבסיס × גובה) : 3` | used in all 6 places it appears; no competing form |
| Straight quotes where gershayim belong (`סמ"ק` vs `סמ״ק`) | none — all correct |
| Double spaces inside Hebrew strings | none |
| Register | plural imperative throughout (*חשבו, בדקו, סמנו, לחצו*), per decision D11 |

### Terminology — used consistently, never mixed

| Term | Occurrences |
|---|---|
| קודקוד הראש | 73 |
| צלע צדדית | 23 |
| צלע בסיס | 18 |
| מעטפת | 15 |
| פאה צדדית | 15 |
| קודקוד הבסיס | 4 |

Polygon and solid names follow standard Hebrew and agree in gender:
משולש/משולשת, מרובע/מרובעת, מחומש/מחומשת, משושה/משושה, משובע/משובעת, מתומן/מתומנת.

---

## 4. Learning-contract compliance

Spot-checked across all input types (choice, numeric, pick-on-figure, match, sort, build):

- feedback is immediate and always specific — no bare *נכון* or *לא נכון* anywhere
- a wrong answer keeps the question open and invites another attempt
- **לשאלה הבאה** appears only after the correct answer
- scoring counts the first attempt only, and never deducts twice for one question
- no drag-only interaction; every such task works as tap-then-tap
- no visible circular answer markers; learners click the real face, edge, base or vertex
- keyboard access works throughout as an accessibility path, not the advertised route

---

## 5. Open items

| Item | Status |
|---|---|
| Author email on all six commits is the owner's personal address | **Must be replaced with the GitHub noreply address before the first push.** Needs the numeric id from GitHub → Settings → Emails |
| `file://` (double-click) path | Not verified. The browser tooling available here cannot execute local files. The site uses no ES modules and no background file loading, so it should work; progress saving may be disabled depending on the browser, and the site says so in Hebrew if it is |
| Google Fonts loaded from Google's CDN | Works, with a local fallback stack. Vendoring the two fonts would remove the last external dependency for appearance. Not requested; flagged only |
| Teacher view, student names, Google Sheets reporting | Deliberately out of scope for v1 (decisions D6, D9) |
