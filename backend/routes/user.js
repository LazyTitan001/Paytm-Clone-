// backend/routes/user.js
const express = require('express');

const router = express.Router();
const zod = require("zod");
const { User, Account } = require("../db");
const jwt = require("jsonwebtoken");
const { JWT_SECRET } = process.env;
const { authMiddleware } = require("../middleware");

if (!JWT_SECRET) {
    console.error("JWT_SECRET is not defined in environment variables");
}

const signupBody = zod.object({
    username: zod.string().email(),
    firstName: zod.string(),
    lastName: zod.string(),
    password: zod.string()
})


router.post("/signup", async (req, res) => {
    try {
        console.log("Signup request body:", req.body);
        const { success } = signupBody.safeParse(req.body)
        if (!success) {
            console.log("Validation failed");
            return res.status(411).json({
                success: false,
                message: "Invalid input format"
            })
        }

        const existingUser = await User.findOne({
            username: req.body.username
        })

        if (existingUser) {
            return res.status(411).json({
                success: false,
                message: "Email already taken"
            })
        }

        const user = await User.create({
            username: req.body.username,
            password: req.body.password,
            firstName: req.body.firstName,
            lastName: req.body.lastName,
        })
        const userId = user._id;

        await Account.create({
            userId,
            balance: 1 + Math.random() * 10000
        })

        const token = jwt.sign({
            userId
        }, JWT_SECRET);
        
        console.log("Generated token:", token);
        
        res.json({
            success: true,
            message: "User created successfully",
            token: token
        })
    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})


const signinBody = zod.object({
    username: zod.string().email(),
    password: zod.string()
})

router.post("/signin", async (req, res) => {
    try {
        const { success } = signinBody.safeParse(req.body)
        if (!success) {
            return res.status(411).json({
                success: false,
                message: "Invalid input format"
            })
        }

        const user = await User.findOne({
            username: req.body.username,
            password: req.body.password
        });

        if (user) {
            const token = jwt.sign({
                userId: user._id
            }, JWT_SECRET);

            res.json({
                success: true,
                token: token
            })
            return;
        }


        res.status(411).json({
            success: false,
            message: "Error while logging in"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

const updateBody = zod.object({
    password: zod.string().optional(),
    firstName: zod.string().optional(),
    lastName: zod.string().optional(),
})

router.put("/", authMiddleware, async (req, res) => {
    try {
        const { success } = updateBody.safeParse(req.body)
        if (!success) {
            return res.status(411).json({
                success: false,
                message: "Error while updating information"
            })
        }

        await User.updateOne(
            { _id: req.userId },
            { $set: req.body }
        )

        res.json({
            success: true,
            message: "Updated successfully"
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

router.get("/bulk", async (req, res) => {
    try {
        const filter = req.query.filter || "";
        const sanitizedFilter = filter.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

        const users = await User.find({
            $or: [{
                firstName: {
                    "$regex": sanitizedFilter,
                    "$options": "i"  
                }
            }, {
                lastName: {
                    "$regex": sanitizedFilter,
                    "$options": "i"
                }
            }]
        })

        res.json({
            success: true,
            users: users.map(user => ({
                username: user.username,
                firstName: user.firstName,
                lastName: user.lastName,
                _id: user._id
            }))
        })
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        })
    }
})

module.exports = router;