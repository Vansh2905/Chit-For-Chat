// app/page.js
import Hero from "../app/components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-white text-slate-900">
      <main>
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
