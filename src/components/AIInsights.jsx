import { useState } from "react"
import { generateInsights } from "../utils/claudeApi"

export default function AIInsights({ transactions }) {
  const [insights, setInsights] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleGenerate() {
    setLoading(true)
    setError("")
    try {
      const result = await generateInsights(transactions)
      setInsights(result)
    } catch (e) {
        
      setError("Failed to generate insights. Check your API key in .env")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-gray-900">AI Savings Report</h2>
          <p className="text-xs text-gray-400 mt-0.5">
            Claude analyzes your full spending picture
          </p>
        </div>
        {!insights && (
          <button
            onClick={handleGenerate}
            disabled={loading}
            className={`text-sm px-4 py-2 rounded-lg font-medium transition-colors ${
              loading
                ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                : "bg-blue-600 text-white hover:bg-blue-700"
            }`}
          >
            {loading ? "Analyzing..." : "Generate Report"}
          </button>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}

      {insights && (
        <div className="space-y-5">

          <div className="bg-gray-50 rounded-lg p-4">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
              Overview
            </p>
            <p className="text-sm text-gray-700 leading-relaxed">
              {insights.summary}
            </p>
          </div>

          {insights.anomalies?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Anomalies detected
              </p>
              <div className="space-y-2">
                {insights.anomalies.map((a, i) => (
                  <div key={i} className="flex gap-3 items-start bg-amber-50 rounded-lg px-4 py-3">
                    <span className="text-amber-500 mt-0.5 text-sm">⚠</span>
                    <p className="text-sm text-amber-800">{a}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {insights.opportunities?.length > 0 && (
            <div>
              <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
                Saving opportunities
              </p>
              <div className="space-y-2">
                {insights.opportunities.map((o, i) => (
                  <div key={i} className="flex gap-3 items-start bg-green-50 rounded-lg px-4 py-3">
                    <span className="text-green-500 mt-0.5 text-sm">↑</span>
                    <p className="text-sm text-green-800">{o}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setInsights(null) }}
            className="text-xs text-gray-400 hover:text-gray-600"
          >
            Regenerate report
          </button>

        </div>
      )}
    </div>
  )
}