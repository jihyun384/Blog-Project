const followModel = require("../models/followModel");

exports.toggleFollow = async (req, res) => {
    const follower_user_id = req.user.user_id;
    const following_user_id = parseInt(req.params.userId, 10);

    if (follower_user_id === following_user_id) {
        return res.status(400).json({
            error: "자기 자신은 팔로우할 수 없습니다",
        });
    }

    try {
        const isFollowing = await followModel.isFollowing(follower_user_id, following_user_id);

        if (isFollowing) {
            await followModel.unfollowUser(follower_user_id, following_user_id);
            res.json({
                message: "언팔로우 완료",
                isFollowing: false,
            });
        } else {
            await followModel.followUser(follower_user_id, following_user_id);
            res.json({
                message: "팔로우 완료",
                isFollowing: true,
            });
        }
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            error: "팔로우/언팔로우 처리 중 오류 발생",
        });
    }
};

exports.getFollowCount = async (req, res) => {
    const user_id = parseInt(req.params.userId, 10);

    try {
        const counts = await followModel.getFollowCount(user_id);
        res.json(counts);
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            error: "팔로우 정보 조회 실패",
        });
    }
};

exports.checkFollowStatus = async (req, res) => {
    try {
        const followerId = req.user.user_id;
        const followingId = parseInt(req.params.user_id, 10);

        const isFollowing = await followModel.isFollowing(followerId, followingId);
        res.json({
            isFollowing,
        });
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            error: "팔로우 상태 확인 실패",
        });
    }
};
