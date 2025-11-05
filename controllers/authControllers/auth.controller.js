import { sendResetEmail } from "../../config/email.js";
import User from "../../models/users.model.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Op, where } from "sequelize";
import bcrypt from "bcryptjs";
import { createAdmin } from "./admin.controller.js";

//registration function
export const registerUsers = async (req, res, next) => {
    const { firstName, lastName, email, password, phoneNumber } = req.body;

    if (!firstName) {
        const error = new Error('First name is required')
        error.statusCode = 400
        return next(error)
    };
    if (!lastName) {
        const error = new Error('Last name is required')
        error.statusCode = 400
        return next(error)
    };
    if (!email) {
        const error = new Error('Email is required')
        error.statusCode = 400
        return next(error)
    };
    if (!password) {
        const error = new Error('Password is required')
        error.statusCode = 400
        return next(error)
    };
    if (!phoneNumber) {
        const error = new Error('Phone number is required')
        error.statusCode = 400
        return next(error)
    };

    try {
        const image = req.file ? req.file.path : null;
        const user = await User.create({ firstName, lastName, email, password, phoneNumber, image });

        const token = jwt.sign({ id: user.user_id }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000
        });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            statusCode: 200,
        });

    } catch (error) {
        next(error)
    }
};

//login function
export const login = async (req, res, next) => {
    const { email, password } = req.body;

    if (!email) {
        const error = new Error("email is required")
        error.statusCode = 400
        return next(error)
    }
    if (!password) {
        const error = new Error("Password is required")
        error.statusCode = 400
        return next(error)
    }

    try {
        const user = await User.findOne({ where: { email } })

        if (!user) {
            const error = new Error("Email or password is wrong")
            error.statusCode = 401
            return next(error)
        }

        const isMatch = await user.comparePassword(password)
        if (!isMatch) {
            const error = new Error('incorect email or password')
            error.statusCode = 401
            return next(error)
        };

        const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
            expiresIn: '1d'
        });


        res.cookie('token', token, {
            httpOnly: true, //avoid client side tempering
            maxAge: 24 * 60 * 60 * 1000 //1 day
        })

        return res.status(200).json({
            success: true,
            statusCode: 200,
            message: "user logged in successfuly",
            role: user.role
        })


    } catch (error) {
        next(error)
    }
};

//logout
export const logout = async (req, res, next) => {
    try {
        res.clearCookie('token');

        res.status(200).json({
            success: true,
            message: 'user loged out successfully'
        })
    } catch (error) {
        next(error)
    }
};

// Forgot password controller
export const forgotPassword = async (req, res) => {
    const user = await User.findOne({ where: { email: req.body.email } });

    if (!user) {
        return res.status(404).json({ message: "User not found" });
    }

    const resetToken = user.createPasswordResetToken();
    await user.save(); // save hashed token + expiry to DB

    // You’ll send `resetToken` to user's email (not the hashed one)
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

    // send reset email logic here...
    sendResetEmail(user.email, resetToken)

    res.status(200).json({
        message: "Password reset link sent to your email",
        resetURL
    });
};

//reset password function
export const resetPassword = async (req, res, next) => {
    //re-hash the raw token coming from the client side
    const hashedToken = crypto
        .createHash("sha256")
        .update(req.params.token)
        .digest("hex");

    //password already in the database is replaced by the new password
    try {
        const user = await User.findOne({
            where: {
                passwordResetToken: hashedToken,
                passwordResetExpires: { [Op.gt]: Date.now() },
            },
        });

        if (!user) return res.status(400).json({ message: "Token invalid or expired, return and input your email again" });
        //  console.log('Token from URL:', req.params.token);
        // console.log('Hashed token in DB:', user.passwordResetToken);

        user.password = req.body.password;
        user.passwordResetToken = null;
        user.passwordResetExpires = null;

        await user.save({ validate: false });

        res.status(200).json({
            success: true,
            message: "Password reset successful!"
        });
    } catch (error) {
        next(error)
    }
};

//change password
export const changePassword = async (req, res, next) => {
    try {
        const {oldPassword, newPassword } = req.body;

        if (!oldPassword || !newPassword) {
            const error = new Error("Both passwords are required");
            error.statusCode = 400;
            return next(error);
        }

        // find user by primary key in Sequelize
        const user = await User.findByPk(req.loggedInUser.user_id);

        if (!user) {
            const error = new Error("User not found");
            error.statusCode = 404;
            return next(error);
        }

        // compare old password with hashed one in DB
        const isSame = await bcrypt.compare(oldPassword, user.password);
        if (!isSame) {
            const error = new Error("Old password is not correct");
            error.statusCode = 400;
            return next(error);
        }

        // hash new password before saving
        user.password = newPassword;
        await user.save();

        res.status(200).json({
            success: true,
            statusCode: 200,
            message: "Password updated successfully",
        });
    } catch (error) {
        next(error);
    }
};

//logged in user data 
export const loggedInUserData = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            statusCode: 200,
            loggedInuserData: req.loggedInUser
        })
    } catch (error) {
        next(error)
    }
}

