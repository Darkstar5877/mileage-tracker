import React, { useState, useEffect } from "react";
import mileageData from "./data/mileage_data.json";

export default function App() {
  const fromSchools = Array.from(new Set(mileageData.map((d) => d.from))).sort();
  const toSchools = Array.from(new Set(mileageData.map((d) => d.to))).sort();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trips, setTrips] = useState([]);
  const ratePerMile = 0.7;

  // ✅ Load saved trips
  useEffect(() => {
    const savedTrips = localStorage.getItem("trips");
    if (savedTrips) {
      setTrips(JSON.parse(savedTrips));
    }
  }, []);

  // ✅ Save trips whenever they change
  useEffect(() => {
    localStorage.setItem("trips", JSON.stringify(trips));
  }, [trips]);

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
      alert("You cannot select the same school for both From and To.");
      return;
    }

    const miles = findDistance(from, to);
    if (miles !== null) {
      setTrips([...trips, { from, to, miles, date: new Date().toISOString() }]);
    } else {
      alert("No mileage data found for that route.");
    }
  };

  const handleClearTrips = () => {
    if (confirm("Are you sure you want to clear all trips?")) {
      setTrips([]);
      localStorage.removeItem("trips");
    }
  };

  // 📤 Export trips to CSV (with totals)
  const handleExportCSV = () => {
    if (trips.length === 0) {
      alert("No trips to export!");
      return;
    }

    const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0);
    const totalReimbursement = (totalMiles * ratePerMile).toFixed(2);

    const headers = ["Date", "From", "To", "Miles"];
    const rows = trips.map(
      (t) =>
        `${new Date(t.date).toLocaleDateString()},${t.from},${t.to},${t.miles}`
    );

    // Add summary rows
    rows.push("");
    rows.push(`Total Miles,, ,${totalMiles}`);
    rows.push(`Total Reimbursement,, ,$${totalReimbursement}`);

    const csvContent = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", "mileage_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0);
  const totalReimbursement = (totalMiles * ratePerMile).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <h1 className="text-3xl font-bold text-center mb-6">
          🚗 Mileage Tracker
        </h1>

        <div className="space-y-4">
          {/* FROM Dropdown */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">From:</label>
            <select
              value={from}
              onChange={(e) => setFrom(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select school</option>
              {fromSchools.map((school) => (
                <option
                  key={school}
                  value={school}
                  disabled={school === to}
                >
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* TO Dropdown */}
          <div>
            <label className="block text-gray-700 mb-2 font-medium">To:</label>
            <select
              value={to}
              onChange={(e) => setTo(e.target.value)}
              className="w-full border rounded-lg px-3 py-2"
            >
              <option value="">Select school</option>
              {toSchools.map((school) => (
                <option
                  key={school}
                  value={school}
                  disabled={school === from}
                >
                  {school}
                </option>
              ))}
            </select>
          </div>

          {/* Add Trip Button */}
          <button
            onClick={handleAddTrip}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg py-2 transition-colors"
          >
            ➕ Add Trip
          </button>
        </div>

        {/* Trip Log */}
        {trips.length > 0 && (
          <div className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Trip Log:</h2>
            <ul className="divide-y divide-gray-200">
              {trips.map((t, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
                  <span>
                    {t.from} → {t.to}
                  </span>
                  <span className="font-medium">{t.miles} mi</span>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="mt-4 border-t pt-4">
              <p className="text-lg font-semibold">
                Total Miles: <span className="text-blue-700">{totalMiles}</span>
              </p>
              <p className="text-lg font-semibold">
                Reimbursement:{" "}
                <span className="text-green-700">${totalReimbursement}</span>
              </p>
            </div>

            {/* Clear Trips */}
            <button
              onClick={handleClearTrips}
              className="mt-4 w-full bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg py-2 transition-colors"
            >
              🗑️ Clear Trips
            </button>

            {/* 📧 Export Button */}
            <button
              onClick={handleExportCSV}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2 transition-colors"
            >
              📧 Export Mileage Report (CSV)
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
