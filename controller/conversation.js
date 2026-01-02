import Conversation from "../models/Conversation.js";

export const fetchConversation = async (req, res) => {
  try {
    const { senderId, receiverId } = req.body;
    if (!senderId || !receiverId) {
      return res.status(400).json({ message: "Invalid payload" });
    }

    const selfChat = senderId === receiverId;
    const participants = selfChat ? [senderId] : [senderId, receiverId];

    const participantsKey = selfChat
      ? [senderId]
      : [senderId, receiverId].sort().join("_");

    let conversation = await Conversation.findOne({ participantsKey });
    
    if (!conversation) {
      conversation = await Conversation.create({
        participants,
      });
    }

    return res.status(200).json(conversation);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};
