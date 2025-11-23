"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { IoMdHome } from "react-icons/io";
import { useRouter } from "next/navigation";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loaded, setLoaded] = useState(false); 
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
      setIsLoggedIn(false);
      Router.push("/Login");
    }
  };

  return (
    <div className="bg-blue-600 flex justify-between items-center px-4 py-2 shadow-md">
      <Link href="/" className="text-white text-xl font-bold">
        Chit-For-Chat
      </Link>

      <div className="flex items-center gap-4">
        <Link href="/" className="text-white text-2xl hover:scale-110 transition-transform">
          <IoMdHome />
        </Link>

        {!loaded ? (
          <div className="w-20 h-6 bg-blue-500 rounded animate-pulse" />
        ) : isLoggedIn ? (
          <>
            <Link href="/Profile">
              <div className="w-8 h-8 bg-white rounded-full overflow-hidden cursor-pointer">
                <img
                  src="/default-avatar.png"
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
            </Link>

            <button
              onClick={handleLogout}
              className="ml-2 text-black bg-blue-100 px-2 py-1 rounded-xl hover:bg-red-500 hover:text-white transition hover:cursor-pointer"
            >
              Logout
            </button>
          </>
        ) : (
          <Link href="/Login" className="text-black bg-blue-100 px-2 py-1 rounded-xl hover:bg-gray-200 transition">
            Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default Navbar;
