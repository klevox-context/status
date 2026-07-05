// Maps a GitHub `issues` event to a notification kind. Keyed on the *labeled* event's specific
// label (so the single `status`/`maintenance` label-add de-dups against `opened` + other labels),
// and on the issue's current labels for `closed`.
const names = (issue) => (issue?.labels ?? []).map((l) => (typeof l === "string" ? l : l.name));

export function serviceFromTitle(title = "") {
  // "🛑 API is down" / "⚠️ API is degraded" / "Portal maintenance" -> "API" / "Portal maintenance"
  return title.replace(/^[^\p{L}\p{N}]+/u, "").replace(/\s+is\s+(down|degraded)\s*$/i, "").trim();
}

export function classify(event) {
  const { action, label, issue, sender } = event ?? {};
  if ((sender?.login ?? "") === "github-actions[bot]") return { kind: "ignore", reason: "bot actor" };
  const labels = names(issue);
  const isIncident = labels.includes("status");
  const isMaintenance = labels.includes("maintenance");
  if (!isIncident && !isMaintenance) return { kind: "ignore", reason: "not a status/maintenance issue" };
  const service = serviceFromTitle(issue?.title);

  if (action === "closed") {
    return { kind: isMaintenance ? "maintenance_done" : "incident_resolved", service, title: issue?.title ?? "" };
  }
  if (action === "labeled") {
    // Only the status/maintenance label-add triggers an open (de-dup); other label adds are noise.
    if (label?.name === "status") return { kind: "incident_open", service, title: issue?.title ?? "" };
    if (label?.name === "maintenance") return { kind: "maintenance", service, title: issue?.title ?? "" };
    return { kind: "ignore", reason: `label ${label?.name} not actionable` };
  }
  return { kind: "ignore", reason: `action ${action} not handled` };
}
