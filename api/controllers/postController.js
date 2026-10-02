const postModel = require("../models/postModel");

exports.createPost = async (req, res) => {
    const user_id = req.user.user_id;
    const { title, subtitle, content, categories } = req.body;

    if (!title || !content)
        return res.status(400).json({
            error: "제목 또는 내용을 입력해주세요",
        });

    let coverPath = null;
    if (req.file) coverPath = req.file.filename;

    try {
        const post = await postModel.createPost(user_id, {
            title,
            subtitle,
            content,
            cover: coverPath,
            categories: categories ? JSON.parse(categories) : [],
        });
        res.status(201).json({
            post_id: post.post_id,
            message: "포스트가 생성되었습니다",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message || "서버 오류",
        });
    }
};

exports.getPost = async (req, res) => {
    const post_id = req.params.id;
    const user_id = req.user?.user_id;

    try {
        const post = await postModel.getPostById(post_id, user_id);
        if (!post)
            return res.status(404).json({
                error: "포스트가 존재하지 않습니다",
            });
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message || "서버 오류",
        });
    }
};

exports.likePost = async (req, res) => {
    const user_id = req.user.user_id;
    const post_id = parseInt(req.params.id);

    try {
        const result = await postModel.toggleLike(post_id, user_id);
        res.json(result);
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message || "좋아요 실패",
        });
    }
};

exports.deletePost = async (req, res) => {
    const user_id = req.user.user_id;
    const post_id = parseInt(req.params.id);

    try {
        await postModel.deletePost(post_id, user_id);
        res.json({
            message: "삭제되었습니다",
        });
    } catch (err) {
        console.error(err);
        const status = err.message === "권한이 없습니다" ? 403 : 500;
        res.status(status).json({
            error: err.message || "삭제 실패",
        });
    }
};

exports.updatePost = async (req, res) => {
    const user_id = req.user.user_id;
    const post_id = parseInt(req.params.id);
    const { title, subtitle, content, categories } = req.body;
    const coverPath = req.file ? req.file.filename : null;

    try {
        const updatedPost = await postModel.updatePost(post_id, user_id, {
            title,
            subtitle,
            content,
            coverPath,
            categories,
        });
        res.json(updatedPost);
    } catch (err) {
        console.error(err);
        const status = err.message === "권한이 없습니다" ? 403 : 500;
        res.status(status).json({
            error: err.message || "수정 실패",
        });
    }
};
