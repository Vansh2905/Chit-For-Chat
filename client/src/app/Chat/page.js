// app/chat/page.js
"use client";
import React, { useEffect, useRef, useState, useMemo } from "react";
import { Send, Camera, X, MessageSquare, Search, MoreVertical, Paperclip, ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import io from "socket.io-client";
import { uploadToCloudinary } from "../utils/cloudinary";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";

const PLACEHOLDER_AVATAR =
  "https://icon-library.com/images/anonymous-avatar-icon/anonymous-avatar-icon-25.jpg";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 px-3 py-2 bg-muted rounded-2xl w-fit">
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut" }}
        className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.2 }}
        className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
      />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ repeat: Infinity, duration: 1.2, ease: "easeInOut", delay: 0.4 }}
        className="w-1.5 h-1.5 bg-muted-foreground rounded-full"
      />
    </div>
  );
}

export default function Chat() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [userName, setUserName] = useState("");
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);
  const [showChatSearch, setShowChatSearch] = useState(false);
  const [chatSearchQuery, setChatSearchQuery] = useState("");
  useEffect(() => {
    if (previewImage) {
      document.body.classList.add("image-preview-active");
    } else {
      document.body.classList.remove("image-preview-active");
    }

    return () => {
      document.body.classList.remove("image-preview-active");
    };
  }, [previewImage]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/Login");
      return;
    }
    if (userData) {
      const parsed = JSON.parse(userData);
      setUserName(parsed.name);
      setUser(parsed);
      fetchUsers(token);
      initSocket(parsed);
    } else {
      setLoading(false);
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typingText]);

  const initSocket = (userData) => {
    const s = io("https://chit-for-chat.onrender.com", {
      transports: ["websocket", "polling"],
    });
    setSocket(s);

    s.on("connect", () => {
      s.emit("user_online", userData._id);
    });

    s.on("receive_message", (message) => {
      const msgChatId = message.chatId?._id || message.chatId;
      if (currentChat && msgChatId === currentChat._id) {
        setMessages((m) => [...m, message]);
      } else {
        const senderId = message.sender?._id || message.sender;
        setUnreadCounts((prev) => ({
          ...prev,
          [senderId]: (prev[senderId] || 0) + 1,
        }));
      }
      if (document.hidden && Notification.permission === "granted") {
        try {
          const n = new Notification(`${message.sender?.name || "New message"}`, {
            body: message.content || "Sent an attachment",
            icon: (message.sender && message.sender.pic) || PLACEHOLDER_AVATAR,
          });
          n.onclick = () => (window.focus(), n.close());
          setTimeout(() => n.close(), 4000);
        } catch { }
      }
    });

    s.on("user_typing", (payload) => {
      setTypingText(`${payload.userName} is typing...`);
      clearTimeout(window._typingClearTimeout);
      window._typingClearTimeout = setTimeout(() => setTypingText(""), 2000);
    });

    s.on("user_stop_typing", () => setTypingText(""));

    return () => s.disconnect();
  };

  const fetchUsers = async (token) => {
    try {
      const res = await fetch("https://chit-for-chat.onrender.com/api/users", {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const openChat = async (chatUser) => {
    setSelectedUser(chatUser);
    setShowSidebarOnMobile(false);
    setUnreadCounts((prev) => ({ ...prev, [chatUser._id]: 0 }));

    const token = localStorage.getItem("token");
    const res = await fetch("https://chit-for-chat.onrender.com/api/chats", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ userId: chatUser._id }),
    });
    const chat = await res.json();
    if (res.ok) {
      setCurrentChat(chat);
      fetchMessages(chat._id);
      socket?.emit("join_chat", {
        _id: user._id,
        chatId: chat._id,
        name: user.name,
      });
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`https://chit-for-chat.onrender.com/api/messages/${chatId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) setMessages(data);
    } catch (err) {
      console.error(err);
    }
  };

  const sendMessage = () => {
    if (!newMessage.trim() || !socket || !currentChat) return;
    const payload = {
      sender: user._id,
      content: newMessage.trim(),
      chatId: currentChat._id,
    };
    socket.emit("send_message", payload);
    setMessages((m) => [
      ...m,
      {
        ...payload,
        createdAt: new Date().toISOString(),
        sender: { _id: user._id, name: user.name, pic: user.pic },
      },
    ]);
    setNewMessage("");
    socket.emit("typing_stop", { userId: user._id, chatId: currentChat._id });
    inputRef.current?.focus();
  };

  const handleImageUpload = async (file) => {
    if (!file || !currentChat) return;
    setUploading(true);
    try {
      const imageUrl = await uploadToCloudinary(file);
      socket.emit("send_message", {
        sender: user._id,
        content: "Image",
        chatId: currentChat._id,
        messageType: "image",
        imageUrl,
      });
      setMessages((m) => [
        ...m,
        {
          sender: { _id: user._id, name: user.name, pic: user.pic },
          content: "Image",
          chatId: currentChat._id,
          messageType: "image",
          imageUrl,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (error) {
      console.error("Upload failed:", error);
    } finally {
      setUploading(false);
    }
  };

  const onTyping = () => {
    if (!socket || !currentChat) return;
    socket.emit("typing_start", {
      userId: user._id,
      userName: user.name,
      chatId: currentChat._id,
    });
    clearTimeout(window._typingTimeout);
    window._typingTimeout = setTimeout(() => {
      socket.emit("typing_stop", { userId: user._id, chatId: currentChat._id });
    }, 1500);
  };

  const filteredUsers = useMemo(() => {
    if (!searchQuery) return users;
    return users.filter((u) => u.name.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [users, searchQuery]);

  if (loading) {
    return (
      <div className="h-[calc(100vh-65px)] flex items-center justify-center bg-background">
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
    <div className="h-[calc(100vh-65px)] flex bg-background overflow-hidden relative">
      {/* Sidebar */}
      <aside
        className={clsx(
          "w-full md:w-[320px] lg:w-[380px] h-full flex flex-col bg-card/80 backdrop-blur-xl border-r border-border shrink-0 transition-all duration-300 absolute md:static z-20",
          (!showSidebarOnMobile || previewImage) && "max-md:-translate-x-full", previewImage && "md:hidden"
        )}
      >
        <div className="p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h1 className="text-xl font-semibold tracking-tight text-foreground">Chats</h1>
          </div>

          <div className="relative group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <input
              placeholder="Search or start new chat"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-muted/50 focus:bg-background border border-transparent focus:border-border pl-9 pr-4 py-2 rounded-xl text-sm outline-none transition-all placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 hover-scrollbar">
          {filteredUsers.length === 0 && (
            <div className="p-4 text-center text-sm text-muted-foreground mt-10">
              No users found matching your search.
            </div>
          )}

          <AnimatePresence>
            {filteredUsers.map((u) => {
              const unread = unreadCounts[u._id] || 0;
              const isSelected = selectedUser?._id === u._id;

              return (
                <motion.div
                  key={u._id}
                  layoutId={`user-${u._id}`}
                  onClick={() => openChat(u)}
                  className={clsx(
                    "flex items-center gap-3 p-3 mb-1 rounded-xl cursor-pointer transition-all duration-200 border border-transparent",
                    isSelected
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "hover:bg-muted"
                  )}
                >
                  <div className="relative">
                    <img
                      src={u.pic && u.pic !== "default-avatar.png" ? u.pic : PLACEHOLDER_AVATAR}
                      alt={u.name}
                      className="w-12 h-12 rounded-full object-cover shrink-0 bg-background"
                      onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
                    />
                    {u.isOnline && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-background rounded-full" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-0.5">
                      <h3 className={clsx("text-sm font-semibold truncate", isSelected ? "text-primary-foreground" : "text-foreground")}>
                        {u.name}
                      </h3>
                      {!isSelected && u.lastSeen && (
                        <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
                          {new Date(u.lastSeen).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      )}
                    </div>
                    <p className={clsx(
                      "text-xs truncate",
                      isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                    )}>
                      {u.isOnline ? "Online now" : "Offline"}
                    </p>
                  </div>

                  {unread > 0 && (
                    <div className={clsx(
                      "min-w-5 h-5 px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0",
                      isSelected ? "bg-background text-primary" : "bg-primary text-primary-foreground"
                    )}>
                      {unread > 99 ? "99+" : unread}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </aside>

      {/* Main Chat Panel */}
      <main className="flex-1 flex flex-col min-w-0 h-full bg-[#E5DDD5] dark:bg-[#0B141A] relative z-10 w-full">
        {/* Empty State */}
        {!selectedUser ? (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-background/95 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
            >
              <MessageSquare className="w-10 h-10 text-primary" />
            </motion.div>
            <h2 className="text-2xl font-bold text-foreground mb-2">Chit-For-Chat for Web</h2>
            <p className="text-muted-foreground max-w-md">
              Select a chat from the sidebar to start messaging. Send photos, text, and connect in real-time.
            </p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="h-[60px] px-4 flex items-center justify-between bg-card text-card-foreground shadow-xs shrink-0 z-10">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setShowSidebarOnMobile(true)}
                  className="md:hidden p-2 -ml-2 rounded-full hover:bg-muted text-muted-foreground"
                >
                  <ChevronLeft size={24} />
                </button>
                <div className="relative">
                  <img
                    src={selectedUser.pic || PLACEHOLDER_AVATAR}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full object-cover shrink-0 cursor-pointer"
                    onError={(e) => { e.target.src = PLACEHOLDER_AVATAR; }}
                  />
                  {selectedUser.isOnline && (
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-card rounded-full" />
                  )}
                </div>
                <div className="flex flex-col cursor-pointer">
                  <span className="text-sm font-semibold">{selectedUser.name}</span>
                  <span className="text-xs text-muted-foreground">
                    {selectedUser.isOnline ? "Online" : "Offline"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    if (showChatSearch) {
                      setChatSearchQuery("");
                    }
                    setShowChatSearch((prev) => !prev);
                  }}
                  className="p-2 rounded-full hover:bg-muted text-muted-foreground transition-colors cursor-pointer"
                >
                  {showChatSearch ? <X size={20} /> : <Search size={20} />}
                </button>
              </div>
            </header>
            <AnimatePresence>
              {showChatSearch && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeInOut" }}
                  className="px-4 py-2 bg-card border-b border-border overflow-hidden"
                >
                  <input
                    type="text"
                    placeholder="Search in chat..."
                    value={chatSearchQuery}
                    onChange={(e) => setChatSearchQuery(e.target.value)}
                    className="w-full px-4 py-2 rounded-xl bg-muted outline-none text-[15px] border border-transparent focus:bg-background focus:border-border transition-all placeholder:text-muted-foreground"
                  />
                </motion.div>
              )}
            </AnimatePresence>
            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 hover-scrollbar">
              {messages.map((msg, idx) => {
                const isMine = msg.sender?._id === user?._id;
                const prev = messages[idx - 1];
                const showSpacer = prev && prev.sender?._id !== msg.sender?._id;

                return (
                  <motion.div
                    key={msg._id || idx}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                    className={clsx("flex flex-col", isMine ? "items-end" : "items-start", showSpacer && "mt-6")}
                  >
                    <div className={clsx(
                      "relative max-w-[85%] md:max-w-[70%] rounded-2xl shadow-xs whitespace-pre-wrap break-words",
                      msg.messageType === "image" ? "p-1" : "px-4 py-2.5",
                      isMine
                        ? "bg-primary text-primary-foreground rounded-br-none"
                        : "bg-card text-card-foreground rounded-bl-none"
                    )}>
                      {msg.messageType === "image" && msg.imageUrl ? (
                        <div className="relative group">
                          <img
                            src={msg.imageUrl}
                            alt="Attachment"
                            className="max-w-full sm:max-w-[320px] max-h-80 rounded-xl cursor-zoom-in hover:opacity-95 transition-opacity object-cover"
                            onClick={() => setPreviewImage(msg.imageUrl)}
                          />
                          <div className="absolute bottom-1.5 right-1.5 bg-black/50 backdrop-blur-md text-white text-[10px] px-2 py-0.5 rounded-full font-medium">
                            {formatTime(msg.createdAt)}
                          </div>
                        </div>
                      ) : (
                        <>
                          <span className="text-[15px] leading-relaxed block">
                            {chatSearchQuery &&
                              msg.content?.toLowerCase().includes(chatSearchQuery.toLowerCase()) ? (
                              <span className="bg-yellow-200 dark:bg-yellow-400 text-black px-1 rounded">
                                {msg.content}
                              </span>
                            ) : (
                              msg.content
                            )}
                          </span>
                          <div className={clsx(
                            "text-[10px] mt-1 text-right font-medium",
                            isMine ? "text-primary-foreground/70" : "text-muted-foreground"
                          )}>
                            {formatTime(msg.createdAt)}
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                );
              })}

              {typingText && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex justify-start mb-4"
                >
                  <TypingIndicator />
                </motion.div>
              )}
              <div ref={messagesEndRef} className="h-2" />
            </div>

            {/* Message Input Container */}
            <div className="p-3 sm:p-4 bg-card shrink-0">
              {uploading && (
                <div className="absolute top-[-30px] left-1/2 -translate-x-1/2 bg-background shadow-md backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold text-primary animate-pulse z-20">
                  Sending image...
                </div>
              )}
              <div className="max-w-4xl mx-auto flex items-end gap-2 bg-muted/50 rounded-3xl p-1.5 md:p-2 border border-border focus-within:border-primary/50 focus-within:bg-background transition-all">
                <div className="flex shrink-0">
                  <label className="p-2 sm:p-2.5 rounded-full cursor-pointer hover:bg-muted text-muted-foreground transition-colors group">
                    <Paperclip size={20} className="group-hover:text-primary transition-colors" />
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleImageUpload(file);
                          e.target.value = "";
                        }
                      }}
                    />
                  </label>
                </div>

                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      sendMessage();
                    }
                  }}
                  onInput={(e) => {
                    onTyping();
                    e.target.style.height = "auto";
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                  }}
                  placeholder="Message"
                  className="flex-1 max-h-[120px] min-h-[40px] bg-transparent border-0 focus:ring-0 resize-none py-2.5 px-2 text-[15px] outline-none placeholder:text-muted-foreground"
                  rows={1}
                />

                <button
                  onClick={sendMessage}
                  disabled={!newMessage.trim() && !uploading}
                  className={clsx(
                    "p-2.5 rounded-full shrink-0 transition-all duration-200 shadow-sm",
                    newMessage.trim()
                      ? "bg-primary text-primary-foreground hover:scale-105 active:scale-95"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  <Send size={18} className={clsx(newMessage.trim() && "ml-0.5")} />
                </button>
              </div>
            </div>
          </>
        )}

        {/* Image Preview Modal */}
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
      </main>
    </div>
  );
}
