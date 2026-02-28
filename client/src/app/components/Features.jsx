"use client";
import React from "react";
import { motion } from "framer-motion";
import { Zap, Eye, Image as ImageIcon, ShieldCheck } from "lucide-react";

const features = [
  { 
    title: "Real-time messaging", 
    desc: "Lightning fast Socket.IO-based live chat — no refreshing required.",
    icon: Zap,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10"
  },
  { 
    title: "Read Receipts & Typing", 
    desc: "Always know when someone is typing or hasn't read your message.",
    icon: Eye,
    color: "text-blue-500",
    bg: "bg-blue-500/10"
  },
  { 
    title: "Seamless Media Sharing", 
    desc: "Send high-quality images and attachments with one simple click.",
    icon: ImageIcon,
    color: "text-purple-500",
    bg: "bg-purple-500/10"
  },
  { 
    title: "Enterprise Grade Security", 
    desc: "Robust JWT authentication and optional end-to-end encryption features.",
    icon: ShieldCheck,
    color: "text-green-500",
    bg: "bg-green-500/10"
  }
];

export default function Features() {
  return (
    <section className="py-20 relative z-10 w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-sm font-bold tracking-wider text-primary uppercase mb-2">Capabilities</h2>
          <h3 className="text-3xl md:text-5xl font-extrabold text-foreground mb-4">Everything you need to connect.</h3>
          <p className="text-muted-foreground text-lg">We've built all the core features you'd expect from a high-end application, wrapped in a beautiful interface.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ delay: i * 0.1, duration: 0.5 }}
              key={f.title} 
              className="bg-card/80 backdrop-blur-xl border border-border p-8 rounded-3xl hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-2 transition-all duration-300 group cursor-default"
            >
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-6 transition-colors ${f.bg} group-hover:bg-primary/20`}>
                <f.icon className={`w-7 h-7 ${f.color} group-hover:text-primary transition-colors`} />
              </div>
              <h4 className="text-xl font-bold text-foreground mb-3">{f.title}</h4>
              <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
