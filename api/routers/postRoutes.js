const express = require("express");
const router = express.Router();
const postController = require("../controllers/postController");
const authenticateToken = require("../middleware/auth");
const multer = require("multer");
const path = require("path");

const coverStorage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, "../uploads/cover")),
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)),
});

const coverUpload = multer({
    storage: coverStorage,
    limits: {
        fieldSize: 10 * 1024 * 1024,
        fileSize: 5 * 1024 * 1024,
    },
});

router.get("/:id", authenticateToken, postController.getPost);

router.post("/", authenticateToken, coverUpload.single("cover"), postController.createPost);
router.post("/:id/like", authenticateToken, postController.likePost);

router.put("/:id", authenticateToken, coverUpload.single("cover"), postController.updatePost);

router.delete("/:id", authenticateToken, postController.deletePost);

module.exports = router;
