"use client";

import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

// ── Constants ─────────────────────────────────────────────────────────────────
const LOGO = "/FMAPPA.png";

// Split generated text on blank lines and render each paragraph separately.
function renderParagraphs(text, style) {
  if (!text) return null;
  return text
    .split(/\n\n+/)
    .map((p) => p.trim())
    .filter(Boolean)
    .map((p, i) => (
      <Text key={i} style={style}>
        {p}
      </Text>
    ));
}

const PHASE_COLS = [
  { label: "Materials\n(kg CO2e)",     key: "total_materials" },
  { label: "Mfg.\n(kg CO2e)",          key: "total_manufacturing" },
  { label: "Transport\n(kg CO2e)",     key: "total_transport" },
  { label: "Distribution\n(kg CO2e)", key: "total_distribution" },
  { label: "Use\n(kg CO2e)",           key: "total_use" },
  { label: "End of Life\n(kg CO2e)",   key: "total_end_of_life" },
];

function fmt(val) {
  const n = parseFloat(val);
  return isNaN(n) ? "—" : n.toFixed(3);
}

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // ── Cover (page 1) ──────────────────────────────────────────────────────────
  // No header, no footer. All content vertically and horizontally centred.
  coverPage: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 34,
    color: "#000000",
    textAlign: "center",
    lineHeight: 1.3,
  },
  coverLogo: {
    width: 160,
    marginTop: 32,
  },

  // ── All subsequent pages ─────────────────────────────────────────────────────
  page: {
    backgroundColor: "#ffffff",
    fontFamily: "Helvetica",
  },
  // Logo top-right; `fixed` repeats it on overflow pages automatically.
  headerLogo: {
    position: "absolute",
    top: 24,
    right: 60,
    width: 72,
  },
  // Content starts below the header logo.
  contentWrap: {
    flex: 1,
    paddingHorizontal: 60,
    paddingTop: 72,
    paddingBottom: 40,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 16,
    color: "#000000",
    marginBottom: 14,
  },
  paragraph: {
    fontSize: 10,
    color: "#333333",
    lineHeight: 1.7,
    marginBottom: 10,
  },

  // ── Results table (landscape, usable ~722pt) ────────────────────────────────
  // cProd(120) + cTotal(85) + 6×cPhase(86) = 721pt
  tHead: { flexDirection: "row", backgroundColor: "#041282" },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tRowOdd: { backgroundColor: "#f8f8f8" },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 7.5,
    color: "#ffffff",
    padding: 6,
    lineHeight: 1.4,
  },
  td:  { fontSize: 8, color: "#111111", padding: 6 },
  tdR: { fontSize: 8, color: "#111111", padding: 6, textAlign: "right" },
  cProd:  { width: 120 },
  cTotal: { width: 85 },
  cPhase: { width: 86 },

  // ── Scope section tables (portrait, usable 595.28−120 = ~475pt) ─────────────
  scopeTableWrap: { marginTop: 20, marginBottom: 16 },
  scopeTableLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: "#555555",
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sHead: { flexDirection: "row", backgroundColor: "#041282" },
  sRow:  { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  sRowAlt:      { backgroundColor: "#f8f8f8" },
  sRowInactive: { backgroundColor: "#f3f4f6" },
  sTh: { fontFamily: "Helvetica-Bold", fontSize: 8, color: "#ffffff", padding: 6 },
  sTd: { fontSize: 8, color: "#111111", padding: 6 },
  sTdInactive: { fontSize: 8, color: "#b0b7c3", padding: 6 },
  // column widths for location table
  colLocation: { width: 140 },
  colProducts: { flex: 1 },
  // column widths for lifecycle table
  colPhase: { width: 160 },
  colSubs:  { flex: 1 },
});

// ── Scope section: products summary table ────────────────────────────────────
function ProductsTable({ scopeData }) {
  const { groups, hasLocations } = scopeData;

  if (hasLocations) {
    const locationKeys = Object.keys(groups).filter((k) => k !== "__none__");
    const noLocProducts = groups.__none__ ?? [];
    const rows = [
      ...locationKeys.map((loc) => ({ label: loc, products: groups[loc] })),
      ...(noLocProducts.length > 0
        ? [{ label: "Not specified", products: noLocProducts }]
        : []),
    ];
    return (
      <View style={S.scopeTableWrap}>
        <Text style={S.scopeTableLabel}>Products by Manufacturing Location</Text>
        <View style={S.sHead}>
          <View style={S.colLocation}><Text style={S.sTh}>Location</Text></View>
          <View style={S.colProducts}><Text style={S.sTh}>Products</Text></View>
        </View>
        {rows.map(({ label, products }, i) => (
          <View key={label} style={[S.sRow, i % 2 !== 0 && S.sRowAlt]} wrap={false}>
            <View style={S.colLocation}>
              <Text style={S.sTd}>{label}</Text>
            </View>
            <View style={S.colProducts}>
              <Text style={S.sTd}>{products.map((p) => p.parsedProduct).join(", ")}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  // No locations — single-column list
  const allProducts = Object.values(groups).flat();
  return (
    <View style={S.scopeTableWrap}>
      <Text style={S.scopeTableLabel}>Products Assessed</Text>
      <View style={S.sHead}>
        <View style={{ flex: 1 }}><Text style={S.sTh}>Product</Text></View>
      </View>
      {allProducts.map((p, i) => (
        <View key={i} style={[S.sRow, i % 2 !== 0 && S.sRowAlt]} wrap={false}>
          <View style={{ flex: 1 }}>
            <Text style={S.sTd}>{p.parsedProduct}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── Scope section: ISO 14067 lifecycle stages table ───────────────────────────
function LifecycleStagesTable({ scopeData }) {
  const { lifecycleStages, activePhases } = scopeData;
  return (
    <View style={S.scopeTableWrap}>
      <Text style={S.scopeTableLabel}>Lifecycle Stages — ISO 14067</Text>
      <View style={S.sHead}>
        <View style={S.colPhase}><Text style={S.sTh}>Phase</Text></View>
        <View style={S.colSubs}><Text style={S.sTh}>Subcategories</Text></View>
      </View>
      {lifecycleStages.map((stage, i) => {
        const active = activePhases[stage.key];
        return (
          <View
            key={stage.key}
            style={[S.sRow, i % 2 !== 0 && S.sRowAlt, !active && S.sRowInactive]}
            wrap={false}
          >
            <View style={S.colPhase}>
              <Text style={active ? S.sTd : S.sTdInactive}>{stage.phase}</Text>
            </View>
            <View style={S.colSubs}>
              <Text style={active ? S.sTd : S.sTdInactive}>
                {stage.subcategories.join("  ·  ")}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Shared header (pages 2 +) ─────────────────────────────────────────────────
function PageHeader() {
  return <Image fixed src={LOGO} style={S.headerLogo} alt="" />;
}

// ── Section page helper ───────────────────────────────────────────────────────
function SectionPage({ title, children }) {
  return (
    <Page size="A4" style={S.page}>
      <PageHeader />
      <View style={S.contentWrap}>
        <Text style={S.sectionTitle}>{title}</Text>
        {children}
      </View>
    </Page>
  );
}

// ── Document ──────────────────────────────────────────────────────────────────
export function PCFReport({ data, companyName, year, introText, methodText, scopeText, scopeData }) {
  return (
    <Document
      title={`Products Carbon Footprint Report ${year} — ${companyName}`}
      author="Footprint Mappa"
    >
      {/* ── Page 1: Cover ── */}
      <Page size="A4" style={S.coverPage}>
        <Text style={S.coverTitle}>
          {`Products Carbon Footprint Report ${year} ${companyName}`}
        </Text>
        <Image src={LOGO} style={S.coverLogo} alt="Footprint Mappa" />
      </Page>

      {/* ── Page 2: Introduction ── */}
      <SectionPage title="1. Introduction">
        {renderParagraphs(introText, S.paragraph)}
      </SectionPage>

      {/* ── Page 3: Methodological Approach ── */}
      <SectionPage title="2. Methodological Approach">
        {renderParagraphs(methodText, S.paragraph)}
      </SectionPage>

      {/* ── Page 4: Scope and Boundaries ── */}
      <SectionPage title="3. Scope and Boundaries">
        {renderParagraphs(scopeText, S.paragraph)}
        {scopeData && <ProductsTable scopeData={scopeData} />}
        {scopeData && <LifecycleStagesTable scopeData={scopeData} />}
      </SectionPage>

      {/* ── Page 5: Results (landscape) ── */}
      <Page size="A4" orientation="landscape" style={S.page}>
        <PageHeader />
        <View style={S.contentWrap}>
          <Text style={S.sectionTitle}>Results</Text>

          {/* Header row — fixed so it repeats if the table overflows to more pages */}
          <View style={S.tHead} fixed>
            <View style={S.cProd}>
              <Text style={S.th}>Product</Text>
            </View>
            <View style={S.cTotal}>
              <Text style={S.th}>{"Total Emissions\n(kg CO2e)"}</Text>
            </View>
            {PHASE_COLS.map((c) => (
              <View key={c.key} style={S.cPhase}>
                <Text style={S.th}>{c.label}</Text>
              </View>
            ))}
          </View>

          {/* Data rows */}
          {data.map((row, i) => (
            <View
              key={i}
              style={[S.tRow, i % 2 !== 0 && S.tRowOdd]}
              wrap={false}
            >
              <View style={S.cProd}>
                <Text style={S.td}>{row.product ?? "—"}</Text>
              </View>
              <View style={S.cTotal}>
                <Text style={S.tdR}>{fmt(row.total_emissions)}</Text>
              </View>
              {PHASE_COLS.map((c) => (
                <View key={c.key} style={S.cPhase}>
                  <Text style={S.tdR}>{fmt(row[c.key])}</Text>
                </View>
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
