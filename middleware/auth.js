import { getToken } from "@auth/core/jwt";

export const authMiddleware = async (req, res, next) => {

  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    salt: req.cookies["authjs.session-token"]
      ? "authjs.session-token"
      : "next-auth.session-token",
  });


  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  req.user = {
    id: token.sub,
    email: token.email,
    name: token.name,
  };
  next();
};



// export const authMiddleware = async (req, res, next) => {
//   const authHeader = req.headers.authorization;

//   if (!authHeader) {
//     return res.status(401).json({ error: "Unauthorized" });
//   }

//   const token = authHeader.split(" ")[1];
//   try {
//     const decoded = jwt.verify(token, process.env.BACKEND_JWT_SECRET);

//     req.user = decoded;
//     next();
//   } catch {
//     return res.status(401).json({ error: "Invalid token" });
//   }
// };

