import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./users.model.js";

// models/notification.js
const Notification = sequelize.define("Notification", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,      // This references the User model
      key: "user_id",        // The field in User model it relates to
    },
    onDelete: "CASCADE", // optional: delete notifications if user is deleted
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  message: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  type: {
    type: DataTypes.STRING, // e.g. 'shift-assigned', 'shift-updated'
    allowNull: true,
  },
  
});
export default Notification;
