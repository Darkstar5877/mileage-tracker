import React, { useState, useEffect } from "react";

// ==========================
// Login Component
// ==========================
function Login({ onLogin, onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        onLogin();
      } else {
        setError(data.message || "Login failed");
      }
    } catch (err) {
      setError("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">🔐 Login</h1>
      <form onSubmit={handleLogin} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded"
        >
          Sign In
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Don’t have an account?{" "}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Register
        </button>
      </p>
    </div>
  );
}

// ==========================
// Register Component
// ==========================
function Register({ onSwitch }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage("");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("✅ Account created! You can now log in.");
      } else {
        setMessage(data.message || "Registration failed");
      }
    } catch (err) {
      setMessage("Network error");
    }
  };

  return (
    <div className="max-w-md mx-auto bg-white p-6 rounded-lg shadow-lg mt-10">
      <h1 className="text-2xl font-bold mb-4 text-center">✉️ Register</h1>
      <form onSubmit={handleRegister} className="space-y-4">
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full border px-3 py-2 rounded"
        />
        {message && <p className="text-sm text-center">{message}</p>}
        <button
          type="submit"
          className="w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded"
        >
          Create Account
        </button>
      </form>
      <p className="text-sm text-center mt-4">
        Already have an account?{" "}
        <button onClick={onSwitch} className="text-blue-600 hover:underline">
          Log in
        </button>
      </p>
    </div>
  );
}

// ==========================
// Mileage Tracker Component
// ==========================
function MileageTracker({ onLogout }) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [trips, setTrips] = useState([]);
  const [mileageData, setMileageData] = useState([]);
  const ratePerMile = 0.7;

  const token = localStorage.getItem("token");

  // Load trips from backend
  useEffect(() => {
    const fetchTrips = async () => {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/trips`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setTrips(data);
    };
    fetchTrips();
  }, [token]);

  // Load mileage data JSON
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

  const handleAddTrip = async () => {
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
        from_school: from,
        to_school: to,
        miles,
        date: new Date().toISOString(),
      };

      const res = await fetch(`${import.meta.env.VITE_API_URL}/trips`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(trip),
      });

      if (res.ok) {
        setTrips([...trips, trip]);
      } else {
        alert("Failed to save trip");
      }
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
      `mileage_report_${new Date().toLocaleDateString().replaceAll("/", "-")}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalMiles = trips.reduce((sum, t) => sum + t.miles, 0);
  const totalReimbursement = (totalMiles * ratePerMile).toFixed(2);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="bg-white rounded-2xl shadow-md p-8 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold">🚗 Mileage Tracker</h1>
          <button
            onClick={() => {
              localStorage.removeItem("token");
              onLogout();
            }}
            className="text-red-600 hover:underline"
          >
            Logout
          </button>
        </div>

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
            <h2 className="text-xl font-semibold mb-2">Trip Log:</h2>
            <ul className="divide-y divide-gray-200">
              {trips.map((t, idx) => (
                <li key={idx} className="py-2 flex justify-between text-sm">
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

            <button
              onClick={handleExportCSV}
              className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg py-2 transition-colors"
            >
              📤 Export Mileage Report (CSV)
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
  const [loggedIn, setLoggedIn] = useState(!!localStorage.getItem("token"));
  const [showRegister, setShowRegister] = useState(false);

  if (!loggedIn) {
    return showRegister ? (
      <Register onSwitch={() => setShowRegister(false)} />
    ) : (
      <Login
        onLogin={() => setLoggedIn(true)}
        onSwitch={() => setShowRegister(true)}
      />
    );
  }

  return <MileageTracker onLogout={() => setLoggedIn(false)} />;
}
