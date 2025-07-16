"use client";
import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Globe, Languages } from "lucide-react";
import { supabase } from './supabaseClient';
import Confetti from "react-confetti";

export default function Home() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState<{ english: string; urdu: string } | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  // Remove history state and useEffect
  // TODO: Replace with your Supabase client import and setup
  // import { createClient } from '@supabase/supabase-js';
  // const supabase = createClient('SUPABASE_URL', 'SUPABASE_ANON_KEY');

  // Remove AnimatePresence block that displays history

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
      // Wait for n8n to insert into Supabase, then fetch from Supabase
      const { data, error } = await supabase
        .from('summaries')
        .select('*')
        .eq('url', url)
        .order('created_at', { ascending: false })
        .limit(1);
      if (!error && data && data.length > 0) {
        setSummary({
          english: data[0].summary_en,
          urdu: data[0].summary_urdu,
        });
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
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
              className="mt-6 w-full grid grid-cols-1 md:grid-cols-2 gap-6"
            >
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-blue-100/80 to-purple-100/80 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg flex flex-col gap-2 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="text-blue-500" />
                  <span className="font-bold text-xl">English</span>
                </div>
                <p className="text-gray-800 dark:text-gray-100 text-lg whitespace-pre-line font-sans">
                  {summary.english}
                </p>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="bg-gradient-to-br from-pink-100/80 to-purple-100/80 dark:from-gray-800 dark:to-gray-900 rounded-2xl p-6 shadow-lg flex flex-col gap-2 border border-gray-200 dark:border-gray-800"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Languages className="text-pink-500" />
                  <span className="font-bold text-xl">Urdu</span>
                </div>
                <p className="text-gray-800 dark:text-gray-100 text-lg whitespace-pre-line font-noto">
                  {summary.urdu}
                </p>
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
