import { useState } from "react";

const API = "https://localhost:44352/api";

interface Report {
  memberName: string;
  present: number;
  absent: number;
  leave: number;
  total: number;
  percentage: number;
}
export default function YearlyReport() {
  const [year, setYear] = useState("");
  const [data, setData] = useState<Report[]>([]);

  const load = async () => {
    const res = await fetch(
      `${API}/member-attendance/yearly-report?year=${year}`
    );
    const result = await res.json();
    setData(result);
  };

  return (
    <div className="p-4 bg-gray-100 min-h-screen">

      <div className="bg-white p-4 rounded shadow flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">📅 Yearly Report</h2>

        <div className="flex gap-2">
          <input
            placeholder="Year"
            onChange={e => setYear(e.target.value)}
            className="border px-3 py-2 rounded"
          />

          <button
            onClick={load}
            className="bg-blue-600 text-white px-4 py-2 rounded"
          >
            Load
          </button>
        </div>
      </div>

      {/* Download */}
      <div className="flex gap-3 mb-4">
        <a
          href={`${API}/member-attendance-report/monthly-excel?year=${year}`}
          className="bg-green-600 text-white px-4 py-2 rounded"
        >
          Excel
        </a>

        <a
          href={`${API}/member-attendance-report/monthly-pdf?year=${year}`}
          className="bg-red-600 text-white px-4 py-2 rounded"
        >
          PDF
        </a>
      </div>

      {/* Table */}
      <div className="bg-white rounded shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-200">
            <tr>
              <th className="p-3">Member</th>
              <th>Present</th>
              <th>Absent</th>
              <th>Leave</th>
              <th>Total</th>
              <th>%</th>
            </tr>
          </thead>

          <tbody>
            {data.map((d, i) => (
              <tr key={i} className="border-t text-center">
                <td className="p-3 text-left">{d.memberName}</td>
                <td className="text-green-600">{d.present}</td>
                <td className="text-red-600">{d.absent}</td>
                <td className="text-yellow-600">{d.leave}</td>
                <td>{d.total}</td>
                <td>{d.percentage.toFixed(2)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}