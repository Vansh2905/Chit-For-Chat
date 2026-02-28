// components/Footer.jsx
import Link from "next/link";
import { MessageSquare } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-card/40 backdrop-blur-sm border-t border-border mt-auto">
      <div className="max-w-7xl mx-auto px-6 py-8 md:py-12">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <MessageSquare className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg tracking-tight">Chit Chat</span>
          </div>

          <div className="flex flex-wrap justify-center gap-6 text-sm font-medium text-muted-foreground">
            <Link href="/terms" className="hover:text-primary transition-colors">Terms of Service</Link>
            <Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link>
            <Link href="https://github.com/Vansh2905" className="hover:text-primary transition-colors" target="_blank">Github</Link>
          </div>
          
        </div>
        
        <div className="border-t border-border/50 mt-8 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-muted-foreground/80">
          <p>© {new Date().getFullYear()} Chit Chat Application. All rights reserved.</p>
          <p>Built with ❤️ by Vansh Ahluwalia</p>
        </div>
      </div>
    </footer>
  );
}
