// app/page.js
import Hero from "../app/components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#E5DDD5] dark:bg-[#0B141A] text-foreground transition-colors duration-300">
      <main className="flex flex-col gap-12 sm:gap-20">
        <Hero />
        <Features />
      </main>
      <Footer />
    </div>
  );
}
