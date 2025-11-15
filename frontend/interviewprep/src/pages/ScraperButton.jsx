import { useState } from "react";

export default function AdminPage() {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isScraping, setIsScraping] = useState(false);

  const handleRunScraper = async () => {
    setLoading(true);
    setIsScraping(true);
    setMessage("Running scraper…");

    try {
      const res = await fetch("http://localhost:5000/api/run-scraper", {
        method: "POST",
      });
      const data = await res.json();
      setMessage(data.message || "Scraper run complete!");
    } catch (err) {
      setMessage("Error: " + err.message);
      setIsScraping(false);
    } finally {
      setLoading(false);
    }
  };

  const handleStopScraper = async () => {
    setLoading(true);
    setMessage("Stopping scraper…");

    try {
      const res = await fetch(
        "http://localhost:5000/api/run-scraper/stop-scraper",
        {
          method: "POST",
        }
      );
      const data = await res.json();
      setMessage(data.message || "Scraper stopped successfully!");
      setIsScraping(false);
    } catch (err) {
      setMessage("Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center p-6">
      <div className="bg-white shadow-2xl rounded-2xl p-10 max-w-lg w-full text-center">
        
        {/* Header */}
        <div className="mb-8">
          <div className="text-5xl mb-4">🛠️</div>
          <h1 className="text-3xl font-bold text-gray-800">Admin Panel</h1>
          <p className="text-gray-500">Manage web scraper operations</p>
        </div>

        {/* Buttons */}
        <div className="flex flex-col gap-5">
          {/* Run Button */}
          <button
            onClick={handleRunScraper}
            disabled={loading && isScraping}
            className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all shadow-md
              ${
                loading && isScraping
                  ? "bg-green-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-green-400 to-green-600 hover:-translate-y-1 hover:shadow-xl"
              }
            `}
          >
            {loading && isScraping ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Running...
              </div>
            ) : (
              "🚀 Run Scraper"
            )}
          </button>

          {/* Stop Button */}
          <button
            onClick={handleStopScraper}
            disabled={!isScraping || loading}
            className={`w-full py-4 rounded-xl font-semibold text-lg text-white transition-all shadow-md
              ${
                !isScraping || loading
                  ? "bg-red-300 cursor-not-allowed"
                  : "bg-gradient-to-r from-red-400 to-red-600 hover:-translate-y-1 hover:shadow-xl"
              }
            `}
          >
            {loading && !isScraping ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Stopping...
              </div>
            ) : (
              "⏹️ Stop Scraper"
            )}
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className="mt-6">
            <div
              className={`flex items-center gap-3 p-4 rounded-xl border text-left
                ${
                  message.includes("Error")
                    ? "bg-red-100 border-red-300 text-red-700"
                    : "bg-green-100 border-green-300 text-green-700"
                }
              `}
            >
              <span className="text-xl">
                {message.includes("Error") ? "❌" : "✅"}
              </span>
              <p className="font-medium">{message}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
