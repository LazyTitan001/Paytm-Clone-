const router = require("express").Router();
const userRoutes = require("./user.js");
const { authMiddleware } = require("../middleware");

// Public routes
router.post("/user/signup", userRoutes);
router.post("/user/signin", userRoutes);

// Protected routes
router.use("/user", authMiddleware, userRoutes);

router.use((req, res) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});

module.exports = router;