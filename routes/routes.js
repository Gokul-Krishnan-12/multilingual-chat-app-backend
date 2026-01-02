import express from "express";
import { authMiddleware } from "../middleware/auth.js";

import { addUser, getAllUsers } from "../controller/user-controller.js";
import { fetchConversation } from "../controller/conversation.js";
import { sendMessage, fetchMessages } from "../controller/message.js";

const route = express.Router();

route.post("/addUser", addUser);
route.get("/users",authMiddleware, getAllUsers);

route.post("/api/conversation/fetch", authMiddleware, fetchConversation);

route.post("/api/message/send",authMiddleware, sendMessage);
route.get("/api/message/:conversationId", authMiddleware, fetchMessages);

export default route;


// import express from "express";
// import { authMiddleware } from "../middleware/auth.js";

// import { addUser, getAllUsers } from "../controller/user-controller.js";
// import { fetchConversation } from "../controller/conversation.js";
// import { sendMessage, fetchMessages } from "../controller/message.js";

// const router = express.Router();

// // PUBLIC ROUTES
// router.post("/api/v1/user", addUser);

// // PROTECTED ROUTES
// router.use("/api/v1", authMiddleware);

// // USERS
// router.get("/api/v1/users", getAllUsers);

// // CONVERSATIONS
// router.post("/api/v1/conversations", fetchConversation);

// // MESSAGES
// router.post("/api/v1/messages", sendMessage);
// router.get("/api/v1/messages/:conversationId", fetchMessages);

// export default router;
