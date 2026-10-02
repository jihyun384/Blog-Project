const express = require("express");
const router = express.Router();
const blogController = require("../controllers/blogController");
const authenticateToken = require("../middleware/auth");

router.get("/:id", blogController.getBlogById);
router.get("/:id/posts", blogController.getPostsByBlog);
router.get("/:id/categories/:categoryId/posts", blogController.getPostsByCategory);

router.put("/:id", authenticateToken, blogController.updateBlog);

module.exports = router;
