import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from "crypto";

const User = sequelize.define("User", {
  user_id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },

  firstName: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  lastName: {
    type: DataTypes.STRING,
    allowNull: true,
  },

  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: { isEmail: true },
  },

  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: false,
    validate: {
      isValidPhone(value) {
        if (value) {
          const trimmed = value.trim();
          if (!/^0\d{9}$/.test(trimmed)) {
            throw new Error("Phone number must start with 0 and be exactly 10 digits");
          }
        }
      },

    },
  },


  image: {
    type: DataTypes.STRING,
  },

  password: {
    type: DataTypes.STRING,
    allowNull: true, // user will set this later
  },

  role: {
    type: DataTypes.ENUM("admin", "worker"),
    defaultValue: "worker",
  },

  isVerified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },

  passwordResetToken: {
    type: DataTypes.STRING,
  },
  passwordResetExpires: {
    type: DataTypes.DATE,
  },
});

//  Hash password only if provided
User.beforeCreate(async (user) => {
  if (user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.beforeUpdate(async (user) => {
  if (user.changed("password") && user.password) {
    user.password = await bcrypt.hash(user.password, 12);
  }
});

User.prototype.comparePassword = async function (plain) {
  return await bcrypt.compare(plain, this.password);
};

User.prototype.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 40 * 60 * 1000;
  return resetToken;
};

export default User;
