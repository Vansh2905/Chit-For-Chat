"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const Profile = () => {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
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
      const res = await fetch("http://localhost:5000/api/users/profile", {
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/Login");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className='bg-gray-200 min-h-screen flex items-center justify-center p-4'>
      <div className="bg-white rounded-lg shadow-lg p-8 w-full max-w-md">
        <div className="text-center mb-6">
          <img 
            src={user?.pic} 
            alt="Profile" 
            className="w-24 h-24 rounded-full mx-auto mb-4"
          />
          <h1 className='text-2xl font-bold text-gray-800'>Profile</h1>
        </div>

        <form onSubmit={handleUpdate} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-black mb-1">
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border text-black border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              value={user?.email}
              disabled
              className="w-full p-3 text-black border border-gray-300 rounded-lg bg-gray-100"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="w-full p-3 text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              rows="3"
              maxLength="200"
            />
            <p className="text-sm text-gray-500 mt-1">{bio.length}/200</p>
          </div>

          <button
            type="submit"
            disabled={updating}
            className={`w-full p-3 rounded-lg font-semibold ${
              updating
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-500 hover:bg-blue-600"
            } text-white`}
          >
            {updating ? "Updating..." : "Update Profile"}
          </button>
        </form>

        <div className="mt-6 space-y-2">
          <button
            onClick={() => router.push("/Chat")}
            className="w-full p-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-semibold"
          >
            Go to Chat
          </button>
          
          <button
            onClick={handleLogout}
            className="w-full p-3 bg-red-500 hover:bg-red-600 text-white rounded-lg font-semibold"
          >
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default Profile;