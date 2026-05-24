import { useState } from "react"

export default function TransactionTable({ transactions }) {
  const [search, setSearch] = useState("")
  const [sortKey, setSortKey] = useState("date")
  const [sortDir, setSortDir] = useState("desc")

  function toggleSort(key) {
    if (sortKey === key) {
      setSortDir(d => d === "asc" ? "desc" : "asc")
    } else {
      setSortKey(key)
      setSortDir("asc")
    }
  }

  const filtered = transactions
    .filter(t =>
      t.description.toLowerCase().includes(search.toLowerCase()) ||
      t.date.includes(search) ||
      t.category.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      let valA = a[sortKey]
      let valB = b[sortKey]
      if (sortKey === "amount" || sortKey === "balance") {
        valA = Number(valA)
        valB = Number(valB)
      }
      if (valA < valB) return sortDir === "asc" ? -1 : 1
      if (valA > valB) return sortDir === "asc" ? 1 : -1
      return 0
    })

  const totalIncome = transactions
    .filter(t => t.amount > 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.amount < 0)
    .reduce((sum, t) => sum + t.amount, 0)

  const netSavings = totalIncome + totalExpenses

  function arrow(key) {
    if (sortKey !== key) return <span className="text-gray-300 ml-1">↕</span>
    return <span className="text-blue-500 ml-1">{sortDir === "asc" ? "↑" : "↓"}</span>
  }

  return (
    <div>

      {/* Summary cards */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Total income</p>
          <p className="text-xl font-semibold text-green-600">
            +${totalIncome.toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Total expenses</p>
          <p className="text-xl font-semibold text-red-500">
            -${Math.abs(totalExpenses).toFixed(2)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-5 py-4">
          <p className="text-xs text-gray-400 mb-1">Net savings</p>
          <p className={`text-xl font-semibold ${netSavings >= 0 ? "text-blue-600" : "text-red-500"}`}>
            {netSavings >= 0 ? "+" : "-"}${Math.abs(netSavings).toFixed(2)}
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between gap-4">
          <p className="text-sm font-medium text-gray-900">
            {transactions.length} transactions
          </p>
          <input
            type="text"
            placeholder="Search by description, category, date..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="border border-gray-200 rounded-lg px-3 py-1.5 text-sm text-gray-700 w-72 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-300"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-xs text-gray-500 uppercase tracking-wide">
              <tr>
                <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("date")}>
                  Date {arrow("date")}
                </th>
                <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("description")}>
                  Description {arrow("description")}
                </th>
                <th className="px-5 py-3 text-left cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("category")}>
                  Category {arrow("category")}
                </th>
                <th className="px-5 py-3 text-right cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("amount")}>
                  Amount {arrow("amount")}
                </th>
                <th className="px-5 py-3 text-right cursor-pointer hover:text-gray-700"
                  onClick={() => toggleSort("balance")}>
                  Balance {arrow("balance")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-gray-400">
                    No transactions match your search.
                  </td>
                </tr>
              ) : (
                filtered.map(t => (
                  <tr key={t.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                      {t.date}
                    </td>
                    <td className="px-5 py-3 text-gray-800 max-w-xs truncate">
                      {t.description}
                    </td>
                    <td className="px-5 py-3">
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-gray-100 text-gray-600">
                        {t.category}
                      </span>
                    </td>
                    <td className={`px-5 py-3 text-right font-medium whitespace-nowrap ${
                      t.amount >= 0 ? "text-green-600" : "text-red-500"
                    }`}>
                      {t.amount >= 0 ? "+" : ""}${Math.abs(t.amount).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right text-gray-500 whitespace-nowrap">
                      ${t.balance.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}