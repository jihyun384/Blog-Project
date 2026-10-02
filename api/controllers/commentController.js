const commentModel = require("../models/commentModel");

exports.getComments = async (req, res) => {
    const post_id = parseInt(req.params.post_id);

    try {
        const blog_author = await commentModel.getPostAuthor(post_id);
        const comments = await commentModel.getCommentsByPostId(post_id);
        res.json({
            comments,
            blog_author,
        });
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            error: "댓글 조회 실패",
        });
    }
};

exports.createComment = async (req, res) => {
    const post_id = parseInt(req.params.post_id);
    const user_id = req.user.user_id;
    const { content, parent_id } = req.body;

    try {
        const comment = await commentModel.createComment(post_id, user_id, content, parent_id);
        res.json(comment);
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            error: err.message || "댓글 작성 실패",
        });
    }
};

exports.updateComment = async (req, res) => {
    const comment_id = parseInt(req.params.comment_id);
    const user_id = req.user.user_id;
    const { content } = req.body;

    try {
        const author = await commentModel.getCommentAuthor(comment_id);
        if (!author)
            return res.status(404).json({
                error: "댓글이 존재하지 않습니다",
            });
        if (user_id !== author)
            return res.status(403).json({
                error: "권한이 없습니다",
            });

        const updated = await commentModel.updateComment(comment_id, content);
        res.json(updated);
    } catch (err) {
        console.error("서버 오류:", err);
        res.status(500).json({
            error: "댓글 수정 실패",
        });
    }
};

exports.deleteComment = async (req, res) => {
    const comment_id = parseInt(req.params.comment_id);
    const user_id = req.user.user_id;

    try {
        await commentModel.deleteComment(comment_id, user_id);
        res.json({
            message: "댓글이 삭제되었습니다",
        });
    } catch (err) {
        console.error("서버 오류:", err);
        if (err.message === "권한이 없습니다")
            return res.status(403).json({
                error: err.message,
            });
        if (err.message === "댓글이 존재하지 않습니다")
            return res.status(404).json({
                error: err.message,
            });
        res.status(500).json({
            error: "댓글 삭제 실패",
        });
    }
};
