# Importing runs from a PDF drawing

Status: in the app. `POST /api/pdf-imports` reads the drawing and the run editor adds what it
finds, left out of the offer until switched in. The reading rule still covers one convention and no
edge cases.

## Goal

A designer marks shelf runs on a PDF floor plan. Today those runs are retyped by hand in the
editor. The proof of technology answers one question: can the runs be read off the drawing's own
vector content (text and lines) deterministically, without a model and without OCR?

It started with wall runs only and now covers gondolas with their end caps, still under one
convention and without edge cases.

## Drawing convention

- A run is a blue dimension line with an arrowhead at each end and a blue number, e.g. `(5)`.
  Runs never share a shelf unit.
- Every shelf unit carries a black two-line label:
  - `100/37/210`: width / depth / height in cm,
  - `6x37`: number of hanging shelves × shelf depth in cm, optionally followed by `+ PERF`, which
    does not change the shelves.
- Base cover and a single back are always assumed (`hasBaseCover: true`, `backVariant: 1`).
- A unit whose label carries anything besides `W/D/H` and one `NxD` line (e.g. `2xPP`,
  `drzwi szklane`) is kept without shelves, so the shelves are entered by hand.
- A wall run has one row of labels along its line.
- A gondola has one line along one of its sides and one number. The labels of both sides lie on
  the same side of that line, in two parallel rows.
- An end cap is part of its gondola: the gondola's line runs on past the sides and covers both end
  caps, whose labels lie across the line near its ends. An end cap has no line or number of its
  own.
- Older drawings marked each end cap as a separate short run with its own number, beyond the end
  of the gondola's line. That marking is no longer read: such end caps come out as wall runs and
  their gondolas without end caps.

Mapping onto `LayoutWallValue` (`packages/schemas/src/LayoutWall.schema.ts`): units with the same
width and shelves collapse into one `shelfUnits` entry whose `numberOfShelfUnits` is the count;
`depth` and `height` of the run come from the labels; `numberOfLayouts` counts the identical runs
with that number. Run (5) on the first drawing, three `100/37/210 6x37` units, becomes:

```json
{
  "depth": 37,
  "height": 210,
  "numberOfLayouts": 1,
  "shelfUnits": [
    {
      "numberOfShelfUnits": 3,
      "width": 100,
      "shelves": [{ "depth": 37, "numberOfShelves": 6 }]
    }
  ],
  "hasBaseCover": true,
  "backVariant": 1
}
```

Mapping onto `LayoutGondolaValue` (`packages/schemas/src/LayoutGondola.schema.ts`):

- `sides[0]` is the row farther from the line, `sides[1]` the nearer one,
- `leftEndCap` is the end cap that lies before the gondola's number in the number's reading
  direction (on the left when the number is read upright), `rightEndCap` the one after it,
- a gondola with one end cap or none is valid; the missing end cap stays `undefined`,
- identical gondolas with the same number come out as one entry whose `numberOfLayouts` counts
  them, as for wall runs. Runs that share a number but differ stay separate entries.

## What the sample PDFs contain

Measured with `pdfjs-dist` on three drawings, each one page, produced by printing to PDFCreator.
The first two come from Ghostscript 9.10 and mark end caps the old way. The third is the first
drawing again, exported with PDFCreator Free and Ghostscript 9.52, with end caps marked as part of
the gondola:

- **Text is real text.** Every label, run number and dimension comes out of `getTextContent()` as a
  string with a position, a rotation and a height. Run (5) on the first drawing: `(5)` at
  (197, 528), labels `100/37/210` + `6x37` at x ≈ 175, y 593 / 539 / 484, rotated −90°.
- **Run lines are vectors in a distinct colour**, `#007fff` on the first drawing and `#003fff` on
  the second, so the exact value is not stable between projects. The shaft of a run is one long
  axis-aligned segment; each arrowhead is a few short segments at its ends, drawn twice. Run (5) is
  the shaft x = 194.4, y 440.8 to 604.8; run (11) shares the axis, y 608.0 to 693.6, separated by
  the arrowheads.
- **Run numbers need no colour check**: `^\(\d+\)$` matches only them.
- **The scale differs**: label text is 4.4916 pt high on the first drawing and 2.7197 pt on the
  second. Every distance that has to hold on both is therefore measured in label text heights.
- **Not usable as is**: no PDF layers (OCG), the same blue is used for an unrelated note
  ("kurtyna powietrzna"), and some labels break the convention (`2xKP / 3xPP`, `h-90 66/30/2x30`).

A fourth drawing, from another shop, added a diagonal run along a slanted wall, the colour
`#00bfff`, shelf lines such as `7x30 + PERF`, and run numbers without brackets (`1` to `5`). The
first three are now read; bare numbers are not, because they cannot be told from dimensions such as
`80` next to the same lines, so that drawing gives no runs until its numbers get brackets.

## Approach: geometry over the vector content

Distances in "text heights" are multiples of the height of the label being placed.

1. **Read** the page with `pdfjs-dist`: text items from `getTextContent()`, stroked segments from
   `getOperatorList()` with the current transform and stroke colour applied.
2. **Shafts**: blue (red ≤ `0x40`, blue ≥ `0xc0`) segments of at least 10 pt at any angle,
   deduplicated. Arrowheads fall below the threshold.
3. **Run numbers**: text `(n)` assigned to the nearest shaft whose span contains it, within 6 pt.
4. **Unit labels**: a `W/D/H` text and its other lines, meaning texts of the same rotation and
   the same text height (within 0.5%) within three text heights of it. The unit gets shelves only
   when its single other line is `NxD`, and none otherwise. Notes such as `2xKP / 2xPP` or
   `drzwi szklane` share the label's font, while dimensions, section names and run numbers differ
   in height (2.7197 pt against 2.7619 pt for a dimension), which is why the tolerance is that
   tight.
5. **Side of a run**: the side of its line on which its nearest parallel label lies. Parallel
   means the text angle is within 2° of the line's, ignoring direction, since text angles are
   rounded to whole degrees (run (1) on the fourth drawing: line 9.86°, labels −171°).
6. **Label to run**: a label belongs to the nearest numbered shaft that is parallel to it, whose
   span contains it, whose side it lies on, and that is within 13 text heights. The side matters
   where gondolas stand close together: on the second drawing a gondola's far row (+32 pt) is
   nearer to the next gondola's line (−30 pt). The reach covers a gondola's far row (52 pt on the
   first drawing, 32 pt on the second, about 11.7 text heights on both) and the freezers standing
   between run (3) and its shelves on the first drawing (39.3 pt, 8.7 text heights).
7. **Rows**: a run's labels whose distances from the line differ by less than one text height form
   a row. One row is a wall run, two rows a gondola, more are skipped.
8. **End caps**: labels that no run took, lying across a gondola's line within 6 text heights of
   either of its ends (1.5 and 2.1 measured), and across between the line and the gondola's far
   row with one text height to spare. Those before the gondola's number in its reading direction
   form the left end cap, the rest the right one.
9. **Skip** a wall run whose units differ in depth or height, a gondola side whose units differ in
   depth, and a gondola whose units and end caps differ in height (its end caps go with it).
10. **Map** each run to `LayoutWallValue` or `LayoutGondolaValue`, and merge runs with the same
    number and the same reading into one entry whose `numberOfLayouts` counts them.

The thresholds are fitted to the sample drawings, which is acceptable for now and is the first
thing to revisit with more drawings.

## Requests to the designer

The geometric rule works on today's export but is the fragile part. In order of value:

1. Put the run number into every unit label, e.g. `(5) 100/37/210 6x37`. Assignment then becomes a
   text read and steps 2, 3, 5 and 6 disappear.
2. Keep the label format fixed; other notes go into a separate text.
3. Export natively from the CAD program instead of printing to PDF, so lines stay whole.
4. Keep text as text (no "text to curves", no flattening, no scans).
5. If the geometric rule stays: runs on their own layer exported as a PDF layer, and their colour
   reserved for runs.

Gondolas were also discussed with an explicit marking (`(G6)` for the gondola, `(6S)` for its end
caps). The maintainer chose geometry instead, so no change to the drawings is needed for them.

## Alternatives considered

| Option                                | Strength                                       | Weakness                                                                                 |
| ------------------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------- |
| **`pdfjs-dist`, geometry** (chosen)   | free, exact, repeatable, file stays on our API | depends on the export staying vector with real text; thresholds tuned per drawing source |
| Hosted vision LLM (Claude API)        | tolerant of messy drawings and handwriting     | paid per file, non-deterministic, drawings leave our infrastructure                      |
| Local model (Ollama + a vision model) | drawings never leave our machine               | needs a GPU server; the Fly.io machine has 256 MB RAM                                    |
| Classic OCR (Tesseract)               | local, free                                    | reads characters, not the drawing: no notion of which unit belongs to which run          |

The LLM route stays the fallback for drawings that are scans or have outlined text. Its shape, for
when it is needed: the API (never the browser, the key is a secret) sends the PDF as a base64
`document` block to `POST /v1/messages` with a JSON schema in `output_config.format`, gets JSON
back, and validates it with `LayoutWallValue` and `LayoutGondolaValue`. Forcing a tool call
(`tool_choice: "tool"`) is rejected by current models, so structured outputs are the way to get
JSON.

## Proof of technology

Code lives under `packages/apps/api/src/pdfImport/`:

- `readDrawing.ts` reads page 1 of the PDF bytes into texts (position, rotation, height) and
  stroked segments (colour, transform applied). The API compiles to CommonJS, so the dynamic
  import of the ESM-only `pdfjs-dist` becomes a `require()`; it loads through Node's `require(esm)`,
  checked on Node 22.13 and 26.5 against the built `dist`,
- `findRuns.ts` is the pure rule above and returns wall runs and gondolas, covered by
  `findRuns.test.ts` (one test per rule).

The sample drawings live in `examples/` at the repository root. The folder is git-ignored because
the drawings are client projects.

Success for wall runs: runs (5) and (11) of the first drawing come out exactly as the convention
requires. The result is deterministic, so one run is a measurement.

## Result

The proof passes. Wall runs on the first two drawings (depth/height: units); the third drawing
gives the same wall runs as the first:

| Drawing | Run  | Output                                     |
| ------- | ---- | ------------------------------------------ |
| first   | (1)  | 47/240: 2×80 6x47, 2×100 6x47, 1×100 8x47  |
| first   | (2)  | 47/240: 1×90, no shelves (`szafka / 2x37`) |
| first   | (3)  | 47/210: 4×100 4x37                         |
| first   | (4)  | 37/210: 1×100 6x37                         |
| first   | (5)  | 37/210: 3×100 6x37                         |
| first   | (11) | 37/210: 2×80 4x37                          |
| first   | (12) | 37/210: 1×100, no shelves (notes)          |
| second  | (1)  | 47/210: 2×100 4x37                         |
| second  | (2)  | 47/240: 4×66 6x47                          |
| second  | (3)  | 37/210: 3×100 6x37                         |
| second  | (9)  | 47/210: 1×100, no shelves (notes)          |

The maintainer confirmed every wall run above against the drawings.

Gondolas (height: side 1 / side 2, end caps):

| Drawing | Run     | Output                                       |
| ------- | ------- | -------------------------------------------- |
| third   | (6) × 2 | 170: 2×80 5x37 / 2×80 5x37, caps 1×80 5x37   |
| third   | (7) × 2 | 170: 2×100 5x37 / 2×100 5x37, caps 1×80 5x37 |
| first   | (6) × 2 | 170: 2×80 5x37 / 2×80 5x37, no caps          |
| first   | (7) × 2 | 170: 2×100 5x37 / 2×100 5x37, no caps        |
| second  | (4)     | 150: 2×100 2x37 / 2×100 2x37, no caps        |
| second  | (5) × 4 | 170: 2×100 5x37 / 2×100 5x37, no caps        |

On the first two drawings the old end cap runs come out as wall runs: (8) eight times as
37/170 1×80 5x37 on the first, (6) twice as 37/150 1×80 2x37 and (7) eight times as 37/170 1×80
5x37 on the second.

The maintainer confirmed the gondolas against the drawings while end caps were still read the old
way, when the first drawing gave exactly what the third gives now. Both end caps of every gondola
are identical on these drawings, so left and right are checked only by the test.

What the drawings taught, each now a rule or a test:

- the run colour differs between projects (`#007fff`, `#003fff`), hence matching by hue,
- a label can sit closer to a foreign run line than to its own, hence the side of a run,
- the scale differs between drawings, hence distances in text heights,
- freezers between a run and its shelves push labels 8.7 text heights away, hence the reach,
- label notes share the label's font while dimensions do not, hence grouping by text height,
- the end cap marking changed between two exports of the same drawing, hence one marking only.

Limits that remain:

- every threshold is fitted to three drawings from two versions of one export path,
- a run with more than two rows of labels is skipped rather than understood,
- a drawing printed differently (outlined text, scans) has no text to read; that is the case for
  the LLM fallback.

## In the app

- **Endpoint**: `POST /api/pdf-imports` takes the file as the request body (`application/pdf`,
  through `express.raw` on that route only, up to 5 MB) and answers `{ layouts }`
  (`PdfImportOutputSchema`). The file is read in memory and never stored or logged.
- **Access**: `requireAuth`, then `requireNonDemo`, both before the body is read. The `DEMO` role
  gets 403 and does not see the action.
- **Errors**: 400 `Expected a PDF file` without the `%PDF-` signature, 400 `Unreadable PDF` when
  `pdfjs-dist` fails (logged, not returned), 413 over the size limit from Express's default handler.
- **`pdfjs-dist` options**: only `data` and `verbosity: ERRORS`. No `url`, `cMapUrl` or
  `standardFontDataUrl`, so a drawing cannot make the server fetch a URL or read a file.
- **In the offer**: every run (wall run, gondola, item set) has `isExcludedFromOffer` and, when it
  came from a drawing, `drawingRunNumber`. The import sets both. The domain leaves excluded runs
  out of the bill of materials, the price strips and the total, and still gives each one an entry
  in `output.layouts` (price 0, no parts) so that prices keep matching runs by position.
- **Editor**: "Import z PDF" in the add slot appends the runs read. Each run header has a
  "W ofercie" switch and, for imported runs, a "PDF (n)" badge that stays after switching. The offer
  table hides excluded runs; the remaining codes keep their numbers.

## Not done yet

- Perforated backs: `+ PERF` is read past and the back panels are chosen as for any run. Making
  perforation a property of the component and of the run is the next stage.
- The LLM fallback for scans and outlined text.
