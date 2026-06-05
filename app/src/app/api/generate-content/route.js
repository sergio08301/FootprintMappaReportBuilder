// Server-side proxy — keeps ANTHROPIC_API_KEY out of the browser bundle.
// Set ANTHROPIC_API_KEY in .env.local

export async function POST(request) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "ANTHROPIC_API_KEY environment variable is not set" },
      { status: 500 }
    );
  }

  let prompt;
  try {
    ({ prompt } = await request.json());
  } catch {
    return Response.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!prompt || typeof prompt !== "string") {
    return Response.json({ error: "Missing required field: prompt" }, { status: 400 });
  }

  let anthropicRes;
  try {
    anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 1000,
        messages: [{ role: "user", content: prompt }],
      }),
    });
  } catch (err) {
    return Response.json(
      { error: `Failed to reach Anthropic API: ${err.message}` },
      { status: 502 }
    );
  }

  if (!anthropicRes.ok) {
    let errorMessage = anthropicRes.statusText;
    try {
      const errorBody = await anthropicRes.json();
      errorMessage = errorBody.error?.message ?? errorMessage;
    } catch {
      // keep statusText fallback
    }
    return Response.json({ error: errorMessage }, { status: anthropicRes.status });
  }

  const data = await anthropicRes.json();
  const text = data.content?.[0]?.text;

  if (!text) {
    return Response.json({ error: "Unexpected response structure from Anthropic" }, { status: 502 });
  }

  return Response.json({ text });
}
