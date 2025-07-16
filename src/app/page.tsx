"use client";
import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Copy } from "lucide-react";
import { supabase } from './supabaseClient';
import Confetti from "react-confetti";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<{ english: string; urdu: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  

  // Helper to retry fetching summary from Supabase
  async function fetchSummaryWithRetry(url: string, retries = 5, delay = 1000) {
    for (let i = 0; i < retries; i++) {
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('url', url)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        return data[0];
      }
      await new Promise(res => setTimeout(res, delay));
    }
    return null;
  }

  const handleSummarise = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSummary(null);
    try {
      // Call your n8n webhook
      const res = await fetch("https://areeba19.app.n8n.cloud/webhook/summarise-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      if (!res.ok) throw new Error("Failed to summarise blog");

      // Retry fetching the summary from Supabase
      const summaryData = await fetchSummaryWithRetry(url, 5, 1000);
      if (summaryData) {
        setSummary({
          english: summaryData.summary_en,
          urdu: summaryData.summary_urdu,
        });
      } else {
        setError("Summary not found in database.");
      }
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Something went wrong");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden">
      {/* Animated Gradient Background */}
      <div className="absolute inset-0 z-0 animate-gradient bg-gradient-to-br from-blue-400 via-purple-300 to-pink-400 dark:from-gray-900 dark:via-gray-950 dark:to-gray-900 opacity-80" />
      {/* Confetti Animation */}
      {showConfetti && <Confetti width={window.innerWidth} height={window.innerHeight} recycle={false} numberOfPieces={200} />} 
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, type: "spring" }}
        className="relative z-10 w-full max-w-lg bg-white/60 dark:bg-gray-900/70 rounded-3xl shadow-2xl p-10 backdrop-blur-2xl border border-gray-200 dark:border-gray-800 flex flex-col items-center gap-6"
        style={{ boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.37)" }}
      >
        <h1 className="text-4xl font-extrabold text-center mb-4 flex items-center justify-center gap-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-600 to-pink-500">
          <Globe className="w-10 h-10 text-blue-500 animate-spin-slow" />
          Blog Summariser
        </h1>
        <form onSubmit={handleSummarise} className="flex flex-col gap-4 w-full">
          <label htmlFor="url" className="font-semibold text-gray-700 dark:text-gray-200 text-lg">
            Enter Blog URL
          </label>
          <motion.input
            whileFocus={{ scale: 1.04, boxShadow: "0 0 0 3px #a78bfa" }}
            type="url"
            id="url"
            required
            placeholder="https://example.com/blog-post"
            value={url}
            onChange={e => setUrl(e.target.value)}
            className="rounded-2xl border border-gray-300 dark:border-gray-700 px-5 py-3 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-all text-lg bg-white/80 dark:bg-gray-800/80 shadow-inner"
          />
          <motion.button
            whileTap={{ scale: 0.97 }}
            whileHover={{ scale: 1.05 }}
            type="submit"
            disabled={loading}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold py-3 rounded-2xl shadow-lg hover:from-pink-500 hover:to-purple-500 transition-all flex items-center justify-center gap-2 disabled:opacity-60 text-lg"
          >
            {loading ? <Loader2 className="animate-spin w-6 h-6" /> : "Summarise Blog"}
          </motion.button>
        </form>
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="mt-2 text-red-600 text-center font-semibold bg-red-100/80 dark:bg-red-900/60 rounded-xl px-4 py-2 shadow"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {summary && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mt-8 w-full flex justify-center"
            >
              <motion.div
                whileHover={{ scale: 1.03, boxShadow: '0 4px 24px 0 rgba(80, 80, 200, 0.10)' }}
                className="w-full max-w-2xl bg-white/90 dark:bg-gray-900/90 rounded-3xl p-8 shadow-xl border border-gray-200 dark:border-gray-800 flex flex-col gap-8 transition-all"
              >
                {/* English Summary */}
                <div>
                  <h2 className="font-bold text-2xl text-blue-700 dark:text-blue-300 mb-2">English Summary</h2>
                  <button
                    aria-label="Copy English summary"
                    onClick={() => copyToClipboard(summary.english)}
                    className="ml-auto p-2 rounded-full hover:bg-blue-100 dark:hover:bg-blue-900 transition self-end mb-2"
                  >
                    <Copy className="w-5 h-5 text-blue-500" />
                  </button>
                  <p className="text-gray-800 dark:text-gray-100 text-lg leading-relaxed whitespace-pre-line font-sans">
                    {summary.english}
                  </p>
                </div>
                {/* Urdu Summary */}
                <div>
                  <h2 className="font-bold text-2xl text-pink-700 dark:text-pink-300 mb-2">Urdu Summary</h2>
                  <button
                    aria-label="Copy Urdu summary"
                    onClick={() => copyToClipboard(summary.urdu)}
                    className="ml-auto p-2 rounded-full hover:bg-pink-100 dark:hover:bg-pink-900 transition self-end mb-2"
                  >
                    <Copy className="w-5 h-5 text-pink-500" />
                  </button>
                  <p className="text-gray-800 dark:text-gray-100 text-lg leading-relaxed whitespace-pre-line font-noto">
                    {summary.urdu}
                  </p>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      <style jsx global>{`
        @keyframes spin-slow {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 6s linear infinite;
        }
        .font-noto {
          font-family: 'Noto Nastaliq Urdu', serif;
        }
        .animate-gradient {
          background-size: 400% 400%;
          animation: gradientBG 12s ease-in-out infinite;
        }
        @keyframes gradientBG {
          0% {background-position: 0% 50%;}
          50% {background-position: 100% 50%;}
          100% {background-position: 0% 50%;}
        }
      `}</style>
    </div>
  );
}
