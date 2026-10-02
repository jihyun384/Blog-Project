document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");

    if (!token) {
        alert("로그인이 필요합니다");
        window.location.href = "../login.html";
        return;
    }

    const urlParams = new URLSearchParams(window.location.search);
    const postId = parseInt(urlParams.get("post_id"));
    if (!postId) {
        alert("잘못된 접근입니다");
        window.location.href = "../index.html";
        return;
    }

    let currentUser;
    try {
        const resUser = await fetch("/users/profile", { headers: { Authorization: `Bearer ${token}` } });
        if (!resUser.ok) throw new Error("유저 정보 불러오기 실패");
        currentUser = await resUser.json();
    } catch (err) {
        console.error(err);
        alert(err.message);
        return;
    }

    let post;
    try {
        const res = await fetch(`/posts/${postId}`, { headers: { Authorization: `Bearer ${token}` } });
        if (!res.ok) throw new Error("포스트를 불러오는데 실패했습니다");
        post = await res.json();
    } catch (err) {
        console.error(err);
        alert(err.message);
        return;
    }

    const blogUrl = `../blog.html?id=${post.user_id}`;

    document.querySelector("h2.fst").textContent = post.title;
    document.querySelector("h4.sbt").textContent = post.subtitle;
    document.getElementById("post-meta").innerHTML = `<a href="${blogUrl}">${post.user_name}</a> | ${new Date(post.created_at).toLocaleDateString()}`;
    document.getElementById("post-body").innerHTML = post.content;

    const categoryContainer = document.getElementById("post-categories");
    if (post.categories && post.categories.length > 0) {
        categoryContainer.innerHTML = `<div class="d-flex flex-wrap align-items-center gap-2">
            <strong></strong>
            ${post.categories.map((cat) => `<span class="badge bg-secondary text-light p-2">${cat}</span>`).join("")}
        </div>
    `;
    } else {
        categoryContainer.innerHTML = `<span class="text-muted">카테고리 없음</span>`;
    }

    const commentBtn = document.getElementById("comment-btn");
    commentBtn.href = `../comment.html?post_id=${post.post_id}`;

    const likeBtn = document.getElementById("like-btn");
    let liked = post.liked ?? false;
    let like_count = post.like_count ?? 0;

    function updateLikeBtn() {
        likeBtn.textContent = `❤️ ${like_count}`;
        likeBtn.classList.toggle("liked", liked);
    }

    async function updateLike() {
        try {
            const res = await fetch(`/posts/${post.post_id}/like`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) throw new Error("좋아요 실패");

            const data = await res.json();
            like_count = data.like_count ?? 0;
            liked = data.liked;

            updateLikeBtn();
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    }

    updateLikeBtn();

    likeBtn.addEventListener("click", updateLike);

    if (currentUser.user_id === post.user_id) {
        const ownerActions = document.getElementById("owner-actions");
        ownerActions.style.display = "flex";

        document.getElementById("edit-btn").addEventListener("click", () => {
            window.location.href = `../update.html?post_id=${post.post_id}`;
        });

        document.getElementById("delete-btn").addEventListener("click", async () => {
            if (!confirm("정말 삭제하시겠습니까?")) return;
            try {
                const res = await fetch(`/posts/${post.post_id}`, {
                    method: "DELETE",
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (!res.ok) throw new Error("삭제 실패");
                alert("삭제되었습니다");
                window.location.href = "../index.html";
            } catch (err) {
                console.error(err);
                alert(err.message);
            }
        });
    }

    try {
        const resPosts = await fetch(`/blogs/${post.blog_id}/posts`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!resPosts.ok) throw new Error("블로그 포스트 불러오기 실패");
        const blogPosts = await resPosts.json();
        const sortedPosts = blogPosts.sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
        const currentIndex = sortedPosts.findIndex((p) => p.post_id === post.post_id);

        const prevBtn = document.getElementById("prev-btn");
        const nextBtn = document.getElementById("next-btn");

        if (currentIndex > 0) {
            prevBtn.addEventListener("click", () => {
                window.location.href = `../post.html?post_id=${sortedPosts[currentIndex - 1].post_id}`;
            });
        } else prevBtn.disabled = true;

        if (currentIndex < sortedPosts.length - 1) {
            nextBtn.addEventListener("click", () => {
                window.location.href = `../post.html?post_id=${sortedPosts[currentIndex + 1].post_id}`;
            });
        } else if (currentIndex === sortedPosts.length - 1 && currentUser.user_id === post.user_id) {
            nextBtn.textContent = "새 글 작성";
            nextBtn.classList.add("next-btn");
            nextBtn.addEventListener("click", () => {
                window.location.href = `../form.html?blog_id=${post.blog_id}`;
            });
        } else {
            nextBtn.disabled = true;
        }
    } catch (err) {
        console.error(err);
        alert(err.message);
    }
});
