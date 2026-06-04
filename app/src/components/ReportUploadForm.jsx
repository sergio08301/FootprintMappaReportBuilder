"use client";

import { useState } from "react";
import Link from "next/link";
import Papa from "papaparse";
import { ArrowLeft, FileDown, FileText, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const YEARS = ["2020", "2021", "2022", "2023", "2024", "2025"];

function formatCell(value, numeric) {
  if (!numeric) return value ?? "—";
  const num = parseFloat(value);
  return isNaN(num) ? "—" : `${num.toFixed(3)} kg CO2e`;
}

export function ReportUploadForm({ baseTitle, standard, columns }) {
  const [company, setCompany] = useState("");
  const [year, setYear] = useState("");
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [rows, setRows] = useState(null);

  const dynamicTitle =
    company && year ? `${baseTitle} — ${company} · ${year}` : baseTitle;

  function handleFileChange(e) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    setFileName(f?.name ?? "");
    setRows(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!file) return;
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        console.log("Parsed CSV:", results);
        setRows(results.data);
      },
      error(err) {
        console.error("CSV parse error:", err);
      },
    });
  }

  function handleGeneratePDF() {
    console.log("generate PDF");
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <div
        className="h-1.5 w-full shrink-0"
        style={{
          background:
            "linear-gradient(to right, #fdc2d8, #fca65e, #ff7983, #041282)",
        }}
      />

      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <span className="font-bold tracking-tight">Footprint Mappa</span>
          <Button asChild variant="ghost" size="sm">
            <Link href="/">
              <ArrowLeft className="size-4" />
              Back
            </Link>
          </Button>
        </div>
      </header>

      <main className="flex flex-1 flex-col items-center px-6 py-12">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mb-8">
            <p className="mb-1 font-mono text-xs font-medium text-[#16a34a]">
              {standard}
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {dynamicTitle}
            </h1>
          </div>

          <Card className="mb-8">
            <CardHeader className="border-b">
              <CardTitle className="text-base">Upload Report Data</CardTitle>
              <CardDescription>
                Fill in the details and upload your CSV to preview and generate
                the report.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">Company name</label>
                    <Input
                      type="text"
                      placeholder="e.g. Acme Corp"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-sm font-medium">
                      Reporting year
                    </label>
                    <Select value={year} onValueChange={setYear}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select year" />
                      </SelectTrigger>
                      <SelectContent>
                        {YEARS.map((y) => (
                          <SelectItem key={y} value={y}>
                            {y}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-medium">CSV file</label>
                  <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-input bg-muted/30 px-6 py-8 text-sm text-muted-foreground transition-colors hover:bg-muted/50">
                    <FileText className="size-7 text-muted-foreground/50" />
                    {fileName ? (
                      <span className="font-medium text-foreground">
                        {fileName}
                      </span>
                    ) : (
                      <>
                        <span>Click to select a CSV file</span>
                        <span className="text-xs">or drag and drop</span>
                      </>
                    )}
                    <input
                      type="file"
                      accept=".csv"
                      className="sr-only"
                      onChange={handleFileChange}
                    />
                  </label>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-[#16a34a] text-white hover:bg-[#15803d]"
                  disabled={!company || !year || !file}
                >
                  <Upload className="size-4" />
                  Preview Data
                </Button>
              </form>
            </CardContent>
          </Card>

          {rows && rows.length > 0 && (
            <div className="flex flex-col gap-4">
              <Card>
                <CardHeader className="border-b">
                  <CardTitle className="text-base">Data Preview</CardTitle>
                  <CardDescription>
                    {rows.length} row{rows.length !== 1 ? "s" : ""} parsed from{" "}
                    {fileName}
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-0">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columns.map((col) => (
                          <TableHead
                            key={col.key}
                            className={col.numeric ? "text-right" : ""}
                          >
                            {col.header}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rows.map((row, i) => (
                        <TableRow key={i}>
                          {columns.map((col) => (
                            <TableCell
                              key={col.key}
                              className={
                                col.numeric
                                  ? "text-right font-mono text-xs"
                                  : ""
                              }
                            >
                              {formatCell(row[col.key], col.numeric)}
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="flex justify-end">
                <Button
                  onClick={handleGeneratePDF}
                  className="bg-[#16a34a] text-white hover:bg-[#15803d]"
                >
                  <FileDown className="size-4" />
                  Generate PDF
                </Button>
              </div>
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
