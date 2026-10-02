CREATE SCHEMA IF NOT EXISTS blog;
SET search_path TO blog;

CREATE TABLE IF NOT EXISTS "User" (
    user_id SERIAL PRIMARY KEY,
    user_name VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    profile TEXT DEFAULT 'profile.png',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS "Blog" (
    blog_id SERIAL PRIMARY KEY,
    user_id INT UNIQUE NOT NULL,
    title VARCHAR(100) NOT NULL DEFAULT '마이 블로그',
    description TEXT NOT NULL DEFAULT '안녕하세요',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_blog_user FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Post" (
    post_id SERIAL PRIMARY KEY,
    blog_id INT NOT NULL,
    title VARCHAR(200) NOT NULL,
    subtitle VARCHAR(200),
    content TEXT NOT NULL,
    cover TEXT, -- 표지는 선택 입력 (postModel에서 null 허용)
    like_count INT DEFAULT 0,
    comment_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_post_blog FOREIGN KEY (blog_id) REFERENCES "Blog"(blog_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Comment" (
    comment_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    parent_id INT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_comment_post FOREIGN KEY (post_id) REFERENCES "Post"(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_user FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_comment_parent FOREIGN KEY (parent_id) REFERENCES "Comment"(comment_id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS "Like" (
    like_id SERIAL PRIMARY KEY,
    post_id INT NOT NULL,
    user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_like_post FOREIGN KEY (post_id) REFERENCES "Post"(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_like_user FOREIGN KEY (user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_like UNIQUE (post_id, user_id)
);

CREATE TABLE IF NOT EXISTS "Follower" (
    follower_id SERIAL PRIMARY KEY,
    follower_user_id INT NOT NULL,
    following_user_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_follower_user FOREIGN KEY (follower_user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    CONSTRAINT fk_following_user FOREIGN KEY (following_user_id) REFERENCES "User"(user_id) ON DELETE CASCADE,
    CONSTRAINT uq_follow UNIQUE (follower_user_id, following_user_id)
);

CREATE TABLE IF NOT EXISTS "Category" (
    category_id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE IF NOT EXISTS "PostCategory" (
    post_id INT NOT NULL,
    category_id INT NOT NULL,
    CONSTRAINT fk_postcategory_post FOREIGN KEY (post_id) REFERENCES "Post"(post_id) ON DELETE CASCADE,
    CONSTRAINT fk_postcategory_category FOREIGN KEY (category_id) REFERENCES "Category"(category_id) ON DELETE CASCADE,
    CONSTRAINT uq_postcategory UNIQUE (post_id, category_id)
);
