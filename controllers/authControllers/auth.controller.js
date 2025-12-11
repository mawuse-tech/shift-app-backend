import { sendResetEmail } from "../../config/email.js";
import User from "../../models/users.model.js";
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { Op } from "sequelize";
import bcrypt from "bcryptjs";
import { Resend } from "resend";

//registration function
export const completeRegistration = async (req, res, next) => {
    try {
        const { token, phoneNumber, password } = req.body;

        if (!token) return res.status(400).json({ message: "Token required" });
        if (!password) return res.status(400).json({ message: "Password is required" });
        if (!phoneNumber) return res.status(400).json({ message: "Phone number is required" });

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.user_id;

        const user = await User.findByPk(userId);
        if (!user) return res.status(404).json({ message: "User not found" });

        // Handle Cloudinary image upload
        let uploadedImage = user.image;
        if (req.file) {
            uploadedImage = req.file.path;  // Cloudinary secure_url
        }

        // Update user info
        user.phoneNumber = phoneNumber;
        user.password = password;  
        user.image = uploadedImage;   // Save Cloudinary URL
        user.isVerified = true;

        await user.save();

        res.status(200).json({ message: "Profile completed successfully" });

    } catch (err) {
        console.log(err);
        next(err);
    }
};

    //login function
    // export const login = async (req, res, next) => {
    //     const { email, password } = req.body;

    //     if (!email) {
    //         const error = new Error("email is required")
    //         error.statusCode = 400
    //         return next(error)
    //     }
    //     if (!password) {
    //         const error = new Error("Password is required")
    //         error.statusCode = 400
    //         return next(error)
    //     }

    //     try {
    //         const user = await User.findOne({ where: { email } })

    //         if (!user) {
    //             // User not found
    //             return res.status(401).json({ message: "Email or password is wrong" });
    //         }

    //         if (user.role !== "admin" && !user.isVerified) {
    //             return res.status(401).json({ message: "Please verify your email first." });
    //         }

    //         if (!user) {
    //             const error = new Error("Email or password is wrong")
    //             error.statusCode = 401
    //             return next(error)
    //         }

    //         const isMatch = await user.comparePassword(password)
    //         if (!isMatch) {
    //             const error = new Error('incorect email or password')
    //             error.statusCode = 401
    //             return next(error)
    //         };

    //         const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
    //             expiresIn: '1d'
    //         });


    //         res.cookie('token', token, {
    //             httpOnly: true, //avoid client side tempering
    //             maxAge: 24 * 60 * 60 * 1000 //1 day
    //         })

    //         return res.status(200).json({
    //             success: true,
    //             statusCode: 200,
    //             message: "user logged in successfuly",
    //             role: user.role
    //         })


    //     } catch (error) {
    //         next(error)
    //     }
    // };

    export const login = async (req, res, next) => {
        const { email, password } = req.body;

        if (!email) return next(Object.assign(new Error("Email is required"), { statusCode: 400 }));
        if (!password) return next(Object.assign(new Error("Password is required"), { statusCode: 400 }));

        try {
            const user = await User.findOne({ where: { email } });

            if (!user) return res.status(401).json({ message: "Email or password is wrong" });

            if (user.role !== "admin" && !user.isVerified) {
                return res.status(401).json({ message: "Please verify your email first." });
            }

            const isMatch = await user.comparePassword(password);
            if (!isMatch) return next(Object.assign(new Error("Incorrect email or password"), { statusCode: 401 }));

            // create JWT
            const token = jwt.sign(
                { id: user.user_id, role: user.role },
                process.env.JWT_SECRET,
                { expiresIn: '30d' }
            );

            // send cookie with proper cross-site options
            res.cookie('token', token, {
                httpOnly: true,
                maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
                secure: true, // force HTTPS (Render + Netlify)
                sameSite: 'none', // cross-site required
                path: '/' // ensure cookie applies to all routes 
            });

            return res.status(200).json({
                success: true,
                statusCode: 200,
                message: "User logged in successfully",
                role: user.role,
                token
            });

        } catch (error) {
            next(error);
        }
    };
  
    //logout
    // export const logout = async (req, res, next) => {
    //     try {
    //         res.clearCookie('token');

    //         res.status(200).json({
    //             success: true,
    //             message: 'user loged out successfully'
    //         })
    //     } catch (error) {
    //         next(error)
    //     }
    // };
    export const logout = async (req, res, next) => {
        try {
            res.clearCookie('token', {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'none',
                path: '/' // default path, make sure it matches your cookie path
            });

            res.status(200).json({
                success: true,
                message: 'User logged out successfully'
            });
        } catch (error) {
            next(error);
        }
    };

    //Forgot password controller
    
    export const forgotPassword = async (req, res) => {
        const user = await User.findOne({ where: { email: req.body.email } });

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const resetToken = user.createPasswordResetToken();
        await user.save(); // save hashed token + expiry to DB

        // You’ll send `resetToken` to user's email (not the hashed one)
        // const resetURL = `${req.protocol}://${req.get('host')}/api/v1/users/resetPassword/${resetToken}`;

        // send reset email logic here...
        sendResetEmail(user.email, resetToken)

        res.status(200).json({
            message: "Password reset link sent to your email",
            // resetURL
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
            const { oldPassword, newPassword } = req.body;

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

    //invite a worker
    const resend = new Resend(process.env.RESEND_API_KEY);
    export const inviteWorker = async (req, res, next) => {
        try {
            const { email, firstName, lastName, role } = req.body;

            // Check if email already exists
            const existingUser = await User.findOne({ where: { email } });
            if (existingUser) {
                return res.status(400).json({ message: "This email is already registered." });
            }

            // Create user but unverified and no password yet
            const user = await User.create({
                email,
                firstName,
                lastName,
                role,
                isVerified: false,
                invited_by: req.loggedInUser.user_id
            });

            // Create JWT verification token
            const token = jwt.sign({ user_id: user.user_id }, process.env.JWT_SECRET, {
                expiresIn: "1d",
            });

            // const verifyLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;
            const verifyLink = new URL(`/verify?token=${token}`, process.env.FRONTEND_URL).toString();

            // Send verification email
            await resend.emails.send({
                from: "Shift Sheduler <onboarding@resend.dev>",
                to: email,
                subject: "Complete Your Account Setup",
                html: `
                <p>Hello ${firstName || ""},</p>
                <p>You have been invited to join the Shift Platform.</p>
                <p>Click below to verify your email and finish setting up your account:</p>
                <a href="${verifyLink}" style="color:#7C3AED;">Verify Account</a>
                <br/><br/>
                <small>This link expires in an hour time.</small>
            `,
            });

            return res.status(200).json({ message: "Invitation email sent " });
        } catch (error) {
            console.log(error);
            next(error)
        }
    };

    //varyfy email
    export const verifyEmail = async (req, res, next) => {
        try {
            const { token } = req.query;

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await User.findByPk(decoded.user_id);
            if (!user) return res.status(400).json({ message: "Invalid user" });

            // Mark user as verified if not already
            if (!user.isVerified) {
                user.isVerified = true;
                await user.save();
            }

            // include the token in the redirect to send to the frontend
            const baseUrl = process.env.FRONTEND_URL?.trim(); // remove accidental spaces
            if (!baseUrl) throw new Error("FRONTEND_URL is not set properly");

            const redirectUrl = `${baseUrl}/complete-registration?token=${token}&email=${encodeURIComponent(user.email)}`;

            return res.json({ redirectUrl });

        } catch (err) {
            if (err.name === "TokenExpiredError") {
                return res.status(400).json({ message: "Token has expired. Please request a new verification link." });
            } else if (err.name === "JsonWebTokenError") {
                return res.status(400).json({ message: "Invalid token." });
            }
            next(err);
        }
    };
