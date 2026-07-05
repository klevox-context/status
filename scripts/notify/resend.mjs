const API = "https://api.resend.com";

export async function sendBroadcast({ apiKey, audienceId, from, subject, html }, fetchImpl = fetch) {
  const headers = { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" };
  const create = await fetchImpl(`${API}/broadcasts`, {
    method: "POST", headers,
    body: JSON.stringify({ audience_id: audienceId, from, subject, html }),
  });
  if (!create.ok) throw new Error(`Resend create broadcast: ${create.status} ${await create.text()}`);
  const { id } = await create.json();
  if (!id) throw new Error("Resend create broadcast: response contained no broadcast id");
  const send = await fetchImpl(`${API}/broadcasts/${id}/send`, { method: "POST", headers, body: "{}" });
  if (!send.ok) throw new Error(`Resend send broadcast: ${send.status} ${await send.text()}`);
  return id;
}
