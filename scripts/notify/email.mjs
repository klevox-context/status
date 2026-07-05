const PAGE = "https://status.aibuku.com";
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
  switch (kind) {
    case "incident_open":
      return { subject: `[aibuku status] Investigating — ${service}`, html: wrap(`Investigating an issue with ${service}`, `We're aware of a problem affecting <b>${service}</b> and are investigating. Follow updates on our status page.`) };
    case "incident_resolved":
      return { subject: `[aibuku status] Resolved — ${service}`, html: wrap(`${service} is back to normal`, `The issue affecting <b>${service}</b> is resolved.`) };
    case "maintenance":
      return { subject: `[aibuku status] Planned maintenance — ${service}`, html: wrap(`Planned maintenance: ${title}`, `We have scheduled maintenance. Details and timing are on the status page.`) };
    case "maintenance_done":
      return { subject: `[aibuku status] Maintenance complete — ${service}`, html: wrap(`Maintenance complete: ${title}`, `The scheduled maintenance is complete.`) };
    default:
      throw new Error(`buildEmail: unknown kind ${kind}`);
  }
}
