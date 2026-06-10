const BASE = process.env.NEXT_PUBLIC_XANO_API_URL;

export async function saveReport(reportData) {
  const res = await fetch(`${BASE}/reports`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(reportData),
  });
  if (!res.ok) throw new Error(`Xano saveReport failed: ${res.statusText}`);
  return res.json();
}

export async function getReports() {
  const res = await fetch(`${BASE}/reports`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Xano getReports failed: ${res.statusText}`);
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}
