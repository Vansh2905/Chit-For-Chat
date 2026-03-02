"use client";
import React, { useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";

export default function Signup() {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(
        "https://chit-for-chat.onrender.com/api/auth/register",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        },
      );

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/Chat";
      } else {
        alert(data.message || "Signup failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-65px)] flex items-center justify-center bg-background px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md"
      >
        <div className="bg-card border border-border rounded-3xl shadow-xl overflow-hidden mb-8">
          <div className="p-8 sm:p-10">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center">
                <UserPlus className="w-8 h-8 text-primary" />
              </div>
            </div>

            <h1 className="text-3xl font-bold text-center text-foreground mb-2 tracking-tight">
              Create an account
            </h1>
            <p className="text-center text-muted-foreground mb-8 text-sm">
              Sign up to start chatting right away
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">
                  Name
                </label>
                <input
                  type="text"
                  placeholder="Your Name"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">
                  Email
                </label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground ml-1">
                  Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-4 py-3 rounded-xl bg-muted/50 border border-transparent focus:border-primary focus:bg-background outline-none transition-all placeholder:text-muted-foreground text-foreground"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className={`w-full py-3.5 mt-4 rounded-xl font-semibold text-white transition-all shadow-md ${
                  loading
                    ? "bg-primary/70 cursor-not-allowed"
                    : "bg-primary hover:bg-primary/90 hover:shadow-lg active:scale-[0.98]"
                }`}
              >
                {loading ? "Signing up..." : "Sign Up"}
              </button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              Already have an account?{" "}
              <Link
                href="/Login"
                className="font-semibold text-primary hover:underline"
              >
                Log in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
