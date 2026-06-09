require('dotenv').config();
const express = require('express');
const cors = require('cors');
const Anthropic = require('@anthropic-ai/sdk');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '15mb' }));

if (!process.env.ANTHROPIC_API_KEY) {
  console.error('\n⛔  ANTHROPIC_API_KEY is not set.');
  console.error('   Copy .env.example to .env and add your key.\n');
  process.exit(1);
}

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// ── POST /api/scan-label ─────────────────────────────────────
// Body: { base64Image: string, mediaType?: string }
// Returns: { success: true, data: { manufacturer, model, ... } }
app.post('/api/scan-label', async (req, res) => {
  try {
    const { base64Image, mediaType = 'image/jpeg' } = req.body;
    if (!base64Image) {
      return res.status(400).json({ error: 'base64Image is required' });
    }

    const prompt = `You are an expert at reading fire department PPE (personal protective equipment) manufacturer labels. Extract every piece of information visible on the label.

══════════════════════════════════════════════
CRITICAL: YOU MUST ALWAYS RETURN ALL 9 MEASUREMENT FIELDS.
Even if a measurement is not labeled, make your best guess from the numbers present.
Never leave a measurement field as "" if there is any number on the label that could plausibly be that measurement.
══════════════════════════════════════════════

STEP 1 — Find every number on the label.
Look everywhere: printed rows, size tables, stamped text, tags, any corner of the label.
List every number you see before assigning them.

STEP 2 — Match numbers to measurements using these formats and ranges:

  measureChest  → "42 Chest" | "CH 42" | "C-42" | "CHEST 42" | "42C"
                  Typical range: 36–56. Most common: 42–50.

  measureFront  → "31 Front" | "FR 31" | "F-31" | "FRONT 31" | "31F"
                  Typical range: 28–40. Most common: 30–35.

  measureBack   → "37 Back"  | "BK 37" | "B-37" | "BACK 37"  | "37B"
                  Typical range: 30–44. Most common: 35–40.

  measureSleeve → "33 Sleeve"| "SL 33" | "S-33" | "SLEEVE 33"| "33S"
                  Typical range: 30–40. Most common: 32–36.

  measureInseam → "30 Inseam"| "IN 30" | "I-30" | "INSEAM 30"
                  Typical range: 26–36. Most common: 28–34.

  measureWaist  → "34 Waist" | "W 34"  | "W-34" | "WAIST 34"
                  Typical range: 28–50. Most common: 32–44.

  measureHelmet → Any hat/helmet size. Could be: S, M, L, XL, 2XL, 7, 7.5, 7.25, Medium, Large
  measureGloves → Any glove size. Could be: S, M, L, XL, 2XL, 8, 9, 10, Small, Large
  measureBoots  → Any boot size. Could be: 8, 9, 10, 11, 10W, 10.5W, 9.5, 10EE

STEP 3 — Sequences of numbers on fire gear labels follow this order:
  Coat labels:  Chest / Front / Back / Sleeve
  Pant labels:  Waist / Inseam  (or Chest / Front / Back / Inseam)
  Example: "42 31 37 33" → measureChest=42, measureFront=31, measureBack=37, measureSleeve=33
  Example: "38 30" on pants → measureWaist=38, measureInseam=30

STEP 4 — For any measurement number you cannot match with certainty, use the typical ranges to make your best educated guess. It is ALWAYS better to guess than to leave blank.

Return a valid JSON object with EXACTLY these 18 fields:

{
  "manufacturer":    "full manufacturer/brand name",
  "model":           "model name or style number",
  "gearType":        "coat | pants | helmet | gloves | boots | hood | other",
  "measureChest":    "chest number only, e.g. 42  — REQUIRED if any numbers visible",
  "measureFront":    "front body length number only, e.g. 31",
  "measureBack":     "back body length number only, e.g. 37",
  "measureSleeve":   "sleeve length number only, e.g. 33",
  "measureInseam":   "inseam number only, e.g. 30",
  "measureWaist":    "waist number only, e.g. 34",
  "measureHelmet":   "hat/helmet size, e.g. L/XL or 7.5",
  "measureGloves":   "glove size, e.g. XL or 10",
  "measureBoots":    "boot size, e.g. 10W or 11",
  "nfpaStandard":    "NFPA standard number, e.g. NFPA 1971",
  "complianceInfo":  "certification body, edition year, compliance notes",
  "manufactureDate": "manufacture date exactly as shown on label",
  "expirationDate":  "service life expiration date if shown",
  "serialNumber":    "serial number, lot number, or item ID",
  "inspectionInfo":  "ISP stamps, certification marks, or inspection dates"
}

RULES:
- Return ONLY the raw JSON object — no markdown, no backticks, no extra text
- Use "" only if a value is truly not present AND cannot be reasonably inferred
- Numbers only in measurement fields (no units, no labels) — just the number
- Helmet/glove/boot sizes may include letters (S, M, L, XL, W) — that is fine`;

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-5',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mediaType, data: base64Image },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });

    const rawText = message.content[0].text;
    const cleaned = rawText.replace(/```(?:json)?/gi, '').trim();

    let extracted;
    try {
      extracted = JSON.parse(cleaned);
    } catch {
      const match = cleaned.match(/\{[\s\S]*\}/);
      if (match) {
        extracted = JSON.parse(match[0]);
      } else {
        throw new Error('Claude returned unexpected format: ' + rawText.slice(0, 200));
      }
    }

    res.json({ success: true, data: extracted });
  } catch (error) {
    console.error('Scan error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// ── Health check ─────────────────────────────────────────────
app.get('/api/health', (_, res) => res.json({ status: 'ok' }));

app.listen(PORT, () => {
  console.log(`\n🔥 GearScanner backend running on http://localhost:${PORT}\n`);
});
