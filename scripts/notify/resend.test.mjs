import { test } from "node:test";
import assert from "node:assert/strict";
import { sendBroadcast } from "./resend.mjs";

function stubFetch(calls) {
  return async (url, opts) => {
    calls.push({ url, opts });
    if (url.endsWith("/broadcasts")) return { ok: true, json: async () => ({ id: "bc_1" }) };
    if (url.endsWith("/broadcasts/bc_1/send")) return { ok: true, json: async () => ({ id: "bc_1" }) };
    return { ok: false, status: 500, text: async () => "unexpected" };
  };
}

test("creates then sends a broadcast", async () => {
  const calls = [];
  const id = await sendBroadcast({ apiKey: "k", audienceId: "aud_1", from: "status@aibuku.com", subject: "s", html: "h" }, stubFetch(calls));
  assert.equal(id, "bc_1");
  assert.equal(calls.length, 2);
  assert.equal(JSON.parse(calls[0].opts.body).audience_id, "aud_1");
  assert.match(calls[0].opts.headers.Authorization, /Bearer k/);
});

test("throws on a non-ok create", async () => {
  const failFetch = async () => ({ ok: false, status: 422, text: async () => "bad" });
  await assert.rejects(() => sendBroadcast({ apiKey: "k", audienceId: "a", from: "f", subject: "s", html: "h" }, failFetch));
});

test("throws when create returns no id (API shape drift)", async () => {
  const noIdFetch = async () => ({ ok: true, json: async () => ({ data: {} }) });
  await assert.rejects(() => sendBroadcast({ apiKey: "k", audienceId: "a", from: "f", subject: "s", html: "h" }, noIdFetch), /no broadcast id/);
});
