const blogModel = require("../models/blogModel");

exports.getBlogById = async (req, res) => {
    const blog_id = parseInt(req.params.id);

    try {
        const blog = await blogModel.findBlogById(blog_id);
        if (!blog)
            return res.status(404).json({
                error: "블로그 없음",
            });

        const posts = await blogModel.getPostsByBlogId(blog_id);
        const categories = await blogModel.getCategoriesByBlogId(blog_id);

        res.json({
            blog,
            posts,
            categories,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "서버 오류",
        });
    }
};

exports.updateBlog = async (req, res) => {
    const user_id = req.user.user_id;
    const { title, description } = req.body;

    try {
        const updated = await blogModel.updateBlog(user_id, title, description);
        if (!updated)
            return res.status(404).json({
                error: "블로그 없음 또는 권한 없음",
            });

        res.json(updated);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "블로그 수정 실패",
        });
    }
};

exports.getPostsByCategory = async (req, res) => {
    const blog_id = parseInt(req.params.id);
    const category_id = parseInt(req.params.categoryId);

    try {
        const posts = await blogModel.getPostsByCategory(blog_id, category_id);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "카테고리별 포스트 불러오기 실패",
        });
    }
};

exports.getPostsByBlog = async (req, res) => {
    const blog_id = parseInt(req.params.id);

    try {
        const posts = await blogModel.getPostsByBlogId(blog_id);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "블로그 포스트 불러오기 실패",
        });
    }
};
