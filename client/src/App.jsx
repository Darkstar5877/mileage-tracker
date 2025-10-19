import React, { useState, useEffect } from "react";

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

  // Load static mileage data
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

  // 📤 Export trips to CSV
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-blue-700">🚗 PCSD Mileage Tracker</h1>
          <p className="text-gray-500 mt-2 text-lg">
            Track mileage with a simple and effective app
          </p>
        </div>

        {/* Dropdowns */}
        <div className="space-y-4 mb-6">
          <div>
            <label className="block mb-1 font-medium text-gray-700">From:</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-lg px-3 py-3 transition-all outline-none"
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
            <label className="block mb-1 font-medium text-gray-700">To:</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border-2 border-blue-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-300 rounded-lg px-3 py-3 transition-all outline-none"
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
            className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white py-3 rounded-lg font-semibold text-lg transition-colors shadow-md hover:shadow-lg"
          >
            ➕ Add Trip
          </button>
        </div>

        {/* Trip List */}
        {trips.length > 0 && (
          <div className="mt-6">
            <h2 className="text-2xl font-semibold mb-4 text-gray-800">📍 Trip Log</h2>
            <ul className="space-y-2">
              {trips.map((t) => (
                <li
                  key={t.id}
                  className="py-3 px-4 bg-gray-50 hover:bg-gray-100 rounded-xl shadow-sm flex justify-between items-center transition"
                >
                  <div>
                    <p className="font-semibold text-gray-800">
                      {t.from_school} → {t.to_school}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(t.date).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="text-blue-700 font-bold text-lg">{t.miles} mi</span>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-6 border-t pt-4 text-center">
              <p className="text-xl font-semibold">
                Total Miles:{" "}
                <span className="text-blue-700 font-bold">{totalMiles}</span>
              </p>
              <p className="text-xl font-semibold">
                Reimbursement:{" "}
                <span className="text-green-700 font-bold">${totalReimbursement}</span>
              </p>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 space-y-3">
              <button
                onClick={handleExportCSV}
                className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-colors"
              >
                📤 Export Mileage Report (CSV)
              </button>

              <button
                onClick={handleClearAll}
                className="w-full bg-red-600 hover:bg-red-700 text-white py-3 rounded-lg font-semibold text-lg shadow-md hover:shadow-lg transition-colors"
              >
                🗑️ Clear All Trips
              </button>
            </div>
          </div>
        )}

        {trips.length === 0 && (
          <p className="text-center text-gray-500 text-lg mt-6">
            No trips yet. Add your first one above!
          </p>
        )}
      </div>
    </div>
  );
}

export default function App() {
  return <MileageTracker />;
}
