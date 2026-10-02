const searchModel = require("../models/searchModel");

exports.search = async (req, res) => {
    try {
        const keyword = req.query.query;
        if (!keyword)
            return res.status(400).json({
                error: "검색어를 입력하세요",
            });

        const posts = await searchModel.findPostsByKeyword(keyword);
        const blogs = await searchModel.findBlogsByUserName(keyword);

        res.json({
            posts,
            blogs,
        });
    } catch (error) {
        console.error("검색 오류:", error);
        res.status(500).json({
            error: "검색 중 오류가 발생했습니다",
        });
    }
};
