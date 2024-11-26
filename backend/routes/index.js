const router = require("express").Router();


router.use("/user/signup", require("./user.js"));
router.use("/user/signin", require("./user.js"));


const { authMiddleware } = require("../middleware");
router.use("/user", authMiddleware, require("./user.js"));


router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

module.exports = router;