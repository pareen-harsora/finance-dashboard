import Anthropic from "@anthropic-ai/sdk"

const client = new Anthropic({
  apiKey: import.meta.env.VITE_ANTHROPIC_API_KEY,
  dangerouslyAllowBrowser: true,
})

export async function categorizeTransactions(transactions) {
  const transactionList = transactions
    .map(t => `ID:${t.id} | ${t.date} | ${t.description} | $${t.amount}`)
    .join("\n")

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 2048,
    messages: [
      {
        role: "user",
        content: `You are a personal finance assistant. Categorize each transaction below.

For each transaction return ONLY a JSON array with this exact shape:
[{"id": 0, "category": "Food & Dining", "type": "expense"}]

Categories to use: Food & Dining, Groceries, Transport, Entertainment, Shopping, 
Health, Utilities, Housing, Income, Savings, Coffee, Fuel, Home, Adjustment, Other

type must be either "income" or "expense"

Transactions:
${transactionList}

Return ONLY the JSON array. No explanation, no markdown, no backticks.`,
      },
    ],
  })

  const raw = response.content[0].text.trim()
  console.log("RAW CLAUDE RESPONSE:", raw)
  const text = raw.replace(/```json|```/g, "").trim()
  console.log("CLEANED TEXT:", text)
  return JSON.parse(text)
}

export async function generateInsights(transactions) {
  const summary = transactions
    .filter(t => t.amount !== 0)
    .map(t => `${t.date} | ${t.description} | ${t.category} | $${t.amount}`)
    .join("\n")

  const response = await client.messages.create({
    model: "claude-sonnet-4-5",
    max_tokens: 1024,
    messages: [
      {
        role: "user",
        content: `You are a personal finance advisor. Analyze these transactions and return ONLY a JSON object with this exact shape:
{
  "anomalies": ["string", "string"],
  "opportunities": ["string", "string", "string"],
  "summary": "2-3 sentence overview of spending patterns"
}

anomalies: unusual patterns, forgotten subscriptions, big spikes (max 3 items)
opportunities: specific actionable saving tips with dollar amounts (max 3 items)
summary: overall financial health snapshot

Transactions:
${summary}

Return ONLY the JSON object. No explanation, no markdown, no backticks.`,
      },
    ],
  })

  const raw = response.content[0].text.trim()
  console.log("RAW CLAUDE RESPONSE:", raw)
  const text = raw.replace(/```json|```/g, "").trim()
  console.log("CLEANED TEXT:", text)
  return JSON.parse(text)
}