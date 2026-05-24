import { useState } from "react"
import CSVUploader from "./components/CSVUploader"
import TransactionTable from "./components/TransactionTable"
import AIInsights from "./components/AIInsights"
import Charts from "./components/Charts"
import { categorizeTransactions } from "./utils/claudeApi"

export default function App() {
  const [transactions, setTransactions] = useState(() => {
    const saved = localStorage.getItem("finance_transactions")
    return saved ? JSON.parse(saved) : []
  })
  const [aiReady, setAiReady] = useState(() => {
    return localStorage.getItem("finance_transactions") !== null
  })
  const [loading, setLoading] = useState(false)
  const [categoryFilter, setCategoryFilter] = useState(null)

  async function handleDataLoaded(raw) {
    setTransactions(raw)
    setAiReady(false)
    setCategoryFilter(null)
    setLoading(true)

    try {
      const categorized = await categorizeTransactions(raw)
      const merged = raw.map(t => {
        const match = categorized.find(c => c.id === t.id)
        return match
          ? { ...t, category: match.category, txType: match.type }
          : t
      })
      setTransactions(merged)
      localStorage.setItem("finance_transactions", JSON.stringify(merged))
      setAiReady(true)
    } catch (e) {
      console.error("Categorization failed:", e)
      setAiReady(true)
    } finally {
      setLoading(false)
    }
  }

  function handleClear() {
    localStorage.removeItem("finance_transactions")
    setTransactions([])
    setAiReady(false)
    setCategoryFilter(null)
  }

  function handleCategoryClick(category) {
    setCategoryFilter(prev => prev === category ? null : category)
  }

  const filteredTransactions = categoryFilter
    ? transactions.filter(t => t.category === categoryFilter)
    : transactions

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-6 py-10">

        <div className="mb-10">
          <h1 className="text-2xl font-semibold text-gray-900">
            Finance Intelligence Dashboard
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Upload your bank CSV — everything stays on your machine
          </p>
          {transactions.length > 0 && (
            <button
              onClick={handleClear}
              className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors"
            >
              Clear data & reset
            </button>
          )}
        </div>

        <CSVUploader onDataLoaded={handleDataLoaded} />

        {loading && (
          <div className="mt-6 flex items-center gap-3 text-sm text-gray-500">
            <div className="w-4 h-4 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
            Claude is categorizing your transactions...
          </div>
        )}

        {transactions.length > 0 && !loading && (
          <div className="mt-8 space-y-6">

            {aiReady && (
              <Charts
                transactions={transactions}
                onCategoryClick={handleCategoryClick}
              />
            )}

            {aiReady && <AIInsights transactions={transactions} />}

            {categoryFilter && (
              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  Filtering by:{" "}
                  <span className="font-medium text-gray-800">
                    {categoryFilter}
                  </span>
                </span>
                <button
                  onClick={() => setCategoryFilter(null)}
                  className="text-xs text-blue-500 hover:text-blue-700"
                >
                  Clear filter
                </button>
              </div>
            )}

            <TransactionTable transactions={filteredTransactions} />

          </div>
        )}

      </div>
    </div>
  )
}