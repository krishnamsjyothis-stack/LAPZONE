import dotenv from "dotenv";

dotenv.config();

console.log("EMAIL_USER exists:", !!process.env.EMAIL_USER);
console.log("EMAIL_PASS exists:", !!process.env.EMAIL_PASS);
console.log("JWT_SECRET exists:", !!process.env.JWT_SECRET);