import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import bcrypt from "bcryptjs";
import crypto from 'crypto'

const User = sequelize.define("User", {
    user_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    firstName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [3, 50], // between 3 and 50 characters
                msg: "First name must be at least 3 characters long.",
            },
        },
    },
    lastName: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
            len: {
                args: [3, 50],
                msg: "Last name must be at least 3 characters long.",
            },
        },
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            isEmail: {
                msg: "Please provide a valid email address.",
            },
        },
    },
    phoneNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: {
            is: {
                args: /^0\d{9}$/, // must start with 0 + 9 more digits
                msg: "Phone number must start with 0 and be exactly 10 digits",
            },
        },
    },

    image: {
        type: DataTypes.STRING,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    role: {
        type: DataTypes.ENUM("admin", "worker"),
        defaultValue: "worker",
    },
    passwordResetToken: {
        type: DataTypes.STRING,
    },
    passwordResetExpires: {
        type: DataTypes.DATE,
    },
}, {
    timestamps: true,
});

//Hash password before saving
User.beforeCreate(async (user) => {
    user.password = await bcrypt.hash(user.password, 12)
});

// Optional: hash password before update (if changed)
User.beforeUpdate(async (user) => {
    if (user.changed("password")) {
        user.password = await bcrypt.hash(user.password, 12)
    }
});

User.prototype.comparePassword = async function (incomingPassword) {
    return await bcrypt.compare(incomingPassword, this.password)
};

//forgot password: This can go inside your model definition file, after defining the model
User.prototype.createPasswordResetToken = function () {
    // 1. Generate a random token
    const resetToken = crypto.randomBytes(32).toString("hex");

    // 2. Hash the token and store it in the database
    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    // 3. Set token expiry time (10 minutes)
    this.passwordResetExpires = Date.now() + 40 * 60 * 1000;

    // 4. Return the unhashed token (to send in email)
    return resetToken;
};

export default User