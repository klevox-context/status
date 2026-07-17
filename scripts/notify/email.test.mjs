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

test("maintenance title is HTML-escaped in the body", () => {
  const { html } = buildEmail({ kind: "maintenance", service: "x", title: '<img src=x onerror=alert(1)>' });
  // NB: the branded frame contains a legit wordmark <img>, so assert on the payload itself:
  // the malicious tag is neutralized (no live `<img src=x …>`) and rendered as inert escaped text.
  assert.doesNotMatch(html, /<img src=x/);
  assert.match(html, /&lt;img/);
});

test("renders in the shared Aibuku branded frame", () => {
  const { html } = buildEmail({ kind: "maintenance", service: "Portal", title: "Portal maintenance" });
  assert.match(html, /^<!doctype html>/);
  assert.match(html, /aibuku-wordmark-on-light\.png/); // wordmark masthead
  assert.match(html, /aibuku-wordmark-on-dark\.png/); // dark-mode wordmark
  assert.match(html, /class="btn"[^>]*>View live status</); // one olive-ink CTA
  assert.match(html, /background:#0c0c09/); // olive ink, not the old blue/gray
  assert.doesNotMatch(html, /#666/); // old unbranded footer color gone
  assert.doesNotMatch(html, /font-family:system-ui,sans-serif"/); // old wrapper gone
});
