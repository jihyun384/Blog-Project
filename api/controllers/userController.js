const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userModel = require("../models/userModel");
const blogModel = require("../models/blogModel");
require("dotenv").config();

const signup = async (req, res) => {
    const { user_name, email, password } = req.body;
    if (!user_name || !email || !password)
        return res.status(400).json({
            error: "모든 값을 입력해주세요",
        });

    try {
        const existingUser = await userModel.findUserByEmail(email);
        if (existingUser)
            return res.status(400).json({
                error: "이미 가입된 이메일입니다",
            });

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await userModel.createUser(user_name, email, hashedPassword, "profile.png");
        await blogModel.createBlog(user.user_id, "마이 블로그", "안녕하세요");
        const token = jwt.sign(
            {
                user_id: user.user_id,
                user_name: user.user_name,
            },
            process.env.JWT_KEY,
            { expiresIn: "7d" }
        );

        res.json({
            token,
            user_id: user.user_id,
            user_name: user.user_name,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "회원가입 실패",
        });
    }
};

const login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await userModel.findUserByEmail(email);
        if (!user)
            return res.status(400).json({
                error: "존재하지 않는 사용자입니다",
            });

        const match = await bcrypt.compare(password, user.password);
        if (!match)
            return res.status(400).json({
                error: "비밀번호가 틀렸습니다",
            });

        const token = jwt.sign(
            {
                user_id: user.user_id,
                user_name: user.user_name,
            },
            process.env.JWT_KEY,
            { expiresIn: "7d" }
        );
        res.json({
            ...user,
            token,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "로그인 실패",
        });
    }
};

const getProfile = async (req, res) => {
    try {
        const user = await userModel.findUserById(req.user.user_id);
        const blog = await blogModel.findBlogByUserId(req.user.user_id);

        res.json({
            user_id: user.user_id,
            user_name: user.user_name,
            email: user.email,
            profile: user.profile,
            blog_title: blog?.title || "",
            blog_description: blog?.description || "",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "프로필 조회 실패",
        });
    }
};

const updateProfile = async (req, res) => {
    const { user_name, email, blog_title, blog_description } = req.body;

    try {
        const updatedUser = await userModel.updateUserProfile(req.user.user_id, user_name, email);

        const updatedBlog = await blogModel.updateBlog(req.user.user_id, blog_title, blog_description);

        res.json({
            user_id: updatedUser.user_id,
            user_name: updatedUser.user_name,
            email: updatedUser.email,
            profile: updatedUser.profile,
            blog_title: updatedBlog.title,
            blog_description: updatedBlog.description,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "프로필 수정 실패",
        });
    }
};

const updateProfilePhoto = async (req, res) => {
    try {
        console.log("req.file:", req.file);
        if (!req.file)
            return res.status(400).json({
                error: "파일이 업로드되지 않았습니다",
            });

        const fileName = req.file.filename;
        const updatedUser = await userModel.updateProfilePhoto(req.user.user_id, fileName);

        res.json({
            profile: updatedUser.profile,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: "프로필 사진 수정 실패",
        });
    }
};

module.exports = {
    signup,
    login,
    getProfile,
    updateProfile,
    updateProfilePhoto,
};
