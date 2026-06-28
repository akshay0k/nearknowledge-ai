import jwt from "jsonwebtoken";

const generateToken = (id) => {
  return jwt.sign(
    { id },               // Payload
    process.env.JWT_SECRET, // Secret key
    { expiresIn: "7d" }     // Token expires in 7 days
  );
};

export default generateToken;