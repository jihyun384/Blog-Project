document.getElementById("searchBtn").addEventListener("click", async () => {
    const query = document.getElementById("searchInput").value.trim();
    if (!query) return alert("검색어를 입력하세요!");

    const postContainer = document.querySelector("#postResults");
    const blogContainer = document.querySelector("#blogResults");

    const token = localStorage.getItem("token");
    const currentUser = await getProfileIfValid(token);

    try {
        const res = await fetch(`/search?query=${encodeURIComponent(query)}`);
        const data = await res.json();

        postContainer.innerHTML = "";
        blogContainer.innerHTML = "";

        if (data.posts && data.posts.length > 0) {
            const list = document.createElement("div");
            list.classList.add("list-group");

            data.posts.forEach((post) => {
                const item = document.createElement("a");
                item.href = `../post.html?post_id=${post.post_id}`;
                item.classList.add("list-group-item", "list-group-item-action");
                item.innerHTML = `<div class="d-flex align-items-center">
                        <div id="imgList" class="me-2">
                            <img src="uploads/cover/${post.cover}" id="listImg" alt="Post Cover" />
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
                    </div>
                `;
                list.appendChild(item);
            });

            postContainer.appendChild(list);
        } else {
            postContainer.innerHTML = "<p class='no-result'>검색 결과가 없습니다</p>";
        }

        if (data.blogs && data.blogs.length > 0) {
            for (const blog of data.blogs) {
                const item = document.createElement("div");
                item.classList.add("d-flex", "align-items-center", "mb-3", "border-bottom", "pb-2");

                let followBtnHTML = "";
                if (currentUser && currentUser.user_id !== blog.user_id) {
                    const followStatusRes = await fetch(`/follow/status/${blog.user_id}`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    const { isFollowing } = await followStatusRes.json();

                    followBtnHTML = `<button class="btn btn-sm ${isFollowing ? "btn-primary" : "btn-outline-primary"} follow-btn" data-user-id="${blog.user_id}">
                            ${isFollowing ? "팔로잉" : "팔로우"}
                        </button>
                    `;
                }

                item.innerHTML = `<img src="uploads/profile/${blog.profile}" class="rounded-circle me-2" width="40" height="40">
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
        } else {
            blogContainer.innerHTML = "<p class='no-result'>검색 결과가 없습니다</p>";
        }
    } catch (err) {
        console.error("검색 오류:", err);
        alert("검색 중 오류가 발생했습니다");
    }
});

document.addEventListener("click", async (e) => {
    if (!e.target.classList.contains("follow-btn")) return;
    const token = localStorage.getItem("token");
    const userId = e.target.dataset.userId;

    try {
        const res = await fetch(`/follow/toggle/${userId}`, {
            method: "POST",
            headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();

        if (data.isFollowing) {
            e.target.textContent = "팔로잉";
            e.target.classList.remove("btn-outline-primary");
            e.target.classList.add("btn-primary");
        } else {
            e.target.textContent = "팔로우";
            e.target.classList.remove("btn-primary");
            e.target.classList.add("btn-outline-primary");
        }
    } catch (err) {
        console.error("팔로우 오류:", err);
    }
});

async function getProfileIfValid(token) {
    if (!token) return null;
    try {
        const res = await fetch("/users/profile", {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return null;
        return await res.json();
    } catch (err) {
        console.error("getProfileIfValid error:", err);
        return null;
    }
}
