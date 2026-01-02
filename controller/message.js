import Message from "../models/Message.js";
import Conversation from "../models/Conversation.js";
import { io } from "../index.js";

export const sendMessage = async (req, res) => {
  try {
    const { conversationId, content } = req.body;
    const senderId = req.user.id;

    if (!content?.trim()) {
      return res.status(400).json({ error: "Message is empty" });
    }

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [senderId] },
    });

    // console.log(conversation, conversationId, senderId)

    if (!conversation) {
      return res.status(403).json({ error: "Invalid conversation" });
    }

    const message = await Message.create({
      conversationId,
      senderId,
      content,
    });

    conversation.lastMessageId = message._id;
    conversation.lastMessageAt = message.createdAt;
    conversation.lastMessagePreview = message.content.slice(0, 100);

    io.to(req.body.conversationId).emit("receive_message", message);

    await conversation.save();

    res.json(message);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


export const fetchMessages = async (req, res)=> {
  try {
    const { conversationId} = req.params;
    const userId = req.user.id;

    const conversation = await Conversation.findOne({
      _id: conversationId,
      participants: { $in: [userId] },
    });
    console.log("fetch", conversationId, userId, conversation)

      if (!conversation) {
        return res.status(403).json({ error: "Unauthorized or not found" });
      }

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 })
      .lean();

    res.json({ messages });

  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
}

