import { useState, useRef } from "react"
import Papa from "papaparse"

export default function CSVUploader({ onDataLoaded }) {
  const [dragging, setDragging] = useState(false)
  const [fileName, setFileName] = useState("")
  const [error, setError] = useState("")
  const inputRef = useRef()

  function parseFile(file) {
    if (!file || !file.name.endsWith(".csv")) {
      setError("Please upload a valid .csv file.")
      return
    }
    setError("")
    setFileName(file.name)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rows = results.data
        if (!rows.length) {
          setError("CSV appears to be empty.")
          return
        }

        const normalized = rows.map((row, i) => {
          return {
            id: i,
            date: row["date"] || row["Date"] || "",
            description: row["description"] || row["Description"] || "",
            category: row["category"] || row["Category"] || "Uncategorized",
            amount: parseFloat(
              (row["amount"] || row["Amount"] || "0")
                .toString()
                .replace(/[^0-9.-]/g, "")
            ) || 0,
            balance: parseFloat(
              (row["balance"] || row["Balance"] || "0")
                .toString()
                .replace(/[^0-9.-]/g, "")
            ) || 0,
            raw: row,
          }
        })

        onDataLoaded(normalized)
      },
      error: () => setError("Failed to parse CSV. Check the file format."),
    })
  }

  function handleDrop(e) {
    e.preventDefault()
    setDragging(false)
    const file = e.dataTransfer.files[0]
    parseFile(file)
  }

  function handleFileInput(e) {
    parseFile(e.target.files[0])
  }

  return (
    <div>
      <div
        onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current.click()}
        className={`
          border-2 border-dashed rounded-xl px-8 py-12 text-center cursor-pointer
          transition-colors duration-150
          ${dragging
            ? "border-blue-400 bg-blue-50"
            : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"}
        `}
      >
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
          </div>
          {fileName ? (
            <div>
              <p className="text-sm font-medium text-green-600">{fileName} uploaded</p>
              <p className="text-xs text-gray-400 mt-1">Click or drag to replace</p>
            </div>
          ) : (
            <div>
              <p className="text-sm font-medium text-gray-700">
                Drag & drop your bank CSV here
              </p>
              <p className="text-xs text-gray-400 mt-1">or click to browse</p>
            </div>
          )}
        </div>
        <input
          ref={inputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleFileInput}
        />
      </div>

      {error && (
        <p className="mt-3 text-sm text-red-500">{error}</p>
      )}
    </div>
  )
}