"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { uploadToCloudinary } from "../utils/cloudinary";
import { motion, AnimatePresence } from 'framer-motion';
import { LogOut, MessageSquare, X,Settings, User, Mail, FileText, ChevronLeft, Plus } from 'lucide-react';
import clsx from 'clsx';

const PLACEHOLDER_AVATAR = "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

export default function Profile() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const [previewImage, setPreviewImage] = useState(null);
  const [updating, setUpdating] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/Login");
      return;
    }

    if (userData) {
      const parsedUser = JSON.parse(userData);
      setUser(parsedUser);
      setName(parsedUser.name);
      setBio(parsedUser.bio || '');
    }

    setLoading(false);
  }, [router]);

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(true);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("https://chit-for-chat.onrender.com/api/users/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ name, bio }),
      });

      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data));
        setUser(data);
        alert("Profile updated successfully!");
      } else {
        alert(data.message || "Update failed");
      }
    } catch (err) {
      alert("Server error");
    } finally {
      setUpdating(false);
    }
  };
  const handleProfileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  // 1️⃣ Upload to Cloudinary
  const imageUrl = await uploadToCloudinary(file);

  const token = localStorage.getItem("token");

  // 2️⃣ Save URL to MongoDB
  const res = await fetch(
    "https://chit-for-chat.onrender.com/api/users/profile",
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ pic: imageUrl }),
    }
  );

  const updatedUser = await res.json();

  if (res.ok) {
    // 3️⃣ Update local storage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    alert("Profile updated successfully!");
  }
};

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/Login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#E5DDD5] dark:bg-[#0B141A] flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
        >
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
        </motion.div>
      </div>
    );
  }

  return (
    <div className='bg-[#E5DDD5] dark:bg-[#0B141A] min-h-screen flex items-center justify-center p-4 relative overflow-hidden'>
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="bg-card/80 backdrop-blur-xl border border-border shadow-2xl rounded-3xl p-6 sm:p-8 w-full max-w-md relative z-10"
      >
        <div className="flex justify-between items-start mb-6">
          <button
            onClick={() => router.back()}
            className="p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
            title="Go Back"
          >
            <ChevronLeft size={24} />
          </button>
          <div className="flex-1 text-center">
            <h1 className='text-2xl font-bold text-foreground flex items-center justify-center gap-2'>
              <Settings className="w-6 h-6 text-primary" />
              Profile Settings
            </h1>
          </div>
          <div className="w-10" /> {/* Spacer to balance the header */}
        </div>

        <div className="text-center mb-8 relative">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: "spring", stiffness: 200 }}
            className="relative inline-block"
          >
            <img
              src={user?.pic || PLACEHOLDER_AVATAR}
              alt="Profile"
              onClick={() => setPreviewImage(user?.pic)}
              className="w-28 h-28 rounded-full mx-auto border-4 border-background shadow-lg cursor-pointer object-cover bg-muted"
              onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
            />
            <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full shadow-md hover:scale-110 transition-transform disabled:opacity-50 cursor-pointer" title="Change Avatar (Not Implemented)">
              <Plus size={16} />
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileUpload}
                className="hidden"
              />
            </label>
          </motion.div>
        </div>

        <form onSubmit={handleUpdate} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5 ml-1">
              <User size={16} className="text-muted-foreground" />
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-muted/50 focus:bg-background border border-transparent focus:border-primary pl-4 pr-4 py-3 rounded-xl text-[15px] outline-none transition-all placeholder:text-muted-foreground text-foreground"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5 ml-1">
              <Mail size={16} className="text-muted-foreground" />
              Email
            </label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full bg-muted/30 border border-transparent pl-4 pr-4 py-3 rounded-xl text-[15px] outline-none text-muted-foreground cursor-not-allowed"
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-foreground flex items-center gap-2 mb-1.5 ml-1">
              <FileText size={16} className="text-muted-foreground" />
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full bg-muted/50 focus:bg-background border border-transparent focus:border-primary pl-4 pr-4 py-3 rounded-xl text-[15px] outline-none transition-all placeholder:text-muted-foreground text-foreground resize-none min-h-[100px]"
              rows="3"
              maxLength="200"
            />
            <p className="text-xs text-muted-foreground mt-1.5 text-right font-medium">{bio.length}/200</p>
          </div>

          <motion.button
            whileHover={{ scale: updating ? 1 : 1.02 }}
            whileTap={{ scale: updating ? 1 : 0.98 }}
            type="submit"
            disabled={updating}
            className={clsx(
              "w-full py-3.5 rounded-xl font-semibold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer",
              updating
                ? "bg-primary/50 text-primary-foreground/80 cursor-not-allowed"
                : "bg-primary text-primary-foreground hover:shadow-lg"
            )}
          >
            {updating ? (
              <>
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 border-2 border-current border-t-transparent rounded-full" />
                Updating...
              </>
            ) : "Save Changes"}
          </motion.button>
        </form>

        <div className="mt-8 pt-6 border-t border-border grid grid-cols-2 gap-4 cursor-pointer">
          <button
            onClick={() => router.push("/Chat")}
            className="w-full flex items-center justify-center gap-2 py-3 bg-muted hover:bg-muted/80 text-foreground rounded-xl font-medium transition-colors border border-border cursor-pointer"
          >
            <MessageSquare size={18} />
            <span>Go to Chat</span>
          </button>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-3 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-xl font-medium transition-colors border border-red-500/20 cursor-pointer"
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </motion.div>
<AnimatePresence>
          {previewImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 sm:p-8"
              onClick={() => setPreviewImage(null)}
            >
              <button className="absolute top-6 text-red-500 right-6 p-2 rounded-full bg-muted/50 text-foreground hover:bg-muted transition-colors cursor-pointer">
                <X size={24} />
              </button>
              <motion.img
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                src={previewImage}
                alt="Preview"
                className="max-w-full max-h-full rounded-2xl shadow-2xl object-contain border border-border"
                onClick={(e) => e.stopPropagation()}
              />
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}