import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./users.model.js";

const Shift = sequelize.define("Shift", {
    shift_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: User,
            key: "user_id",
        },
        onDelete: "CASCADE",
    },
    
    assigned_by: {                  
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: "Users",    
      key: "user_id",
    },
  },
    day: {
        type: DataTypes.ENUM(
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
            "Sunday"
        ),
        allowNull: false,
    },
    shift_type: {
        type: DataTypes.ENUM("Morning", "Mid", "Afternoon", "Off"),
        defaultValue: "Off",
        allowNull: false,
    },
    date: {
    type: DataTypes.DATEONLY, 
    allowNull: false,
  },
    assigned_by: {
        type: DataTypes.INTEGER, // admin ID
        allowNull: false,
        references: {
            model: "Users",
            key: "user_id",
        },
    },
}, {
    timestamps: true,
});

export default Shift
