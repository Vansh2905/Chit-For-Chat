// app/chat/page.js
"use client";
import React, { useEffect, useRef, useState } from "react";
import { IoSend, IoCamera, IoEllipse, IoChatbubbleOutline } from "react-icons/io5";
import { useRouter } from "next/navigation";
import io from "socket.io-client";

const PLACEHOLDER_AVATAR = "/mnt/data/17bcbcb1-cd40-454d-9de4-0c6bc301c056.png";

function formatTime(ts) {
  try {
    return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1">
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.15s" }} />
      <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0.3s" }} />
    </div>
  );
}

export default function Chat() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [socket, setSocket] = useState(null);
  const [typingText, setTypingText] = useState("");
  const [unreadCounts, setUnreadCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const messagesRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    if (!token) {
      router.push("/login");
      return;
    }
    if (userData) {
      const parsed = JSON.parse(userData);
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
    // auto-scroll when messages change
    messagesRef.current?.scrollTo({
      top: messagesRef.current?.scrollHeight || 0,
      behavior: "smooth",
    });
  }, [messages]);

  const initSocket = (userData) => {
    const s = io("http://localhost:5000", { transports: ["websocket", "polling"] });
    setSocket(s);

    s.on("connect", () => {
      s.emit("user_online", userData._id);
    });

    s.on("receive_message", (message) => {
      // message.chatId may be an object or id string, handle both
      const msgChatId = message.chatId?._id || message.chatId;
      if (currentChat && msgChatId === currentChat._id) {
        setMessages((m) => [...m, message]);
      } else {
        // increment unread for the chat's other participant(s)
        const senderId = message.sender?._id || message.sender;
        setUnreadCounts((prev) => ({ ...prev, [senderId]: (prev[senderId] || 0) + 1 }));
      }
      // show desktop notification when hidden
      if (document.hidden && Notification.permission === "granted") {
        try {
          const n = new Notification(`${message.sender?.name || "New message"}`, {
            body: message.content || "Sent an attachment",
            icon: (message.sender && message.sender.pic) || PLACEHOLDER_AVATAR,
          });
          n.onclick = () => (window.focus(), n.close());
          setTimeout(() => n.close(), 4000);
        } catch {}
      }
    });

    s.on("user_typing", (payload) => {
      setTypingText(`${payload.userName} is typing...`);
      setTimeout(() => setTypingText(""), 1800);
    });

    s.on("user_stop_typing", () => setTypingText(""));

    return () => {
      s.disconnect();
    };
  };

  const fetchUsers = async (token) => {
    try {
      const res = await fetch("http://localhost:5000/api/users", {
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
    setUnreadCounts((prev) => ({ ...prev, [chatUser._id]: 0 }));
    // create or get chat
    const token = localStorage.getItem("token");
    const res = await fetch("http://localhost:5000/api/chats", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ userId: chatUser._id }),
    });
    const chat = await res.json();
    if (res.ok) {
      setCurrentChat(chat);
      fetchMessages(chat._id);
      socket?.emit("join_chat", { _id: user._id, chatId: chat._id, name: user.name });
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/messages/${chatId}`, {
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
    // optimistic UI
    setMessages((m) => [
      ...m,
      { ...payload, createdAt: new Date().toISOString(), sender: { _id: user._id, name: user.name, pic: user.pic } },
    ]);
    setNewMessage("");
    inputRef.current?.focus();
  };

  const onTyping = () => {
    if (!socket || !currentChat) return;
    socket.emit("typing_start", { userId: user._id, userName: user.name, chatId: currentChat._id });
    clearTimeout(window._typingTimeout);
    window._typingTimeout = setTimeout(() => {
      socket.emit("typing_stop", { userId: user._id, chatId: currentChat._id });
    }, 900);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-gray-600">Loading chat...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-linear-to-b from-slate-50 to-white">
      {/* Sidebar */}
      <aside className="w-full lg:w-80 border-r bg-white shadow-sm">
        <div className="p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-linear-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-bold">
              CF
            </div>
            <div>
              <div className="text-sm font-semibold text-slate-700">Chit-For-Chat</div>
              <div className="text-xs text-slate-400">Real-time conversations</div>
            </div>
          </div>
          <div>
            <button
              className="text-sm bg-blue-600 text-white px-3 py-1 rounded-md hover:bg-blue-700"
              onClick={() => router.push("/Profile")}
            >
              Profile
            </button>
          </div>
        </div>

        <div className="px-4 pb-3">
          <div className="relative">
            <input
              placeholder="Search users..."
              className="w-full px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-sm text-black"
              onChange={(e) => {
                const q = e.target.value.toLowerCase();
                fetchUsers(localStorage.getItem("token")).then(() => {
                  setUsers((prev) => prev.filter((u) => u.name.toLowerCase().includes(q)));
                });
              }}
            />
            <div className="absolute right-3 top-2 text-slate-400">
              <IoChatbubbleOutline />
            </div>
          </div>
        </div>

        <div className="px-2 space-y-1 overflow-y-auto" style={{ maxHeight: "calc(100vh - 220px)" }}>
          {users.length === 0 && <div className="p-4 text-sm text-slate-400">No users found</div>}

          {users.map((u) => {
            const unread = unreadCounts[u._id] || 0;
            return (
              <div
                key={u._id}
                onClick={() => openChat(u)}
                className={`flex items-center justify-between gap-3 p-3 rounded-lg cursor-pointer hover:bg-slate-50 transition ${
                  selectedUser?._id === u._id ? "bg-blue-50" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <img
                    src={u.pic || PLACEHOLDER_AVATAR}
                    alt={u.name}
                    className="w-12 h-12 rounded-full object-cover ring-1 ring-slate-100"
                  />
                  <div>
                    <div className="text-sm font-medium text-slate-700">{u.name}</div>
                    <div className="text-xs text-slate-400">
                      {u.isOnline ? (
                        <span className="flex items-center gap-2">
                          <span className="w-2 h-2 bg-green-500 rounded-full inline-block" />
                          Online
                        </span>
                      ) : (
                        `Last seen ${u.lastSeen ? new Date(u.lastSeen).toLocaleDateString() : "—"}`
                      )}
                    </div>
                  </div>
                </div>

                {unread > 0 && (
                  <div className="min-w-[26px] h-6 px-2 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
                    {unread > 99 ? "99+" : unread}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t">
          <div className="text-xs text-slate-500">Online: {users.filter(u => u.isOnline).length}</div>
        </div>
      </aside>

      {/* Main chat panel */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-white">
          {selectedUser ? (
            <div className="flex items-center gap-3">
              <img src={selectedUser.pic || PLACEHOLDER_AVATAR} alt={selectedUser.name} className="w-11 h-11 rounded-full object-cover" />
              <div>
                <div className="text-sm font-semibold text-slate-800">{selectedUser.name}</div>
                <div className="text-xs text-slate-400">{selectedUser.isOnline ? "Online" : `Last seen ${selectedUser.lastSeen ? new Date(selectedUser.lastSeen).toLocaleString() : "—"}`}</div>
              </div>
            </div>
          ) : (
            <div className="text-slate-500">Select a user to start chatting</div>
          )}

          <div className="flex items-center gap-3">
            <div className="text-xs text-slate-500">{selectedUser ? (users.find(u => u._id === selectedUser._id)?.status || "") : ""}</div>
            <button className="text-slate-600 hover:text-slate-800">⋯</button>
          </div>
        </div>

        {/* Messages list */}
        <div ref={messagesRef} className="flex-1 p-4 overflow-y-auto space-y-4 bg-linear-to-b from-white to-slate-50">
          {!selectedUser && (
            <div className="h-full flex items-center justify-center">
              <div className="text-center text-slate-400">
                <div className="mb-2 text-2xl">Welcome to Chit-For-Chat</div>
                <div>Choose a user from the left to begin</div>
              </div>
            </div>
          )}

          {selectedUser && messages.map((msg, idx) => {
            const isMine = msg.sender?._id === user?._id;
            const prev = messages[idx - 1];
            const showAvatar = !prev || prev.sender?._id !== msg.sender?._id;
            return (
              <div key={msg._id || idx} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                <div className={`flex items-end ${isMine ? "flex-row-reverse" : ""} gap-3 max-w-[78%]`}>
                  {showAvatar && !isMine && (
                    <img src={msg.sender?.pic || PLACEHOLDER_AVATAR} alt={msg.sender?.name} className="w-8 h-8 rounded-full object-cover" />
                  )}

                  <div>
                    <div className={`px-4 py-2 rounded-2xl shadow-sm ${isMine ? "bg-blue-600 text-white" : "bg-white text-slate-800 border"}`}>
                      {msg.messageType === "image" && msg.imageUrl ? (
                        <img src={msg.imageUrl} alt="image" className="max-w-full rounded-md mb-2" />
                      ) : null}
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                    <div className={`text-xs mt-1 ${isMine ? "text-right text-slate-300" : "text-left text-slate-400"}`}>
                      {formatTime(msg.createdAt)}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          {/* typing */}
          {typingText && (
            <div className="text-sm text-slate-500">
              <TypingDots /> <span className="ml-2 text-slate-600">{typingText}</span>
            </div>
          )}

        </div>

        {/* Input area */}
        <div className="p-4 border-t bg-white">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <label className="p-2 rounded-lg bg-slate-100 cursor-pointer hover:bg-slate-200">
              <IoCamera size={20} className="text-slate-600" />
              <input type="file" accept="image/*" className="hidden" />
            </label>

            <input
              ref={inputRef}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              onInput={onTyping}
              placeholder={selectedUser ? `Message ${selectedUser.name}...` : "Select a user to chat"}
              className="flex-1 px-4 py-3 rounded-full border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-200 text-slate-800"
              disabled={!selectedUser}
            />

            <button
              onClick={sendMessage}
              className={`p-3 rounded-full ${selectedUser ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-slate-200 text-slate-400 cursor-not-allowed"}`}
              aria-label="Send"
            >
              <IoSend size={18} />
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
