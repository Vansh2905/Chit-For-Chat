import mongoose, { Schema } from "mongoose";

const messageSchema = new Schema(
  {
    sender: { type: Schema.Types.ObjectId, ref: "User", required: true },
    content: { type: String, trim: true, required: true, maxlength: 1000 },
    chatId: { type: Schema.Types.ObjectId, ref: "Chat", required: true },
    messageType: { type: String, enum: ["text", "image"], default: "text" },
    imageUrl: String,
    readBy: [
      {
        user: { type: Schema.Types.ObjectId, ref: "User" },
        readAt: Date
      }
    ],
    deliveredTo: [{ type: Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

const chatSchema = new Schema(
  {
    chatName: { type: String, trim: true, maxlength: 100 },
    isGroupChat: { type: Boolean, default: false },

    users: [{ type: Schema.Types.ObjectId, ref: "User", required: true }],

    latestMessage: { type: Schema.Types.ObjectId, ref: "Message" },
    groupAdmin: { type: Schema.Types.ObjectId, ref: "User" },
    typingUsers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    unreadCount: [{
      user: { type: Schema.Types.ObjectId, ref: "User" },
      count: { type: Number, default: 0 }
    }]
  },
  { timestamps: true }
);

chatSchema.pre("save", function (next) {
  if (this.isGroupChat && (!this.chatName || this.chatName.trim() === "")) {
    return next(new Error("Group chat must have a name"));
  }
  if (this.users.length < 2) {
    return next(new Error("Chat must have at least 2 users"));
  }
  next();
});

const Message = mongoose.model("Message", messageSchema);
const Chat = mongoose.model("Chat", chatSchema);

export { Message, Chat };
export default Message;
