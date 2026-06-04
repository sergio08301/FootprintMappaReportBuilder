import { ReportUploadForm } from "@/components/ReportUploadForm";

const COLUMNS = [
  { header: "Entity", key: "entity" },
  { header: "Total Emissions", key: "total_emissions", numeric: true },
  { header: "Scope 1", key: "total_scope_1", numeric: true },
  { header: "Scope 2", key: "total_scope_2", numeric: true },
  { header: "Scope 3", key: "total_scope_3", numeric: true },
];

export default function OCFPage() {
  return (
    <ReportUploadForm
      baseTitle="Organisational Carbon Footprint Report"
      standard="ISO 14064"
      columns={COLUMNS}
    />
  );
}
