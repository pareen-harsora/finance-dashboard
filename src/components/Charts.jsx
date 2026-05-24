import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Legend
} from "recharts"

const COLORS = [
  "#3b82f6", "#10b981", "#f59e0b", "#ef4444",
  "#8b5cf6", "#06b6d4", "#f97316", "#84cc16",
  "#ec4899", "#6366f1"
]

function buildCategoryData(transactions) {
  const map = {}
  transactions
    .filter(t => t.amount < 0)
    .forEach(t => {
      const cat = t.category || "Other"
      map[cat] = (map[cat] || 0) + Math.abs(t.amount)
    })
  return Object.entries(map)
    .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
    .sort((a, b) => b.value - a.value)
}

function buildMonthlyData(transactions) {
  const map = {}
  transactions.forEach(t => {
    const month = t.date.slice(0, 7)
    if (!map[month]) map[month] = { month, income: 0, expenses: 0 }
    if (t.amount > 0) map[month].income += t.amount
    else map[month].expenses += Math.abs(t.amount)
  })
  return Object.values(map)
    .sort((a, b) => a.month.localeCompare(b.month))
    .map(m => ({
      month: new Date(m.month + "-01").toLocaleString("default", { month: "short", year: "numeric" }),
      Income: parseFloat(m.income.toFixed(2)),
      Expenses: parseFloat(m.expenses.toFixed(2)),
    }))
}

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs shadow-sm">
      {label && <p className="font-medium text-gray-700 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }}>
          {p.name}: ${p.value.toLocaleString()}
        </p>
      ))}
    </div>
  )
}

export default function Charts({ transactions, onCategoryClick }) {
  const categoryData = buildCategoryData(transactions)
  const monthlyData = buildMonthlyData(transactions)

  return (
    <div className="grid grid-cols-1 gap-6 mb-6">

      {/* Monthly income vs expenses */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Monthly overview
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Income vs expenses by month
        </p>
        <ResponsiveContainer width="100%" height={240}>
          <BarChart data={monthlyData} barGap={4}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f3f4f6" />
            <XAxis
              dataKey="month"
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              axisLine={false}
              tickLine={false}
              tickFormatter={v => `$${v.toLocaleString()}`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ fontSize: "12px", paddingTop: "16px" }}
            />
            <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
            <Bar dataKey="Expenses" fill="#ef4444" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Spending by category */}
      <div className="bg-white rounded-xl border border-gray-100 p-6">
        <h2 className="text-sm font-semibold text-gray-900 mb-1">
          Spending by category
        </h2>
        <p className="text-xs text-gray-400 mb-5">
          Click a category to filter transactions
        </p>
        <div className="flex flex-col md:flex-row items-center gap-6">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                dataKey="value"
                onClick={d => onCategoryClick && onCategoryClick(d.name)}
                style={{ cursor: "pointer" }}
              >
                {categoryData.map((_, i) => (
                  <Cell
                    key={i}
                    fill={COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="flex flex-col gap-2 min-w-[160px]">
            {categoryData.map((entry, i) => (
              <button
                key={i}
                onClick={() => onCategoryClick && onCategoryClick(entry.name)}
                className="flex items-center justify-between gap-2 text-left hover:bg-gray-50 rounded px-2 py-1 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                    style={{ background: COLORS[i % COLORS.length] }}
                  />
                  <span className="text-xs text-gray-600">{entry.name}</span>
                </div>
                <span className="text-xs font-medium text-gray-800">
                  ${entry.value.toLocaleString()}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

    </div>
  )
}