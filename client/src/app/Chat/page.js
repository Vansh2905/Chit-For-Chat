"use client";
import React, { useState, useEffect, useRef } from 'react';
import { IoSend } from "react-icons/io5";
import { useRouter } from 'next/navigation';
import io from 'socket.io-client';

const Chat = () => {
  const [user, setUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [typing, setTyping] = useState('');
  const [socket, setSocket] = useState(null);
  const messagesEndRef = useRef(null);
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
      fetchUsers(token);
      initSocket(parsedUser);
    }
    
    setLoading(false);
  }, [router]);

  const initSocket = (userData) => {
    const newSocket = io('http://localhost:5000');
    setSocket(newSocket);

    newSocket.on('connect', () => {
      newSocket.emit('user_online', userData._id);
    });

    newSocket.on('receive_message', (message) => {
      setMessages(prev => [...prev, message]);
    });

    newSocket.on('user_typing', (data) => {
      setTyping(`${data.userName} is typing...`);
      setTimeout(() => setTyping(''), 3000);
    });

    newSocket.on('user_stop_typing', () => {
      setTyping('');
    });

    return () => newSocket.close();
  };

  const fetchUsers = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/users', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const createOrGetChat = async (userId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch('http://localhost:5000/api/chats', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId })
      });
      
      const chat = await res.json();
      if (res.ok) {
        setCurrentChat(chat);
        fetchMessages(chat._id);
        if (socket) {
          socket.emit('join_chat', { _id: user._id, chatId: chat._id, name: user.name });
        }
      }
    } catch (error) {
      console.error('Error creating chat:', error);
    }
  };

  const fetchMessages = async (chatId) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:5000/api/messages/${chatId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok) {
        setMessages(data);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const sendMessage = () => {
    if (newMessage.trim() && socket && currentChat) {
      socket.emit('send_message', {
        sender: user._id,
        content: newMessage,
        chatId: currentChat._id
      });
      setNewMessage('');
    }
  };

  const handleTyping = () => {
    if (socket && currentChat) {
      socket.emit('typing_start', {
        userId: user._id,
        userName: user.name,
        chatId: currentChat._id
      });
      
      setTimeout(() => {
        socket.emit('typing_stop', {
          userId: user._id,
          chatId: currentChat._id
        });
      }, 1000);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex bg-gray-100">
      {/* Sidebar - Users List */}
      <div className="w-1/3 bg-white border-r border-gray-300">
        <div className="p-4 border-b border-gray-300">
          <div className="flex items-center justify-between">
            <h2 className="text-xl text-black font-semibold">Chats</h2>
            <button
              onClick={() => router.push('/Profile')}
              className="text-blue-500 hover:text-blue-700 cursor-pointer"
            >
              Profile
            </button>
          </div>
        </div>
        
        <div className="overflow-y-auto h-full">
          {users.map((chatUser) => (
            <div
              key={chatUser._id}
              onClick={() => {
                setSelectedUser(chatUser);
                createOrGetChat(chatUser._id);
              }}
              className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                selectedUser?._id === chatUser._id ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-center">
                <img
                  src={chatUser.pic}
                  alt={chatUser.name}
                  className="w-12 h-12 rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium text-black">{chatUser.name}</h3>
                  <p className="text-sm text-gray-500">
                    {chatUser.isOnline ? (
                      <span className="text-green-500">● Online</span>
                    ) : (
                      `Last seen: ${new Date(chatUser.lastSeen).toLocaleDateString()}`
                    )}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col">
        {selectedUser ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-300 bg-white">
              <div className="flex items-center">
                <img
                  src={selectedUser.pic}
                  alt={selectedUser.name}
                  className="w-10 h-10 text-black rounded-full mr-3"
                />
                <div>
                  <h3 className="font-medium text-black">{selectedUser.name}</h3>
                  <p className={`text-sm ${selectedUser.isOnline ? "text-green-500" : "text-red-500"}`}>
                    {selectedUser.isOnline ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message._id}
                  className={`flex ${
                    message.sender._id === user._id ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      message.sender._id === user._id
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 text-gray-800'
                    }`}
                  >
                    <p>{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {new Date(message.createdAt).toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}
              {typing && (
                <div className="text-sm text-gray-500 italic">{typing}</div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-300 bg-white">
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => {
                    setNewMessage(e.target.value);
                    handleTyping();
                  }}
                  onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 p-3 border text-black border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={sendMessage}
                  className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <IoSend size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <h3 className="text-xl font-medium text-gray-500">
                Select a user to start chatting
              </h3>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;