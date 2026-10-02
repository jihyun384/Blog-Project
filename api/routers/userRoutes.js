const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");

const userController = require("../controllers/userController");
const authMiddleware = require("../middleware/auth");

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/profile")),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});
const upload = multer({
    storage,
});

router.post("/signup", userController.signup);
router.post("/login", userController.login);

router.get("/profile", authMiddleware, userController.getProfile);

router.put("/profile", authMiddleware, userController.updateProfile);
router.put("/profile/photo", authMiddleware, upload.single("profile"), userController.updateProfilePhoto);

module.exports = router;
