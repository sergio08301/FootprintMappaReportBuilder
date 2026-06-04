import { ReportUploadForm } from "@/components/ReportUploadForm";

const COLUMNS = [
  { header: "Product", key: "product" },
  { header: "Total Emissions", key: "total_emissions", numeric: true },
  { header: "Functional Unit", key: "functional_unit" },
  { header: "Materials", key: "total_materials", numeric: true },
  { header: "Manufacturing", key: "total_manufacturing", numeric: true },
  { header: "Transport", key: "total_transport", numeric: true },
  { header: "Distribution", key: "total_distribution", numeric: true },
  { header: "Use", key: "total_use", numeric: true },
  { header: "End of Life", key: "total_end_of_life", numeric: true },
];

export default function PCFPage() {
  return (
    <ReportUploadForm
      baseTitle="Products Carbon Footprint Report"
      standard="ISO 14067"
      columns={COLUMNS}
    />
  );
}
