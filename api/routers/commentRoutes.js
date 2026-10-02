const express = require("express");
const router = express.Router();
const commentController = require("../controllers/commentController");
const auth = require("../middleware/auth");

router.get("/:post_id", auth, commentController.getComments);

router.post("/:post_id", auth, commentController.createComment);

router.put("/:post_id/:comment_id", auth, commentController.updateComment);

router.delete("/:post_id/:comment_id", auth, commentController.deleteComment);

module.exports = router;
