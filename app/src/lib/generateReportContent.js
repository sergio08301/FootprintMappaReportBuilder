// Calls the internal API route which proxies to Anthropic server-side.
// Direct browser → Anthropic requests are blocked by CORS.

async function callAnthropic(prompt) {
  const res = await fetch("/api/generate-content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt }),
  });
  if (!res.ok) {
    const { error } = await res.json().catch(() => ({ error: res.statusText }));
    throw new Error(`Content generation failed: ${error}`);
  }
  const { text } = await res.json();
  return text;
}

function summarisePCF(data) {
  return data
    .slice(0, 30)
    .map(
      (r) =>
        `${r.product ?? "Unknown"}: ${parseFloat(r.total_emissions || 0).toFixed(3)} kg CO2e`
    )
    .join("\n");
}

function summariseOCF(data) {
  return data
    .slice(0, 30)
    .map(
      (r) =>
        `${r.entity ?? "Unknown"}: total ${parseFloat(r.total_emissions || 0).toFixed(3)} kg CO2e` +
        ` (Scope 1: ${parseFloat(r.total_scope_1 || 0).toFixed(3)},` +
        ` Scope 2: ${parseFloat(r.total_scope_2 || 0).toFixed(3)},` +
        ` Scope 3: ${parseFloat(r.total_scope_3 || 0).toFixed(3)})`
    )
    .join("\n");
}

export async function generateIntroduction(data, companyName, year, reportType) {
  const isPCF = reportType === "pcf";

  if (isPCF) {
    const prompt = `You are writing the Introduction section of a professional Product Carbon Footprint consulting report conducted by Footprint Mappa.
Write exactly 4 paragraphs in formal third-person consulting style:
Paragraph 1: State that this report presents the results of a Product Carbon Footprint (PCF) assessment conducted by Footprint Mappa for ${companyName} for the year ${year}. The main objective is to quantify the greenhouse gas (GHG) emissions associated with the cradle-to-gate life cycle of the selected products, covering three stages: materials acquisition, manufacturing, and transport.
Paragraph 2: State that the purpose of this document is to provide ${companyName} with a clear and transparent overview of each product's climate impact, identifying the most emission-intensive life cycle stages and supporting future decision-making regarding material optimisation, process improvements, and sustainable product design.
Paragraph 3: Write a brief paragraph about ${companyName} as a company, describing it generically as an organisation whose operations are covered within this assessment boundary. Keep it to 2 sentences maximum.
Paragraph 4: State that this analysis covers the products manufactured during the ${year} calendar year. Clarify that results have not been benchmarked against prior years as this is the baseline assessment. State that the assessment was performed in accordance with ISO 14067, ensuring methodological consistency and credibility across all assessed products.
No bullet points, no headers, no preamble, no sign-off. Return only the four paragraphs.`;

    return callAnthropic(prompt);
  }

  // OCF path (unchanged)
  const standard = "ISO 14064-1:2018";
  const dataSummary = summariseOCF(data);

  const prompt = `You are writing a section of a professional carbon footprint consulting report.

Write 2–3 professional paragraphs for the Introduction section of an Organisational Carbon Footprint (OCF) report for ${companyName}, reporting year ${year}, conducted in accordance with ${standard}.

Emissions data included in this assessment:
${dataSummary}

Requirements:
- Formal third-person consulting style
- State the company name, reporting year, and applicable standard
- Describe the purpose and scope of the assessment
- Reference specific figures from the data summary where relevant
- No bullet points, no section headers
- Return only the paragraphs with no preamble or sign-off`;

  return callAnthropic(prompt);
}

export function generateMethodologicalApproach(companyName, year) {
  return `The ${year} PCF assessment for ${companyName} has been carried out in accordance with internationally recognised standards: ISO 14067:2018 – Greenhouse gases – Carbon footprint of products; GHG Protocol – Product Life Cycle Accounting and Reporting Standard; and life-cycle inventory (LCI) data from reputable databases such as EXIOBASE, DEFRA, IEA, and OCCC. These methodological foundations ensure robustness, comparability, and auditability of results across all assessed products.

To ensure robustness and transparency, the calculation is based on a combination of primary and secondary data. Primary data were collected directly from the company's internal sources, including material compositions, energy consumption per process, production yields, packaging specifications and transport distances. Secondary data were drawn from internationally recognised emission factor databases, such as DEFRA, IEA, OCCC, and EXIOBASE, depending on the category and geographical location.`;
}

// ── Scope & Boundaries helpers ────────────────────────────────────────────────

function parseProductLocation(name) {
  const match = (name ?? "").match(/^(.+?)\s*\(([^)]+)\)\s*$/);
  if (match) return { product: match[1].trim(), location: match[2].trim() };
  return { product: (name ?? "").trim(), location: null };
}

function groupProductsByLocation(data) {
  const groups = {};
  for (const row of data) {
    const { product, location } = parseProductLocation(row.product ?? "");
    const key = location ?? "__none__";
    if (!groups[key]) groups[key] = [];
    groups[key].push({ ...row, parsedProduct: product, parsedLocation: location });
  }
  return groups;
}

const PHASE_ACTIVITY_KEYS = [
  "total_materials",
  "total_manufacturing",
  "total_transport",
  "total_distribution",
  "total_use",
  "total_end_of_life",
];

function getActivePhases(data) {
  const active = {};
  for (const key of PHASE_ACTIVITY_KEYS) {
    active[key] = data.some((row) => parseFloat(row[key] || 0) !== 0);
  }
  return active;
}

const LIFECYCLE_STAGES = [
  {
    phase: "Material Acquisition",
    key: "total_materials",
    subcategories: ["1.1 Raw materials", "1.2 Inbound packaging", "1.3 Outbound packaging"],
  },
  {
    phase: "Manufacturing",
    key: "total_manufacturing",
    subcategories: ["2.1 Electricity", "2.2 Other energy", "2.3 Consumables", "2.4 Waste generated"],
  },
  {
    phase: "Transportation",
    key: "total_transport",
    subcategories: ["3.1", "3.2", "3.3", "3.4"],
  },
  {
    phase: "Distribution",
    key: "total_distribution",
    subcategories: ["4.1"],
  },
  {
    phase: "Use",
    key: "total_use",
    subcategories: ["5.1", "5.2", "5.3"],
  },
  {
    phase: "End-of-life",
    key: "total_end_of_life",
    subcategories: ["6.1", "6.2", "6.3"],
  },
];

export async function generateScopeAndBoundaries(data, reportType) {
  if (reportType === "pcf") {
    const groups = groupProductsByLocation(data);
    const locationKeys = Object.keys(groups).filter((k) => k !== "__none__");
    const hasLocations = locationKeys.length > 0;
    const activePhases = getActivePhases(data);

    // Build a concise coverage summary for the prompt
    let coverageSummary;
    if (hasLocations) {
      const parts = locationKeys.map(
        (loc) =>
          `${loc}: ${groups[loc].length} product${groups[loc].length !== 1 ? "s" : ""}`
      );
      const noLoc = groups.__none__?.length ?? 0;
      if (noLoc > 0)
        parts.push(
          `unspecified location: ${noLoc} product${noLoc !== 1 ? "s" : ""}`
        );
      coverageSummary = parts.join("; ");
    } else {
      const total = data.length;
      coverageSummary = `${total} product${total !== 1 ? "s" : ""} assessed under a single operational boundary with no manufacturing location specified`;
    }

    const prompt = `You are writing the Scope and Boundaries section of a professional Product Carbon Footprint consulting report.

Write 1 paragraph in formal third-person consulting style summarising the scope coverage of this assessment.

Product coverage: ${coverageSummary}

Requirements:
- ${hasLocations ? "Mention each manufacturing location and the number of products it contains" : "State the total number of products assessed"}
- State that the system boundary follows a cradle-to-gate approach covering materials acquisition, manufacturing, and transport, in accordance with ISO 14067
- Formal third-person consulting style
- No bullet points, no headers
- Return only the paragraph, no preamble or sign-off`;

    const text = await callAnthropic(prompt);

    return {
      text,
      scopeData: { groups, hasLocations, activePhases, lifecycleStages: LIFECYCLE_STAGES },
    };
  }

  // ── OCF path ──────────────────────────────────────────────────────────────────
  const dataSummary = summariseOCF(data);
  const prompt = `You are writing a section of a professional carbon footprint consulting report.

Write 2–3 professional paragraphs for the Scope and Boundaries section of an Organisational Carbon Footprint (OCF) report conducted in accordance with ISO 14064-1:2018.

The following entities are within scope:
${dataSummary}

Requirements:
- Define the organisational and operational boundaries. Describe Scope 1, 2, and 3 coverage. Explain any exclusions.
- Formal third-person consulting style
- No bullet points, no section headers
- Return only the paragraphs with no preamble or sign-off`;

  const text = await callAnthropic(prompt);
  return { text, scopeData: null };
}
