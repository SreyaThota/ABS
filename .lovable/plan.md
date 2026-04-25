# Fix PDF / DOCX uploads

**Problem:** Upload reads PDFs as raw text, which gives binary gibberish. The AI then "summarizes" the gibberish — describing PDF file structure instead of your actual content (e.g. asymmetric encryption).

**Fix:** Extract real text from the document on the client *before* sending to the AI.

## Changes

1. **Add libraries**
   - `pdfjs-dist` — extracts text from text-based PDFs (client-side, fast, no server cost)
   - `mammoth` — extracts text from `.docx`

2. **New helper** `src/lib/extractText.ts` — picks the right extractor by file type:
   - `.pdf` → pdf.js, walks up to 50 pages, joins text
   - `.docx` → mammoth raw text
   - everything else (`.txt`, `.md`, `.csv`, code) → plain `file.text()`

3. **Update `src/pages/Upload.tsx`**
   - Show a small "Extracting…" state on the upload card with a spinner
   - On success: toast with character count, fill the textarea with extracted text (so you can preview/edit before processing)
   - On failure (e.g. scanned/image-only PDF): clear toast asking to paste manually
   - Block "Process with AI" until extraction finishes

## Behavior after the fix

- Upload `Asymmetric_Encryption.pdf` → extraction runs (~1s) → textarea fills with the actual lecture content → "Process with AI" sends real text → AI returns proper summary, key concepts, career mapping for cryptography/security.

## Note on scanned PDFs

If a PDF is just scanned images (no text layer), extraction will return empty. Those need OCR which is heavier — out of scope for this fix. The error toast will tell you to paste manually. We can add OCR later if you need it.

## No backend changes

Edge function and prompt stay the same. This is purely a client-side input fix.
