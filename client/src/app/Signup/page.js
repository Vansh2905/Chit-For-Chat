"use client";
import React, { useState } from "react";
import Link from "next/link";

const Signup = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("https://chit-for-chat.onrender.com/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(`Welcome to chit-for-chat👋`);
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data));
        window.location.href = "/Chat";
      } else {
        alert(data.message || "Login failed");
      }
    } catch (err) {
      console.error(err);
      alert("Server error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-200 p-4">
      {/* Glass card */}
      <div className="bg-blue-300/10 backdrop-blur-lg border border-white/20 rounded-3xl shadow-xl p-10 w-full max-w-md text-center text-white">
        {/* Logo / Title */}
        <h1 className="text-4xl text-black font-extrabold mb-2">
          Welcome to chat
        </h1>
        <p className="text-gray-600 mb-8 font-semibold">
          signup to start chatting
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 text-left">
          <div>
            <label className="block text-sm mb-1 text-black">Name</label>
            <input
              type="name"
              placeholder="Enter your name"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-black"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-black">Email</label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-black"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm mb-1 text-black">Password</label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full p-3 rounded-lg bg-white/20 border border-white/30 focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder-gray-400 text-black"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full p-3 mt-4 rounded-lg font-semibold text-lg hover:cursor-pointer transition-all ${
              loading
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600 active:scale-95"
            }`}
          >
            {loading ? "Logging in..." : "Signup"}
          </button>
        </form>
        <p className="mt-6 text-black">
          Already have an account?{" "}
          <Link href="/Login" className="text-blue-500 hover:underline">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Signup;
