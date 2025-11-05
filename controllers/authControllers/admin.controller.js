import User from "../../models/users.model.js";
import bcrypt from "bcryptjs";

//create the admin manually
export const createAdmin = async () => {
  await User.create({
    firstName: "Admin",
    lastName: "User",
    phoneNumber: "0000000000",
    email: "admin@gmail.com",
    password: "12345",  // plain text here
    role: "admin"
  });
  console.log("Admin created successfully");
};
