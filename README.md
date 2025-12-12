# Chit-For-Chat 💬

A real-time chat application built with Next.js and Node.js featuring instant messaging, user authentication, and live notifications.

## ✨ Features

- **Real-time Messaging** - Instant message delivery with Socket.IO
- **User Authentication** - JWT-based login/register system
- **Live Notifications** - Desktop notifications for new messages
- **Online Status** - See who's online/offline with last seen timestamps
- **Typing Indicators** - Live "user is typing..." notifications
- **Unread Message Badges** - Red badges showing unread message counts
- **File Upload** - Support for image sharing in chats
- **Responsive Design** - Mobile-friendly chat interface

## 🚀 Tech Stack

### Frontend
- **Next.js 16** - React framework
- **Socket.IO Client** - Real-time communication
- **Tailwind CSS** - Styling and responsive design
- **React Icons** - UI icons

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **Socket.IO** - Real-time bidirectional communication
- **MongoDB** - Database with Mongoose ODM
- **JWT** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling

## 📁 Project Structure

```
Chit-For-Chat/
├── client/                 # Next.js frontend
│   ├── src/app/
│   │   ├── Chat/           # Main chat interface
│   │   ├── Login/          # Login page
│   │   ├── Signup/         # Registration page
│   │   └── Profile/        # User profile management
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── models/         # MongoDB schemas
│   │   ├── routes/         # API endpoints
│   │   ├── middleware/     # Authentication middleware
│   │   └── config/         # Database configuration
└── uploads/               # File storage directory
```

## 🛠️ Installation & Setup

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (local or cloud)
- npm or yarn

### 1. Clone Repository
```bash
git clone <repository-url>
cd Chit-For-Chat
```

### 2. Backend Setup
```bash
cd server
npm install
```

Create `.env` file in server directory:
```env
MONGO_URI=mongodb://localhost:27017/chit-for-chat
JWT_SECRET=your_jwt_secret_key
PORT=5000
CLIENT_URL=http://localhost:3000
```

### 3. Frontend Setup
```bash
cd client
npm install
```

### 4. Start Development Servers

**Backend:**
```bash
cd server
npm run dev
```

**Frontend:**
```bash
cd client
npm run dev
```

## 🔗 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Users
- `GET /api/users` - Get all users (protected)
- `PUT /api/users/profile` - Update user profile (protected)
- `PUT /api/users/status` - Update online status (protected)

### Chats
- `POST /api/chats` - Create/get one-on-one chat (protected)
- `GET /api/chats` - Get user's chats (protected)
- `POST /api/chats/group` - Create group chat (protected)

### Messages
- `POST /api/messages` - Send message (protected)
- `GET /api/messages/:chatId` - Get chat history (protected)
- `PUT /api/messages/:messageId/read` - Mark message as read (protected)

### File Upload
- `POST /api/upload/image` - Upload chat images (protected)
- `POST /api/upload/profile` - Upload profile pictures (protected)

## 🔄 Socket.IO Events

### Client → Server
- `user_online` - Update user online status
- `send_message` - Send real-time message
- `typing_start` - Start typing indicator
- `typing_stop` - Stop typing indicator
- `join_chat` - Join specific chat room

### Server → Client
- `receive_message` - Receive new message
- `user_typing` - Show typing indicator
- `user_stop_typing` - Hide typing indicator
- `user_status_change` - Online/offline status updates

## 🎯 Usage

1. **Register/Login** - Create account or sign in
2. **Select User** - Click on any user from the sidebar to start chatting
3. **Send Messages** - Type and press Enter or click Send button
4. **Real-time Updates** - Messages appear instantly for all connected users
5. **Notifications** - Get desktop notifications when window is not focused
6. **Profile Management** - Update name, bio, and profile picture

## 🔒 Security Features

- Password hashing with bcrypt
- JWT token authentication
- Protected API routes
- Input validation and sanitization
- CORS configuration
- File type restrictions for uploads

## 📱 Browser Support

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🐛 Known Issues

- Messages only sync when users are in the same chat room
- File uploads limited to 5MB
- Desktop notifications require user permission

## 🚀 Future Enhancements

- [ ] Voice messages
- [ ] Video calling
- [ ] Message reactions
- [ ] Dark mode
- [ ] Message search
- [ ] Group chat management
- [ ] End-to-end encryption

---

**Made with ❤️ using Next.js and Node.js**