"use client";

import {
  Document,
  Image,
  Page,
  Path,
  Rect,
  StyleSheet,
  Svg,
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

// ── Design tokens ─────────────────────────────────────────────────────────────
const C = {
  primary: "#1a2f5e",
  body:    "#2d2d2d",
  rowAlt:  "#f7f7f7",
  white:   "#ffffff",
};

// ── Styles ────────────────────────────────────────────────────────────────────
const S = StyleSheet.create({
  // ── Cover (page 1) ──────────────────────────────────────────────────────────
  coverPage: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 60,
  },
  coverTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 34,
    color: C.primary,
    textAlign: "center",
    lineHeight: 1.3,
  },
  coverLogo: {
    width: 160,
    marginTop: 32,
  },
  coverLogoItem: {
    width: 120,
  },

  // ── All subsequent pages ─────────────────────────────────────────────────────
  page: {
    backgroundColor: C.white,
    fontFamily: "Helvetica",
    paddingTop: 96,
    paddingHorizontal: 60,
    paddingBottom: 40,
  },
  headerLogo: {
    position: "absolute",
    top: 24,
    right: 60,
    width: 72,
  },
  headerLogoLeft: {
    position: "absolute",
    top: 24,
    left: 60,
    width: 72,
  },
  contentWrap: {
    flex: 1,
  },
  sectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 14,
    color: C.primary,
    marginBottom: 14,
  },
  subsectionTitle: {
    fontFamily: "Helvetica-Bold",
    fontSize: 11,
    color: C.primary,
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 9,
    color: C.body,
    lineHeight: 1.7,
    marginBottom: 10,
  },
  bold: { fontFamily: "Helvetica-Bold" },
  bulletRow: { flexDirection: "row", marginBottom: 4 },
  bulletDot: { fontSize: 9, color: C.body, width: 12 },
  bulletText: { flex: 1, fontSize: 9, color: C.body, lineHeight: 1.6 },

  // ── Results table ───────────────────────────────────────────────────────────
  tHead: { flexDirection: "row", backgroundColor: C.primary },
  tRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#e5e7eb",
  },
  tRowOdd: { backgroundColor: C.rowAlt },
  th: {
    fontFamily: "Helvetica-Bold",
    fontSize: 9,
    color: C.white,
    padding: 6,
    lineHeight: 1.4,
  },
  td:  { fontSize: 8, color: C.body, padding: 6 },
  tdR: { fontSize: 8, color: C.body, padding: 6, textAlign: "right" },
  cProd:  { width: 120 },
  cTotal: { width: 85 },
  cPhase: { width: 86 },

  // ── Scope section tables ─────────────────────────────────────────────────────
  scopeTableWrap: { marginTop: 20, marginBottom: 16 },
  scopeTableLabel: {
    fontFamily: "Helvetica-Bold",
    fontSize: 8,
    color: C.body,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.6,
  },
  sHead: { flexDirection: "row", backgroundColor: C.primary },
  sRow:  { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: "#e5e7eb" },
  sRowAlt:      { backgroundColor: C.rowAlt },
  sRowInactive: { backgroundColor: "#f3f4f6" },
  sTh: { fontFamily: "Helvetica-Bold", fontSize: 9, color: C.white, padding: 6 },
  sTd: { fontSize: 8, color: C.body, padding: 6 },
  sTdInactive: { fontSize: 8, color: "#b0b7c3", padding: 6 },
  scopeTableNote: {
    fontFamily: "Helvetica-Oblique",
    fontSize: 7.5,
    color: "#888888",
    marginTop: 5,
  },
  colLocation: { width: 140 },
  colProducts: { flex: 1 },
  colPhase: { width: 160 },
  colSubs:  { flex: 1 },
});

// Logos shown at the bottom of the Methodological Approach page.
const METHOD_LOGOS = [
  { src: "/logos/defra.png",        label: "DEFRA" },
  { src: "/logos/iea.png",          label: "IEA" },
  { src: "/logos/ghg-protocol.png", label: "GHG Protocol" },
  { src: "/logos/occc.png",         label: "OCCC" },
  { src: "/logos/exiobase.png",     label: "EXIOBASE" },
  { src: "/logos/iso-14067.png",    label: "ISO 14067" },
];

// Ordered list of lifecycle phases used in both the diagram and the table.
const LIFECYCLE_PHASES = [
  { label: "Material\nAcquisition", key: "total_materials",     color: "#e8f5e9" },
  { label: "Manufacturing",         key: "total_manufacturing", color: "#fffde7" },
  { label: "Transportation",        key: "total_transport",     color: "#e3f2fd" },
  { label: "Distribution",          key: "total_distribution",  color: "#fce4ec" },
  { label: "Use",                   key: "total_use",           color: "#fff3e0" },
  { label: "End-of-life",           key: "total_end_of_life",   color: "#f3e5f5" },
];

// Vibrant hex colours used in SVG charts (more saturated than the table pastels).
const CHART_PHASES = [
  { key: "total_materials",     label: "Material Acquisition", color: "#4ade80" },
  { key: "total_manufacturing", label: "Manufacturing",        color: "#facc15" },
  { key: "total_transport",     label: "Transportation",       color: "#60a5fa" },
  { key: "total_distribution",  label: "Distribution",         color: "#f9a8d4" },
  { key: "total_use",           label: "Use",                  color: "#fb923c" },
  { key: "total_end_of_life",   label: "End-of-life",          color: "#c084fc" },
];

// Default phase colours. Phases where ALL products have zero / null data are
// overridden to #f5f5f5 grey at render time using the raw CSV rows.
const PHASE_COLORS = {
  total_materials:    "#e8f5e9",
  total_manufacturing:"#fffde7",
  total_transport:    "#e3f2fd",
  total_distribution: "#fce4ec",
  total_use:          "#fff3e0",
  total_end_of_life:  "#f3e5f5",
};

// ── Scope section: products summary table ────────────────────────────────────
// Centred, 60% of content width (475pt × 0.6 ≈ 285pt).
const PRODUCTS_TABLE_WIDTH = 285;

function ProductsTable({ scopeData }) {
  const { groups, hasLocations } = scopeData;
  const wrapStyle = [S.scopeTableWrap, { width: PRODUCTS_TABLE_WIDTH, alignSelf: "center" }];

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
      <View style={wrapStyle}>
        <View style={S.sHead}>
          <View style={{ width: 100 }}><Text style={S.sTh}>Location</Text></View>
          <View style={{ flex: 1 }}><Text style={S.sTh}>Products</Text></View>
        </View>
        {rows.map(({ label, products }, i) => (
          <View key={label} style={[S.sRow, i % 2 !== 0 && S.sRowAlt]} wrap={false}>
            <View style={{ width: 100 }}>
              <Text style={S.sTd}>{label}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={S.sTd}>{products.map((p) => p.parsedProduct).join(", ")}</Text>
            </View>
          </View>
        ))}
      </View>
    );
  }

  const allProducts = Object.values(groups).flat();
  return (
    <View style={wrapStyle}>
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
// One row per subcategory. Phase name appears only on the first row of each
// group; subsequent rows leave that cell empty (merged-cell visual).
// Border is suppressed within a phase group and shown only between phases.
// Greys a phase when every product row has zero or null for that phase's column.
function LifecycleStagesTable({ scopeData, data }) {
  const { lifecycleStages } = scopeData;

  function isAllZero(key) {
    return data.every((row) => {
      const v = parseFloat(row[key]);
      return isNaN(v) || v === 0;
    });
  }

  const anyGreyed = lifecycleStages.some((s) => isAllZero(s.key));

  return (
    <View style={S.scopeTableWrap}>
      {lifecycleStages.flatMap((stage) => {
        const grey = isAllZero(stage.key);
        const bg = grey ? "#f5f5f5" : PHASE_COLORS[stage.key];
        return stage.subcategories.map((sub, subIdx) => {
          const isLastSub = subIdx === stage.subcategories.length - 1;
          return (
            <View
              key={`${stage.key}-${subIdx}`}
              style={[
                S.sRow,
                { backgroundColor: bg },
                !isLastSub && { borderBottomWidth: 0 },
              ]}
              wrap={false}
            >
              <View style={S.colPhase}>
                <Text style={grey ? S.sTdInactive : S.sTd}>
                  {subIdx === 0 ? stage.phase : ""}
                </Text>
              </View>
              <View style={S.colSubs}>
                <Text style={grey ? S.sTdInactive : S.sTd}>{sub}</Text>
              </View>
            </View>
          );
        });
      })}
      {anyGreyed && (
        <Text style={S.scopeTableNote}>
          Greyed phases indicate no data available for the assessed products.
        </Text>
      )}
    </View>
  );
}

// ── Lifecycle phase diagram (product subsection pages) ────────────────────────
// Renders 6 phase boxes in two rows of 3. Boxes whose phase is entirely zero
// across all supplied variant rows are shown in grey.
function LifecycleDiagram({ variants }) {
  function isAllZero(key) {
    return variants.every((v) => {
      const val = parseFloat(v[key]);
      return isNaN(val) || val === 0;
    });
  }

  return (
    <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 14, marginBottom: 14 }}>
      {LIFECYCLE_PHASES.map((phase) => {
        const inactive = isAllZero(phase.key);
        return (
          <View key={phase.key} style={{ width: "33%", padding: 4 }}>
            <View
              style={{
                backgroundColor: inactive ? "#f5f5f5" : phase.color,
                borderRadius: 6,
                borderWidth: 0.75,
                borderColor: inactive ? "#e0e0e0" : "#cccccc",
                paddingVertical: 12,
                paddingHorizontal: 6,
                alignItems: "center",
                justifyContent: "center",
                minHeight: 52,
              }}
            >
              <Text
                style={{
                  fontSize: 8,
                  color: inactive ? "#b0b7c3" : C.body,
                  textAlign: "center",
                  lineHeight: 1.5,
                }}
              >
                {phase.label}
              </Text>
            </View>
          </View>
        );
      })}
    </View>
  );
}

// ── Section 4 variant comparison table ───────────────────────────────────────
// Shows each location variant in its own row, with per-phase values.
// Phase data cells are coloured with the phase's background colour.
// Portrait content width ≈ 475pt: loc(75) + 6×phase(50) + total(55) = 430pt.
function VariantComparisonTable({ variants }) {
  const cLoc = 75, cPhase = 50, cTotal = 55;
  return (
    <View wrap={false} style={[S.scopeTableWrap, { marginTop: 8 }]}>
      <View style={S.sHead}>
        <View style={{ width: cLoc }}>
          <Text style={S.sTh}>Location</Text>
        </View>
        {LIFECYCLE_PHASES.map((ph) => (
          <View key={ph.key} style={{ width: cPhase }}>
            <Text style={S.sTh}>{ph.label.replace("\n", " ")}</Text>
          </View>
        ))}
        <View style={{ width: cTotal }}>
          <Text style={[S.sTh, { textAlign: "right" }]}>Total</Text>
        </View>
      </View>
      {variants.map((v, ri) => (
        <View key={ri} style={S.sRow} wrap={false}>
          <View style={{ width: cLoc }}>
            <Text style={S.sTd}>{v.parsedLocation ?? v.parsedProduct}</Text>
          </View>
          {LIFECYCLE_PHASES.map((ph) => (
            <View key={ph.key} style={{ width: cPhase, backgroundColor: ph.color }}>
              <Text style={[S.sTd, { textAlign: "right" }]}>{fmt(v[ph.key])}</Text>
            </View>
          ))}
          <View style={{ width: cTotal }}>
            <Text style={[S.sTd, { textAlign: "right", fontFamily: "Helvetica-Bold", color: C.primary }]}>
              {fmt(v.total_emissions)}
            </Text>
          </View>
        </View>
      ))}
    </View>
  );
}

// ── SVG donut chart ───────────────────────────────────────────────────────────

function polarToCartesian(cx, cy, r, deg) {
  const rad = ((deg - 90) * Math.PI) / 180;
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
}

function donutSlicePath(cx, cy, outerR, innerR, startDeg, endDeg) {
  // Clamp to 359.999° to avoid SVG arc degeneracy on a full circle
  const sweep = Math.min(endDeg - startDeg, 359.999);
  const end = startDeg + sweep;
  const large = sweep > 180 ? 1 : 0;
  const o1 = polarToCartesian(cx, cy, outerR, startDeg);
  const o2 = polarToCartesian(cx, cy, outerR, end);
  const i1 = polarToCartesian(cx, cy, innerR, end);
  const i2 = polarToCartesian(cx, cy, innerR, startDeg);
  return [
    `M ${o1.x.toFixed(3)} ${o1.y.toFixed(3)}`,
    `A ${outerR} ${outerR} 0 ${large} 1 ${o2.x.toFixed(3)} ${o2.y.toFixed(3)}`,
    `L ${i1.x.toFixed(3)} ${i1.y.toFixed(3)}`,
    `A ${innerR} ${innerR} 0 ${large} 0 ${i2.x.toFixed(3)} ${i2.y.toFixed(3)}`,
    "Z",
  ].join(" ");
}

function DonutChartPDF({ variants }) {
  const phaseData = CHART_PHASES.map((ph) => ({
    ...ph,
    value: variants.reduce((s, v) => s + (parseFloat(v[ph.key]) || 0), 0) / variants.length,
  }));
  const total = phaseData.reduce((s, p) => s + p.value, 0);

  let cursor = 0;
  const slices =
    total > 0
      ? phaseData
          .filter((p) => p.value > 0)
          .map((p) => {
            const sweep = (p.value / total) * 360;
            const s = { ...p, start: cursor, end: cursor + sweep };
            cursor += sweep;
            return s;
          })
      : [{ color: "#e5e7eb", start: 0, end: 359.999 }];

  const size = 140, cx = 70, cy = 70, outerR = 58, innerR = 32;

  return (
    <View wrap={false} style={{ flexDirection: "row", alignItems: "center", marginTop: 10, marginBottom: 8 }}>
      {/* Donut SVG with center label overlaid */}
      <View style={{ width: size, height: size }}>
        <Svg width={size} height={size}>
          {slices.map((s, i) => (
            <Path
              key={i}
              d={donutSlicePath(cx, cy, outerR, innerR, s.start, s.end)}
              fill={s.color}
            />
          ))}
        </Svg>
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ fontSize: 9, fontFamily: "Helvetica-Bold", color: C.primary, textAlign: "center" }}>
            {total.toFixed(1)}
          </Text>
          <Text style={{ fontSize: 6, color: C.body, textAlign: "center" }}>kg CO2e</Text>
        </View>
      </View>

      {/* Legend: coloured swatch + name + value + percentage */}
      <View style={{ flex: 1, marginLeft: 14 }}>
        {phaseData.map((p, i) => {
          const pct = total > 0 ? ((p.value / total) * 100).toFixed(1) : "0.0";
          return (
            <View key={i} style={{ flexDirection: "row", alignItems: "center", marginBottom: 5 }}>
              <View style={{ width: 8, height: 8, backgroundColor: p.color, marginRight: 6, flexShrink: 0 }} />
              <Text style={{ fontSize: 7, color: C.body, flex: 1 }}>
                <Text style={{ fontFamily: "Helvetica-Bold" }}>{p.label}</Text>
                {`: ${p.value.toFixed(3)} kg CO2e (${pct}%)`}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

// ── SVG bar chart (variant comparison) ───────────────────────────────────────

function BarChartPDF({ variants }) {
  const data = variants.map((v) => ({
    label: v.parsedLocation ?? v.parsedProduct,
    value: parseFloat(v.total_emissions) || 0,
  }));
  const maxVal = Math.max(...data.map((d) => d.value), 0.001);

  const barW = 44, gap = 18, barAreaH = 80, leftPad = 8, topPad = 14;
  const svgW = leftPad * 2 + data.length * barW + (data.length - 1) * gap;
  const svgH = barAreaH + topPad;

  return (
    <View wrap={false} style={{ marginTop: 8, alignItems: "center" }}>
      <Svg width={svgW} height={svgH}>
        {data.map((d, i) => {
          const barH = Math.max((d.value / maxVal) * barAreaH, 1);
          const x = leftPad + i * (barW + gap);
          const y = topPad + barAreaH - barH;
          return <Rect key={i} x={x} y={y} width={barW} height={barH} fill={C.primary} />;
        })}
      </Svg>
      {/* Labels centred below each bar */}
      <View style={{ flexDirection: "row", paddingLeft: leftPad }}>
        {data.map((d, i) => (
          <View
            key={i}
            style={{ width: barW, marginRight: i < data.length - 1 ? gap : 0, alignItems: "center" }}
          >
            <Text style={{ fontSize: 7, color: C.body, textAlign: "center" }}>{d.label}</Text>
            <Text style={{ fontSize: 7, color: C.primary, fontFamily: "Helvetica-Bold", textAlign: "center" }}>
              {d.value.toFixed(2)}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}

// ── Product subsection grouping ───────────────────────────────────────────────
// Groups all CSV rows by parsed base product name so that rows with the same
// name but different locations are treated as variants of one product.
function groupByProductName(scopeData) {
  const { groups } = scopeData;
  const byName = {};
  for (const products of Object.values(groups)) {
    for (const p of products) {
      if (!byName[p.parsedProduct]) byName[p.parsedProduct] = [];
      byName[p.parsedProduct].push(p);
    }
  }
  return Object.entries(byName).map(([name, variants]) => ({ name, variants }));
}

// ── Document ──────────────────────────────────────────────────────────────────
export function PCFReport({ data, companyName, year, introText, methodText, scopeText, scopeData, companyLogo, productImages = {}, strategicRecs = [] }) {
  const productGroups = scopeData ? groupByProductName(scopeData) : [];

  // Defined inside PCFReport so both helpers close over `companyLogo` without
  // requiring prop-threading through every SectionPage / PageHeader call site.
  function PageHeader() {
    if (companyLogo) {
      return (
        <>
          <Image fixed src={companyLogo} style={S.headerLogoLeft} alt="" />
          <Image fixed src={LOGO} style={S.headerLogo} alt="" />
        </>
      );
    }
    return <Image fixed src={LOGO} style={S.headerLogo} alt="" />;
  }

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
        {companyLogo ? (
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              marginTop: 32,
              gap: 48,
            }}
          >
            <Image src={companyLogo} style={S.coverLogoItem} alt="Company logo" />
            <Image src={LOGO} style={S.coverLogoItem} alt="Footprint Mappa" />
          </View>
        ) : (
          <Image src={LOGO} style={S.coverLogo} alt="Footprint Mappa" />
        )}
      </Page>

      {/* ── Page 2: Introduction ── */}
      <SectionPage title="1. Introduction">
        {renderParagraphs(introText, S.paragraph)}
      </SectionPage>

      {/* ── Page 3: Methodological Approach ── */}
      <SectionPage title="2. Methodological Approach">
        {renderParagraphs(methodText, S.paragraph)}

        {/* 3×2 logo grid */}
        <View style={{ flexDirection: "row", flexWrap: "wrap", marginTop: 24 }}>
          {METHOD_LOGOS.map((logo) => (
            <View
              key={logo.src}
              style={{
                width: "33.33%",
                alignItems: "center",
                paddingVertical: 12,
                paddingHorizontal: 10,
              }}
            >
              <Image
                src={logo.src}
                style={{ width: 80, height: 50, objectFit: "contain" }}
              />
            </View>
          ))}
        </View>
      </SectionPage>

      {/* ── Page 4: Scope and Boundaries ── */}
      <SectionPage title="3. Scope and Boundaries">
        {/* 1 — Dynamic paragraph from API */}
        {renderParagraphs(scopeText, S.paragraph)}

        {/* 2 — Products table grouped by location */}
        {scopeData && <ProductsTable scopeData={scopeData} />}

        {/* 3 — Hardcoded lifecycle boundary bullet points */}
        <Text style={S.paragraph}>
          The boundaries defined for this PCF study include the following life-cycle stages:
        </Text>
        <View style={{ marginBottom: 10 }}>
          <View style={S.bulletRow}>
            <Text style={S.bulletDot}>{"• "}</Text>
            <Text style={S.bulletText}>
              <Text style={S.bold}>Raw material and packaging acquisition:</Text>
              {" polymers, fibres, resins and all material components."}
            </Text>
          </View>
          <View style={S.bulletRow}>
            <Text style={S.bulletDot}>{"• "}</Text>
            <Text style={S.bulletText}>
              <Text style={S.bold}>Upstream transportation:</Text>
              {" delivery of materials, packagings and consumables to production sites."}
            </Text>
          </View>
          <View style={S.bulletRow}>
            <Text style={S.bulletDot}>{"• "}</Text>
            <Text style={S.bulletText}>
              <Text style={S.bold}>Energy and consumables used for manufacturing processes:</Text>
              {" including thermal, mechanical and chemical operations."}
            </Text>
          </View>
          <View style={S.bulletRow}>
            <Text style={S.bulletDot}>{"• "}</Text>
            <Text style={S.bulletText}>
              <Text style={S.bold}>Waste generated during manufacturing:</Text>
              {" treatment and final disposal of production scraps."}
            </Text>
          </View>
          <View style={S.bulletRow}>
            <Text style={S.bulletDot}>{"• "}</Text>
            <Text style={S.bulletText}>
              Downstream transportation of waste to adequate manager.
            </Text>
          </View>
        </View>

        {/* 4 — Lifecycle stages table with phase colours */}
        {scopeData && <LifecycleStagesTable scopeData={scopeData} data={data} />}
      </SectionPage>

      {/* ── Product subsections (3.1, 3.2, …) — single page, no forced breaks ── */}
      {productGroups.length > 0 && (
        <Page size="A4" style={S.page}>
          <PageHeader />
          <View style={S.contentWrap}>
            {productGroups.map(({ name, variants }, idx) => {
              const num = `3.${idx + 1}`;
              const isMulti = variants.length > 1;
              const singleLoc = !isMulti ? variants[0]?.parsedLocation : null;
              // First image found among this product's variants (keyed by raw CSV product name)
              const productImg = variants.reduce(
                (img, v) => img || productImages[v.product] || null,
                null
              );
              return (
                <View key={num} wrap={false}>
                  <Text style={S.subsectionTitle}>{`${num} ${name}`}</Text>

                  {/* Intro text left, optional product image right */}
                  <View style={{ flexDirection: "row", gap: 12 }}>
                    <View style={{ flex: 1 }}>
                      <Text style={S.paragraph}>
                        {`This section presents the production route and carbon footprint results for ${name}.`}
                      </Text>
                      {singleLoc && (
                        <Text style={S.paragraph}>
                          {`The assessed scenario corresponds to manufacturing at ${singleLoc}.`}
                        </Text>
                      )}
                      {isMulti &&
                        variants.map((v, vi) => (
                          <Text key={vi} style={S.paragraph}>
                            {v.parsedLocation
                              ? `The assessed scenario for ${name} (${v.parsedLocation}) corresponds to manufacturing at ${v.parsedLocation}.`
                              : `The ${name} variant has no specified manufacturing location.`}
                          </Text>
                        ))}
                    </View>
                    {productImg && (
                      <Image src={productImg} style={{ width: 80, height: 80 }} />
                    )}
                  </View>

                  <LifecycleDiagram variants={variants} />
                </View>
              );
            })}
          </View>
        </Page>
      )}

      {/* ── Section 4: Results — per-product detail ── */}
      {productGroups.length > 0 && (
        <Page size="A4" style={S.page}>
          <PageHeader />
          <View style={S.contentWrap}>
            <Text style={S.sectionTitle}>4. Results</Text>
            {productGroups.map(({ name, variants }, idx) => {
              const num = `4.${idx + 1}`;
              const isMulti = variants.length > 1;
              const totals = variants.map((v) => parseFloat(v.total_emissions) || 0);
              const minTotal = Math.min(...totals);
              const maxTotal = Math.max(...totals);

              // Phase averages used for dominant-phase summary sentence
              const phaseAvgs = CHART_PHASES.map((ph) => ({
                label: ph.label,
                value:
                  variants.reduce((s, v) => s + (parseFloat(v[ph.key]) || 0), 0) /
                  variants.length,
              }));
              const totalAvg = phaseAvgs.reduce((s, p) => s + p.value, 0);
              const dominant = phaseAvgs.reduce(
                (mx, p) => (p.value > mx.value ? p : mx),
                phaseAvgs[0]
              );
              const domPct =
                totalAvg > 0
                  ? ((dominant.value / totalAvg) * 100).toFixed(1)
                  : "0.0";

              return (
                <View key={num} wrap={false}>
                  <Text style={S.subsectionTitle}>{`${num} ${name}`}</Text>

                  {/* 1 — Intro paragraph */}
                  <Text style={S.paragraph}>
                    {isMulti
                      ? `The ${name} product group presents a total carbon footprint ranging from ${minTotal.toFixed(3)} kg CO2e to ${maxTotal.toFixed(3)} kg CO2e across the assessed manufacturing locations.`
                      : `The ${name} product presents a total carbon footprint of ${totals[0].toFixed(3)} kg CO2e per functional unit.`}
                  </Text>

                  {/* 2 — Variant comparison table (multiple variants only) */}
                  {isMulti && <VariantComparisonTable variants={variants} />}

                  {/* 3 — Bar chart comparing variants (multiple variants only) */}
                  {isMulti && <BarChartPDF variants={variants} />}

                  {/* 4 — Donut chart: phase breakdown (native PDF SVG) */}
                  <DonutChartPDF variants={variants} />

                  {/* 5 — Dominant-phase summary */}
                  <Text style={[S.paragraph, { marginTop: 8 }]}>
                    {`The ${dominant.label} phase represents the largest contributor to the ${name} carbon footprint, accounting for approximately ${domPct}% of total emissions${isMulti ? " on average across assessed manufacturing locations" : ""}.`}
                  </Text>
                </View>
              );
            })}
          </View>
        </Page>
      )}

      {/* ── Section 5: Strategic Recommendations ── */}
      {strategicRecs.length > 0 && (
        <SectionPage title="5. Strategic Recommendations">
          <Text style={[S.paragraph, { marginBottom: 16 }]}>
            {`Footprint Mappa has identified the following main lines to decarbonise the products assessed for ${companyName}.`}
          </Text>
          {strategicRecs.map((rec, idx) => (
            <View key={idx} wrap={false} style={{ marginBottom: 14 }}>
              <Text style={[S.subsectionTitle, { marginTop: 0 }]}>
                {`5.${idx + 1} `}
                <Text style={S.bold}>{rec.title}</Text>
              </Text>
              {rec.body
                .split(/\n\n+/)
                .map((p) => p.trim())
                .filter(Boolean)
                .map((p, pi) => (
                  <Text key={pi} style={S.paragraph}>
                    {p}
                  </Text>
                ))}
            </View>
          ))}
        </SectionPage>
      )}

    </Document>
  );
}
