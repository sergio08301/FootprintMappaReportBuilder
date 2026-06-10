import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getReports } from "@/lib/xano";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(ts) {
  if (!ts) return "—";
  const d = new Date(ts);
  return isNaN(d) ? "—" : d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default async function HistoryPage() {
  let reports = [];
  let error = null;

  try {
    reports = (await getReports()) ?? [];
  } catch (err) {
    error = err.message;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <a href="https://footprintmappa.com" target="_blank" rel="noreferrer">
            <img src="/logos/mappa.png" alt="Footprint Mappa" className="h-8 w-auto" />
          </a>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col px-6 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <h1 className="mb-8 text-2xl font-semibold tracking-tight">Report History</h1>

          {error ? (
            <p className="text-sm text-destructive">{error}</p>
          ) : reports.length === 0 ? (
            <p className="text-sm text-muted-foreground">No reports generated yet.</p>
          ) : (
            <div className="rounded-lg border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Company</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead>Year</TableHead>
                    <TableHead className="text-right">Products</TableHead>
                    <TableHead className="text-right">Total Emissions (kg CO2e)</TableHead>
                    <TableHead>Date Generated</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reports.map((report, i) => (
                    <TableRow key={report.id ?? i}>
                      <TableCell className="font-medium">{report.company_name ?? "—"}</TableCell>
                      <TableCell>{report.report_type ?? "—"}</TableCell>
                      <TableCell>{report.year ?? "—"}</TableCell>
                      <TableCell className="text-right">{report.products_count ?? "—"}</TableCell>
                      <TableCell className="text-right font-mono text-xs">
                        {report.total_emissions != null
                          ? parseFloat(report.total_emissions).toFixed(3)
                          : "—"}
                      </TableCell>
                      <TableCell>{formatDate(report.created_at)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </main>

      <footer className="border-t px-6 py-4 text-center text-xs text-muted-foreground">
        Confidential · Footprint Mappa · {new Date().getFullYear()}
      </footer>
    </div>
  );
}
