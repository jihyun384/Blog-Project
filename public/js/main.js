document.addEventListener("DOMContentLoaded", async () => {
    const postContainer = document.querySelector("#recommend-post-list");
    const blogContainer = document.querySelector("#recommend-blog-list");

    const posts = await (await fetch("/main/posts")).json();
    if (postContainer) {
        const list = document.createElement("div");
        list.classList.add("list-group");
        posts.slice(0, 5).forEach((post) => {
            const item = document.createElement("a");
            item.href = `../post.html?post_id=${post.post_id}`;
            item.classList.add("list-group-item", "list-group-item-action");
            item.innerHTML = `
                <div class="d-flex align-items-center">
                    <div id="imgList" class="me-2">
                        <img src="uploads/cover/${post.cover}" id="listImg" alt="Post Cover"/>
                    </div>
                    <div class="flex-grow-1 me-3">
                        <h5 class="mb-1">${post.title}</h5>
                        <p class="mb-1">${post.subtitle || ""}</p>
                        <p class="mb-1">${post.user_name || ""}</p>
                        <div class="d-flex justify-content-between mt-3">
                            <small>❤️ ${post.like_count} | 💬 ${post.comment_count}</small>
                            <small>${new Date(post.created_at).toLocaleDateString()}</small>
                        </div>
                    </div>
                </div>`;
            list.appendChild(item);
        });
        postContainer.appendChild(list);
    }

    const blogs = await (await fetch("/main/blogs")).json();
    if (blogContainer) {
        for (const blog of blogs) {
            const item = document.createElement("div");
            item.classList.add("d-flex", "align-items-center", "mb-3", "border-bottom", "pb-2");

            let followBtnHTML = "";
            if (window.currentUser && window.currentUser.user_id !== blog.user_id) {
                const followStatusRes = await fetch(`/follow/status/${blog.user_id}`, {
                    headers: { Authorization: `Bearer ${window.token}` },
                });
                const { isFollowing } = await followStatusRes.json();
                followBtnHTML = `
                    <button class="btn btn-sm ${isFollowing ? "btn-primary" : "btn-outline-primary"} follow-btn" data-user-id="${blog.user_id}">
                        ${isFollowing ? "팔로잉" : "팔로우"}
                    </button>`;
            }

            item.innerHTML = `
                <img src="uploads/profile/${blog.profile}" class="rounded-circle me-2" width="40" height="40">
                <div class="flex-grow-1">
                    <a href="../blog.html?id=${blog.blog_id}" class="text-decoration-none text-dark">
                        <strong>${blog.title}</strong><br>
                        <small class="text-muted">${blog.user_name}</small>
                    </a>
                </div>
                ${followBtnHTML}
            `;
            blogContainer.appendChild(item);
        }
    }
});
