import { test } from "node:test";
import assert from "node:assert/strict";
import { buildEmail } from "./email.mjs";

test("incident_open subject + unsubscribe placeholder", () => {
  const { subject, html } = buildEmail({ kind: "incident_open", service: "API", title: "🛑 API is down" });
  assert.match(subject, /Investigating.*API/);
  assert.match(html, /\{\{\{RESEND_UNSUBSCRIBE_URL\}\}\}/);
  assert.match(html, /status\.aibuku\.com/);
});

test("incident_resolved subject", () => {
  assert.match(buildEmail({ kind: "incident_resolved", service: "API", title: "" }).subject, /Resolved.*API/);
});

test("maintenance subject", () => {
  assert.match(buildEmail({ kind: "maintenance", service: "Portal maintenance", title: "Portal maintenance" }).subject, /maintenance/i);
});

test("unknown kind throws", () => {
  assert.throws(() => buildEmail({ kind: "ignore" }));
});
