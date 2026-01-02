import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Conversation from "../models/Conversation.js";

export const addUser = async (req, res) => {
  try {
    const { email, password, provider, name, image } = req.body;
    if (!email || !provider) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const update = {
      email,
      provider,
      name,
      image,
    };

    // Only credentials users have password
    if (provider === "credentials" && password) {
      update.password = await bcrypt.hash(password, 10);
    }

    const user = await User.findOneAndUpdate(
      { email },
      { $setOnInsert: update },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      id: user._id,
      email: user.email,
    });
  } catch (err) {
    return res.status(500).json({ message: err.message });
  }
};

export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user.id;
    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name email image")
      .sort({ lastMessageAt: -1 });

    const usersFromConversations = conversations.map((conv) => {
      let otherUser = conv.participants.find(
        (p) => p._id.toString() !== userId.toString()
      );

      if (!otherUser && conv.participants.length > 0) {
        otherUser = conv.participants[0];
      }

      if (!otherUser) return null;

      return {
        user: otherUser,
        conversationId: conv._id,
        lastMessagePreview: conv.lastMessagePreview ?? null,
        lastMessageAt: conv.lastMessageAt ?? null,
      };
    });

    const allUsers = await User.find({}, "name email image");
    const usersInConversationIds = new Set(
      usersFromConversations.map((item) =>
        item.user._id.toString())      
    );

    const usersWithoutConversation = allUsers
      .filter((u) => !usersInConversationIds.has(u._id.toString()))
      .map((u) => ({
        user: u,
        conversationId: null,
        lastMessagePreview: null,
        lastMessageAt: null,
      }));

    return res
      .status(200)
      .json([...usersFromConversations, ...usersWithoutConversation]);
  } catch (err) {
    console.error("error", err);
    return res.status(500).json({ message: err.message });
  }
};
