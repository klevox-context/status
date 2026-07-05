import { readFileSync } from "node:fs";
import { classify } from "./classify.mjs";
import { buildEmail } from "./email.mjs";
import { sendBroadcast } from "./resend.mjs";

const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH, "utf8"));
const result = classify(event);
console.log(`classify → ${result.kind}${result.reason ? ` (${result.reason})` : ""}`);
if (result.kind === "ignore") process.exit(0);

const apiKey = process.env.RESEND_API_KEY;
const audienceId = process.env.RESEND_AUDIENCE_ID;
const from = process.env.STATUS_EMAIL_FROM || "status@aibuku.com";

const { subject, html } = buildEmail(result);
if (!apiKey || !audienceId) {
  console.log(`INERT (no RESEND_API_KEY/RESEND_AUDIENCE_ID) — would send: "${subject}"`);
  process.exit(0);
}
const id = await sendBroadcast({ apiKey, audienceId, from, subject, html });
console.log(`sent broadcast ${id}: "${subject}"`);
