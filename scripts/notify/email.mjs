const PAGE = "https://status.aibuku.com";

// Escape values interpolated into the email HTML. `service` comes from our .upptimerc.yml site
// names (repo-controlled), but a maintenance `title` may be hand-written by an operator when they
// open a maintenance issue — so escape defensively (also renders a legitimate `&`/`<` correctly).
const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

const wrap = (heading, body) => `
  <div style="font-family:system-ui,sans-serif;max-width:560px;margin:0 auto">
    <h2>${heading}</h2>
    <p>${body}</p>
    <p><a href="${PAGE}">View live status →</a></p>
    <hr>
    <p style="font-size:12px;color:#666">You're subscribed to aibuku.com status updates.
      <a href="{{{RESEND_UNSUBSCRIBE_URL}}}">Unsubscribe</a>.</p>
  </div>`;

export function buildEmail({ kind, service, title }) {
  const s = escapeHtml(service); // HTML-safe; subjects stay raw (plain text, not markup)
  const t = escapeHtml(title);
  switch (kind) {
    case "incident_open":
      return { subject: `[aibuku status] Investigating — ${service}`, html: wrap(`Investigating an issue with ${s}`, `We're aware of a problem affecting <b>${s}</b> and are investigating. Follow updates on our status page.`) };
    case "incident_resolved":
      return { subject: `[aibuku status] Resolved — ${service}`, html: wrap(`${s} is back to normal`, `The issue affecting <b>${s}</b> is resolved.`) };
    case "maintenance":
      return { subject: `[aibuku status] Planned maintenance — ${service}`, html: wrap(`Planned maintenance: ${t}`, `We have scheduled maintenance. Details and timing are on the status page.`) };
    case "maintenance_done":
      return { subject: `[aibuku status] Maintenance complete — ${service}`, html: wrap(`Maintenance complete: ${t}`, `The scheduled maintenance is complete.`) };
    default:
      throw new Error(`buildEmail: unknown kind ${kind}`);
  }
}
