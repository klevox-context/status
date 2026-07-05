import { test } from "node:test";
import assert from "node:assert/strict";
import { classify } from "./classify.mjs";

const issue = (labels, title = "🛑 API is down") => ({ title, labels: labels.map((name) => ({ name })) });

test("status label added -> incident_open", () => {
  const r = classify({ action: "labeled", label: { name: "status" }, issue: issue(["status", "api"]), sender: { login: "KlaasAtContext" } });
  assert.equal(r.kind, "incident_open");
  assert.equal(r.service, "API");
});

test("issue closed with status label -> incident_resolved", () => {
  const r = classify({ action: "closed", issue: issue(["status", "api"]), sender: { login: "KlaasAtContext" } });
  assert.equal(r.kind, "incident_resolved");
});

test("maintenance label added -> maintenance", () => {
  const r = classify({ action: "labeled", label: { name: "maintenance" }, issue: issue(["maintenance"], "Portal maintenance"), sender: { login: "KlaasAtContext" } });
  assert.equal(r.kind, "maintenance");
});

test("maintenance issue closed -> maintenance_done", () => {
  const r = classify({ action: "closed", issue: issue(["maintenance"], "Portal maintenance"), sender: { login: "KlaasAtContext" } });
  assert.equal(r.kind, "maintenance_done");
});

test("labeled with a non-status/maintenance label -> ignore (de-dup guard)", () => {
  const r = classify({ action: "labeled", label: { name: "api" }, issue: issue(["status", "api"]), sender: { login: "KlaasAtContext" } });
  assert.equal(r.kind, "ignore");
});

test("bot actor -> ignore (loop guard)", () => {
  const r = classify({ action: "closed", issue: issue(["status"]), sender: { login: "github-actions[bot]" } });
  assert.equal(r.kind, "ignore");
});

test("hand-opened issue without status/maintenance -> ignore", () => {
  const r = classify({ action: "labeled", label: { name: "bug" }, issue: issue(["bug"], "🔑 Rotate the GH_PAT"), sender: { login: "someone" } });
  assert.equal(r.kind, "ignore");
});
