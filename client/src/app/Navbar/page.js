"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { MessageSquare, Home, LogOut, User as UserIcon } from "lucide-react";
import { useRouter } from "next/navigation";

const PLACEHOLDER_AVATAR = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

useEffect(() => {
  const storedUser = localStorage.getItem("user");
  if (storedUser) {
    setCurrentUser(JSON.parse(storedUser));
  }
}, []);
  const Router = useRouter();

  useEffect(() => {
    try {
      const token = typeof window !== "undefined" && localStorage.getItem("token");
      setIsLoggedIn(!!token);
    } catch (err) {
      setIsLoggedIn(false);
    } finally {
      setLoaded(true);
    }
  }, []);

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      setIsLoggedIn(false);
      Router.push("/Login");
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 dark:bg-zinc-900/70 border-b border-border shadow-xs px-6 py-3 flex justify-between items-center transition-colors duration-300">
      <Link href="/" className="flex items-center gap-2 group">
        <div className="p-2 bg-primary text-primary-foreground rounded-xl group-hover:scale-105 transition-transform shadow-sm">
          <MessageSquare size={20} className="fill-current" />
        </div>
        <span className="text-xl font-bold tracking-tight text-foreground">
          Chit-For-Chat
        </span>
      </Link>

      <div className="flex items-center gap-3 md:gap-5">
        <Link 
          href="/" 
          className="p-2 rounded-full text-muted-foreground hover:text-primary hover:bg-muted transition-colors"
          title="Home"
        >
          <Home size={22} />
        </Link>

        {!loaded ? (
          <div className="w-8 h-8 rounded-full bg-muted animate-pulse" />
        ) : isLoggedIn ? (
          <div className="flex items-center gap-3 bg-muted/50 rounded-full pr-1 pl-3 py-1 border border-border/50">
            <Link href="/Profile" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
               <span className="text-sm font-medium hidden sm:block">You</span>
               <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-primary/20 bg-background">
                <img
                  src={currentUser?.pic || PLACEHOLDER_AVATAR}
                  alt="Profile"
                  className="w-full h-full object-cover"
                  onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
                />
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="p-1.5 rounded-full text-muted-foreground hover:bg-red-50 hover:text-red-500 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
              title="Logout"
            >
              <LogOut size={18} />
            </button>
          </div>
        ) : (
          <div className="flex gap-2">
            <Link 
              href="/Login" 
              className="px-4 py-2 text-sm font-medium rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm cursor-pointer"
            >
              Log in
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
