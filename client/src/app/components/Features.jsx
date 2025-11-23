import React from "react";
const features = [
  { title: "Real-time messaging", desc: "Socket.IO-based live chat — instant messages." },
  { title: "Typing & Read", desc: "See when someone is typing or has read your message." },
  { title: "Media sharing", desc: "Send images and attachments easily." },
  { title: "Secure", desc: "JWT auth and optional end-to-end options." }
];

export default function Features() {
  return (
    <section className="py-16 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <h2 className="text-2xl font-semibold mb-6 text-slate-800">Core features</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f) => (
            <div key={f.title} className="p-6 border rounded-lg hover:shadow-lg transition">
              <h3 className="font-semibold mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
