const express = require("express");
const router = express.Router();
const followController = require("../controllers/followController");
const authenticateToken = require("../middleware/auth");

router.get("/:userId/count", followController.getFollowCount);
router.get("/status/:user_id", authenticateToken, followController.checkFollowStatus);

router.post("/:userId/toggle", authenticateToken, followController.toggleFollow);

module.exports = router;
