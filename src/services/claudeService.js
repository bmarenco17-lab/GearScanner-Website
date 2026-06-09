import { ANTHROPIC_API_KEY, CLAUDE_MODEL } from '../config/constants';

const CLAUDE_API_URL = 'https://api.anthropic.com/v1/messages';

/**
 * Analyzes a fire gear manufacturer label image using Claude Vision.
 * @param {string} base64Image - Base64-encoded JPEG (no data URI prefix)
 * @returns {Promise<Object>} Extracted gear fields
 */
export async function analyzeGearLabel(base64Image) {
  const prompt = `You are analyzing a manufacturer label on fire department personal protective equipment (PPE) / turnout gear.

Extract every piece of information visible on this label and return it as a valid JSON object with EXACTLY these fields:

{
  "manufacturer": "full manufacturer/brand name",
  "model": "model name or style number",
  "gearType": "type of gear: coat | pants | helmet | gloves | boots | hood | other",
  "size": "size as labeled (e.g., XL, 46R, Medium, 10W)",
  "nfpaStandard": "NFPA standard (e.g., NFPA 1971, NFPA 1977)",
  "complianceInfo": "certification body, edition year, and any compliance notes",
  "manufactureDate": "manufacture date exactly as shown (e.g., 03/2022)",
  "expirationDate": "service life expiration or retirement date if shown",
  "serialNumber": "serial number, lot number, or item ID",
  "inspectionInfo": "any ISP stamps, third-party certification marks, or inspection dates"
}

Rules:
- Use empty string "" for any field not visible on the label
- Do NOT guess or infer values not shown on the label
- Return ONLY the JSON object — no explanation, no markdown, no backticks`;

  const response = await fetch(CLAUDE_API_URL, {
    method: 'POST',
    headers: {
      'x-api-key': ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CLAUDE_MODEL,
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: {
                type: 'base64',
                media_type: 'image/jpeg',
                data: base64Image,
              },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    let errorMsg = `HTTP ${response.status}`;
    try {
      const errBody = await response.json();
      errorMsg = errBody.error?.message || errorMsg;
    } catch {}
    throw new Error(`Claude API error: ${errorMsg}`);
  }

  const data = await response.json();
  const rawText = data.content?.[0]?.text || '';

  // Strip accidental markdown fences and parse
  const cleaned = rawText.replace(/```(?:json)?/gi, '').trim();
  try {
    return JSON.parse(cleaned);
  } catch {
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    throw new Error('Could not parse Claude response. Raw: ' + rawText.slice(0, 200));
  }
}

/** Returns a blank gear record with all fields initialized to "". */
export function emptyGearRecord() {
  return {
    manufacturer: '',
    model: '',
    gearType: '',
    size: '',
    nfpaStandard: '',
    complianceInfo: '',
    manufactureDate: '',
    expirationDate: '',
    serialNumber: '',
    inspectionInfo: '',
  };
}
