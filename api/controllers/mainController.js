const mainModel = require("../models/mainModel");

exports.getRecommendPosts = async (req, res) => {
    try {
        const posts = await mainModel.getRecommendPosts();
        res.json(posts);
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            message: "추천 포스트 로딩 실패",
        });
    }
};

exports.getRecommendBlogs = async (req, res) => {
    try {
        const blogs = await mainModel.getRecommendBlogs();
        res.json(blogs);
    } catch (err) {
        console.error("서버 오류", err);
        res.status(500).json({
            message: "추천 블로그 로딩 실패",
        });
    }
};
