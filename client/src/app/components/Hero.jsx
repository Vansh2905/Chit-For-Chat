// components/Hero.jsx
"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { MessageSquare, Shield, Zap, ChevronRight, Lock } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative overflow-hidden pt-24 pb-16 lg:pt-32 lg:pb-24">
      {/* Background gradients */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="max-w-7xl mx-auto px-6 relative z-10 flex flex-col lg:flex-row items-center gap-16">
        
        {/* Left Content */}
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="w-full lg:w-1/2 flex flex-col items-start"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-semibold mb-6 border border-primary/20">
            <SparklesIcon className="w-4 h-4" />
            <span>The New Era of Messaging</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight text-foreground mb-6">
            Connect in <span className="bg-clip-text text-transparent bg-linear-to-r from-primary to-blue-600">Real Time.</span>
          </h1>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-lg leading-relaxed">
            Fast, private, and beautiful group & one-to-one chats. Start a conversation, share images, and see who's online — instant messages with minimal fuss.
          </p>

          <div className="flex flex-wrap items-center gap-4 w-full sm:w-auto">
            <Link 
              href="/Chat" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all hover:scale-105 active:scale-95 shadow-md hover:shadow-xl hover:shadow-primary/20"
            >
              Get Started
              <ChevronRight className="w-5 h-5" />
            </Link>
            <Link 
              href="/Chat" 
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-card border border-border text-foreground font-semibold hover:bg-muted transition-all"
            >
              Open Global Chat
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-y-4 gap-x-8 text-sm font-medium text-muted-foreground">
            <div className="flex items-center gap-2"><Lock className="w-4 h-4 text-primary" /> End-to-end option</div>
            <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Instant delivery</div>
            <div className="flex items-center gap-2"><MessageSquare className="w-4 h-4 text-primary" /> Typing indicators</div>
            <div className="flex items-center gap-2"><Shield className="w-4 h-4 text-primary" /> Secure data</div>
          </div>
        </motion.div>

        {/* Right Preview Box */}
        <motion.div 
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="w-full lg:w-1/2 flex justify-center lg:justify-end"
        >
          <div className="relative w-full max-w-lg">
            {/* Floating decoration elements */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -left-6 z-20 bg-card border border-border p-3 rounded-2xl shadow-xl flex items-center gap-3 backdrop-blur-md"
            >
              <div className="w-10 h-10 bg-green-500/10 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-500 rounded-full" />
              </div>
              <div>
                <div className="text-xs font-bold text-foreground">Alice is online</div>
                <div className="text-[10px] text-muted-foreground">Ready to chat</div>
              </div>
            </motion.div>

            {/* Main Chat Interface Mockup */}
            <div className="bg-card/80 backdrop-blur-xl border border-border rounded-3xl overflow-hidden shadow-2xl">
              <div className="bg-muted/50 px-4 py-3 border-b border-border flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-red-500/80" />
                    <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                    <div className="w-3 h-3 rounded-full bg-green-500/80" />
                  </div>
                  <div className="text-xs font-semibold text-muted-foreground ml-2">Team Chat</div>
                </div>
              </div>
              
              <div className="p-6 space-y-6 bg-background/50 h-[380px] flex flex-col justify-end">
                <div className="space-y-4">
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="flex flex-col items-start"
                  >
                    <div className="text-[11px] text-muted-foreground ml-1 mb-1 font-medium">Alexa • 10:32 AM</div>
                    <div className="bg-card border border-border text-foreground px-4 py-2.5 rounded-2xl rounded-bl-none shadow-sm text-sm">
                      Hey! Anyone up for a quick test? 👋
                    </div>
                  </motion.div>
                  
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 1.4 }}
                    className="flex flex-col items-end"
                  >
                    <div className="text-[11px] text-muted-foreground mr-1 mb-1 font-medium">You • 10:33 AM</div>
                    <div className="bg-primary text-primary-foreground px-4 py-2.5 rounded-2xl rounded-br-none shadow-sm text-sm">
                      Yes — testing works perfectly! The new UI looks amazing. ✨
                    </div>
                  </motion.div>

                  <motion.div 
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    transition={{ delay: 2.0 }}
                    className="flex flex-col items-start"
                  >
                    <div className="text-[11px] text-muted-foreground ml-1 mb-1 font-medium">Alexa is typing...</div>
                    <div className="bg-card border border-border px-4 py-3 rounded-2xl rounded-bl-none shadow-sm flex items-center gap-1.5 w-fit">
                      <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                      <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 bg-muted-foreground rounded-full" animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.4, delay: 0.4 }} />
                    </div>
                  </motion.div>
                </div>
              </div>
              
              <div className="p-4 bg-card/60 border-t border-border backdrop-blur-md">
                <div className="bg-muted/50 rounded-full px-4 py-2.5 text-sm font-medium text-muted-foreground/60 border border-border/50">
                  Message Team Chat...
                </div>
              </div>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}

function SparklesIcon(props) {
  return (
    <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3v18M3 12h18" opacity="0.5" />
      <path d="m8 16 8-8m-8 0 8 8" opacity="0.5" />
      <path d="m19 6-1-1-1 1 1 1ZM19 18l-1-1-1 1 1 1ZM5 6 4 5 3 6l1 1ZM5 18l-1-1-1 1 1 1Z" />
    </svg>
  );
}
