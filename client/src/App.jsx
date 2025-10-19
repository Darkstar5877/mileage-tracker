import React, { useState, useEffect } from "react";

// ==========================
// Mileage Tracker Component
// ==========================
function MileageTracker() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trips, setTrips] = useState([]);
  const [mileageData, setMileageData] = useState([]);
  const ratePerMile = 0.7;

  // Load trips from localStorage on startup
  useEffect(() => {
    const savedTrips = JSON.parse(localStorage.getItem("trips")) || [];
    setTrips(savedTrips);
  }, []);

  // Save trips back to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips]);

  // Load mileage data JSON (your pre-defined distances)
  useEffect(() => {
    import("./data/mileage_data.json").then((module) => {
      setMileageData(module.default);
    });
  }, []);

  const fromSchools = Array.from(new Set(mileageData.map((d) => d.from))).sort();
  const toSchools = Array.from(new Set(mileageData.map((d) => d.to))).sort();

  const findDistance = (from, to) => {
    const entry =
      mileageData.find(
        (d) =>
          (d.from === from && d.to === to) ||
          (d.from === to && d.to === from)
      ) || null;
    return entry ? entry.miles : null;
  };

  const handleAddTrip = () => {
    if (!from || !to) {
      alert("Please select both schools.");
      return;
    }
    if (from === to) {
      alert("You cannot select the same school for both.");
      return;
    }

    const miles = findDistance(from, to);
    if (miles !== null) {
      const trip = {
        id: Date.now(),
        from_school: from,
        to_school: to,
        miles,
        date: new Date().toISOString(),
      };

      setTrips([...trips, trip]);
      setFrom("");
      setTo("");
    } else {
      alert("No mileage data found for that route.");
    }
  };

  // 📤 Export CSV
  const handleExportCSV = () => {
    if (trips.length === 0) {
      alert("No trips to export.");
      return;
    }

    const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0);
    const totalReimbursement = (totalMiles * ratePerMile).toFixed(2);

    const headers = ["Date", "From", "To", "Miles"];
    const rows = trips.map(
      (t) =>
        `${new Date(t.date).toLocaleDateString()},${t.from_school},${t.to_school},${t.miles}`
    );

    rows.push("");
    rows.push(`Total Miles,,,${totalMiles}`);
    rows.push(`Total Reimbursement,,,${totalReimbursement}`);

    const csvContent = [headers.join(","), ...rows].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.setAttribute(
      "download",
      `mileage_report_${new Date()
        .toLocaleDateString()
        .replaceAll("/", "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // 🗑️ Clear all trips
  const handleClearAll = () => {
    if (
      window.confirm(
        "Are you sure you want to delete all trips? This cannot be undone."
      )
    ) {
      localStorage.removeItem("trips");
      setTrips([]);
    }
  };

  const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0);
  const totalReimbursement = (totalMiles * ratePerMile).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold mb-4 text-center">🚗 Mileage Tracker</h1>

        {/* Dropdowns */}
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">From:</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select school</option>
              {fromSchools.map((s) => (
                <option key={s} value={s} disabled={s === to}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block mb-1 font-medium">To:</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">Select school</option>
              {toSchools.map((s) => (
                <option key={s} value={s} disabled={s === from}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={handleAddTrip}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
          >
            ➕ Add Trip
          </button>
        </div>

        {/* Trip List */}
        {trips.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">📍 Trip Log:</h2>
            <ul className="divide-y divide-gray-200">
              {trips.map((t) => (
                <li key={t.id} className="py-2 flex justify-between text-sm">
                  <span>
                    {t.from_school} → {t.to_school}
                  </span>
                  <span className="font-medium">{t.miles} mi</span>
                </li>
              ))}
            </ul>

            <div className="mt-4 border-t pt-4">
              <p className="text-lg font-semibold">
                Total Miles:{" "}
                <span className="text-blue-700">{totalMiles}</span>
              </p>
              <p className="text-lg font-semibold">
                Reimbursement:{" "}
                <span className="text-green-700">${totalReimbursement}</span>
              </p>
            </div>

            {/* 📤 Export CSV */}
            <button
              onClick={handleExportCSV}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2 transition-colors"
            >
              📤 Export Mileage Report (CSV)
            </button>

            {/* 🗑️ Clear All Trips */}
            <button
              onClick={handleClearAll}
              className="mt-2 w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg py-2 transition-colors"
            >
              🗑️ Clear All Trips
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ==========================
// App Component (Main)
// ==========================
export default function App() {
  return <MileageTracker />;
}
