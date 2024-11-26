const express = require("express");
const { Account } = require("../db");
const { authMiddleware } = require("../middleware");
const mongoose = require("mongoose");

const router = express.Router();

router.get("/balance", authMiddleware, async (req, res) => {
    const account = await Account.findOne({ userId: req.userId });
    res.json({
        balance: account.balance
    });
});

router.post("/transfer", authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();

    session.startTransaction();
    const { amount , to } = req.body;

    const account =   await Account.findOne({ userId: req.userId }).session(session);

    if(!account || account.balance < amount) { 
        await session.abortTransaction();
        return res.status(400).json({
            success: false,
            message: "insufficient balance"
        });
    }

    const toAccount = await Account.findOne({ userId: to }).session(session);  
    if(!toAccount) {
        await session.abortTransaction();
        return res.status(400).json({
            success: false,
            message: "Account not found"
        });
    }

    await account.updateOne({ $inc: { balance: -amount } }, { session });
    await toAccount.updateOne({ $inc: { balance: amount } }, { session });

    await session.commitTransaction(); 
    res.json({
        success: true,
        message: "Transfer successful"
    });
});

module.exports = router;
