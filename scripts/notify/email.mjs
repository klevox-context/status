const PAGE = "https://status.aibuku.com";
const LOGO = "https://app.aibuku.com"; // hosts the wordmark at /images/aibuku-wordmark-on-{light,dark}.png

// Escape values interpolated into the email HTML. `service` comes from our .upptimerc.yml site
// names (repo-controlled), but a maintenance `title` may be hand-written by an operator when they
// open a maintenance issue — so escape defensively (also renders a legitimate `&`/`<` correctly).
const escapeHtml = (s = "") =>
  String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

// Email-safe Aibuku palette (sRGB rendering of DESIGN.md's olive OKLCH ramp) + a system font stack.
// Kept in sync by hand with og-rag `shared/src/services/email-tokens.ts`; the status page is
// standalone by design (it must not depend on the monitored app), so the brand frame is duplicated
// here rather than imported.
const C = {
  pageBg: "#f4f4f0", card: "#fbfbf9", hairline: "#e8e8e3", ink: "#0c0c09",
  body: "#474739", muted: "#5b5b4b", buttonText: "#fbfbf9",
  darkPageBg: "#141410", darkCard: "#1d1d16", darkHairline: "#33332a",
  darkInk: "#fbfbf9", darkBody: "#c9c9bd", darkMuted: "#8f8f81",
};
const FONT = "-apple-system,BlinkMacSystemFont,'Segoe UI',Inter,Roboto,Helvetica,Arial,sans-serif";

// The Aibuku brand frame — mirrors og-rag `renderEmailLayout`: wordmark masthead, hairline card,
// one olive-ink "View live status" button (bulletproof for Outlook), a muted editorial footer with
// the Resend-managed unsubscribe, a hidden preheader, and a prefers-color-scheme dark block.
const wrap = (heading, body) => `<!doctype html>
<html lang="en" style="margin:0;padding:0;">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${heading}</title>
<style>
  body{margin:0;padding:0;background:${C.pageBg};-webkit-text-size-adjust:100%;}
  .dark-only{display:none!important;}
  @media (prefers-color-scheme: dark){
    body,.page{background:${C.darkPageBg}!important;}
    .card{background:${C.darkCard}!important;border-color:${C.darkHairline}!important;}
    .heading{color:${C.darkInk}!important;}
    .body,.body p,.body span,.body strong,.body a,.body b{color:${C.darkBody}!important;}
    .foot{color:${C.darkMuted}!important;}
    .foot-brand{color:${C.darkBody}!important;}
    .btn{background:${C.darkInk}!important;color:${C.darkPageBg}!important;}
    .light-only{display:none!important;}
    .dark-only{display:inline-block!important;}
  }
</style>
</head>
<body>
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${heading}</div>
  <table role="presentation" class="page" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:${C.pageBg};">
    <tr><td align="center" style="padding:26px 16px 24px;">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;">
        <tr><td style="padding:0 2px 18px;">
          <img src="${LOGO}/images/aibuku-wordmark-on-light.png" width="96" alt="Aibuku" class="light-only" style="display:block;width:96px;height:auto;border:0;">
          <img src="${LOGO}/images/aibuku-wordmark-on-dark.png" width="96" alt="Aibuku" class="dark-only" style="display:none;width:96px;height:auto;border:0;">
        </td></tr>
        <tr><td class="card" style="background:${C.card};border:1px solid ${C.hairline};border-radius:10px;padding:26px 24px;">
          <h1 class="heading" style="margin:0 0 10px;font-family:${FONT};font-size:19px;font-weight:600;line-height:1.3;letter-spacing:-.01em;color:${C.ink};">${heading}</h1>
          <div class="body"><p style="margin:0 0 14px;font-family:${FONT};font-size:15px;line-height:1.6;color:${C.body};">${body}</p></div>
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" style="margin:4px 0 2px;">
            <tr><td align="center" bgcolor="${C.ink}" style="border-radius:8px;">
              <!--[if mso]><v:roundrect xmlns:v="urn:schemas-microsoft-com:vml" xmlns:w="urn:schemas-microsoft-com:office:word" href="${PAGE}" style="height:44px;v-text-anchor:middle;width:240px;" arcsize="18%" strokecolor="${C.ink}" fillcolor="${C.ink}"><w:anchorlock/><center style="color:${C.buttonText};font-family:${FONT};font-size:14px;font-weight:600;"><![endif]-->
              <a href="${PAGE}" class="btn" style="display:inline-block;padding:12px 22px;font-family:${FONT};font-size:14px;font-weight:600;line-height:1;color:${C.buttonText};text-decoration:none;border-radius:8px;background:${C.ink};">View live status</a>
              <!--[if mso]></center></v:roundrect><![endif]-->
            </td></tr>
          </table>
        </td></tr>
        <tr><td style="padding:16px 4px 2px;">
          <p class="foot foot-brand" style="margin:0 0 3px;font-family:${FONT};font-size:12px;line-height:1.5;color:${C.muted};">Aibuku — your agentic sales channel</p>
          <p class="foot" style="margin:0 0 3px;font-family:${FONT};font-size:12px;line-height:1.5;color:${C.muted};">You're subscribed to aibuku.com status updates.</p>
          <p class="foot" style="margin:6px 0 0;font-family:${FONT};font-size:12px;line-height:1.5;color:${C.muted};"><a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${C.muted};text-decoration:underline;">Unsubscribe</a></p>
        </td></tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

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
