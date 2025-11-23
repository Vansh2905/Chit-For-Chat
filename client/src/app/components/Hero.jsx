// components/Hero.jsx
"use client";
import React from "react";
import Link from "next/link";

export default function Hero() {
  return (
    <section className="bg-linear-to-br from-blue-600 via-indigo-600 to-purple-700 text-white">
      <div className="max-w-6xl mx-auto px-6 py-20 flex flex-col-reverse lg:flex-row items-center gap-10">
        <div className="w-full lg:w-1/2">
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight">
            Chit-For-Chat — chat in real time.
          </h1>
          <p className="mt-4 text-lg text-blue-100/90">
            Fast, private, and beautiful group & one-to-one chats. Start a conversation, share images,
            and see who's online — instant messages with minimal fuss.
          </p>

          <div className="mt-6 flex gap-3">
            <Link href="/Chat" className="px-6 py-3 rounded-md bg-white text-blue-600 font-semibold hover:scale-[1.01]">
              Get Started — Free
            </Link>
            <Link href="/Chat" className="px-6 py-3 rounded-md border border-white/30 text-white hover:bg-white/10">
              Open Global Chat
            </Link>
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-2 text-sm text-blue-100">
            <li>• End-to-end option</li>
            <li>• Typing indicators</li>
            <li>• Read receipts</li>
            <li>• File & image sharing</li>
          </ul>
        </div>

        <div className="w-full lg:w-1/2 flex justify-center">
          <div className="w-full max-w-md p-4 bg-white/10 rounded-2xl backdrop-blur-md ring-1 ring-white/10">
            <div className="mb-3 text-sm text-white/80">Live preview</div>

            <div className="bg-white rounded-lg p-3 shadow-md">
              <div className="space-y-2">
                <div className="text-xs text-slate-400">Alexa• 10:32 AM</div>
                <div className="px-3 py-2 bg-blue-600 text-white rounded-lg inline-block">Hey — anyone up for a quick test?</div>
                <div className="text-xs text-slate-400 mt-3">Alex • 10:33 AM</div>
                <div className="px-3 py-2 bg-gray-100 rounded-lg inline-block text-slate-800">Yes — testing works!</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
