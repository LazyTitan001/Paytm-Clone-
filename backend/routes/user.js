const express = require("express");
const router = express.Router();
const zod = require("zod");
const jwt = require("jsonwebtoken");
const { User } = require("../db.js");

const signupSchema = zod.object({
    username: zod.string().min(1),
    firstName: zod.string().min(1),
    lastName: zod.string().min(1),
    password: zod.string().min(6),
});

router.post("/signup", async (req, res) => {
    try {
        const { success } = signupSchema.safeParse(req.body);
        if (!success) {
            return res.status(400).json({
                message: "Invalid credentials",
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ username: req.body.username });
        if (existingUser) {
            return res.status(409).json({
                message: "Username already exists",
            });
        }

        // Create new user
        const dbUser = await User.create(req.body);

        // Generate token
        const token = jwt.sign({ userId: dbUser._id }, process.env.JWT_SECRET);

        res.status(201).json({
            message: "User created successfully",
            token: token
        });
    } catch (error) {
        console.error("Signup error:", error);
        res.status(500).json({
            message: "Internal server error"
        });
    }
});


module.exports = router;