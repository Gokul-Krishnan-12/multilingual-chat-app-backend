import mongoose from "mongoose";

const ConversationSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["direct", "group"],
      default: "direct",
    },

    participants: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
    ],

    participantsKey: {
      type: String,
      unique: true,
      sparse: true,
    },

    lastMessageAt: {
      type: Date,
    },

    lastMessagePreview: {
      type: String,
      maxlength: 500,
    },
    lastMessageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

ConversationSchema.index({ participants: 1 });
ConversationSchema.index({ lastMessageAt: -1 });

ConversationSchema.pre("validate", function (next) {
  // Direct chat
  if (this.type === "direct") {
    // Generate key
    this.participantsKey = this.participants
      .map((id) => id.toString())
      .sort()
      .join("_");
  } else {
    this.participantsKey = undefined;
  }

});

export default mongoose.model("Conversation", ConversationSchema);
