document.addEventListener("DOMContentLoaded", async () => {
    const urlParams = new URLSearchParams(window.location.search);
    const blog_id = parseInt(urlParams.get("id"));
    const token = localStorage.getItem("token");

    let currentUser;
    try {
        const resUser = await fetch("/users/profile", { headers: { Authorization: `Bearer ${token}` } });
        if (!resUser.ok) {
            alert("로그인이 필요합니다");
            window.location.href = "../login.html";
            return;
        }
        currentUser = await resUser.json();
    } catch (err) {
        console.error(err);
        alert(err.message);
        return;
    }

    try {
        const res = await fetch(`/blogs/${blog_id}`);
        if (!res.ok) throw new Error("블로그 정보를 불러올 수 없습니다");
        const data = await res.json();
        const { blog, posts, categories } = data;

        const profileContainer = document.createElement("div");
        profileContainer.classList.add("profile-container", "p-4", "p-md-5", "mb-5", "rounded", "text-body-emphasis", "bg-body-secondary");
        let followBtnHTML = "";
        if (currentUser && currentUser.user_id !== blog.user_id) {
            const statusRes = await fetch(`/follow/status/${blog.user_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            let isFollowing = false;
            if (statusRes.ok) {
                const { isFollowing: followingStatus } = await statusRes.json();
                isFollowing = followingStatus;
            }

            followBtnHTML = `<button class="btn ${isFollowing ? "btn-primary" : "btn-outline-primary"} follow-btn" data-user-id="${blog.user_id}" style="width:40%;">
                    ${isFollowing ? "팔로잉" : "팔로우"}
                </button>
            `;
        }

        profileContainer.innerHTML = `<div class="col-lg-6 px-0">
                <div class="row flex-nowrap justify-content-between align-items-center">
                    <img class="profile-image" width="250" height="250" src="http://localhost:3000/uploads/profile/${blog.profile}" />
                    <div>
                        <h1 class="display-6"><b>${blog.title}</b></h1>
                        <p class="lead my-3">${blog.description}</p>
                        <p><b>${blog.user_name}</b></p>
                        ${followBtnHTML}
                    </div>
                </div>
            </div>
        `;

        document.querySelector("main.container")?.prepend(profileContainer);

        const postContainer = document.querySelector("#recommend-post-list");
        if (postContainer) {
            const list = document.createElement("div");
            list.classList.add("list-group");
            posts.slice(0, 5).forEach((post) => {
                const item = document.createElement("a");
                item.href = `../post.html?post_id=${post.post_id}`;
                item.classList.add("list-group-item", "list-group-item-action");
                item.innerHTML = `<div class="d-flex align-items-center">
                        <div id="imgList" class="me-2">
                            <img src="uploads/cover/${post.cover}" id="listImg" alt="Post Cover"/>
                        </div>
                        <div class="flex-grow-1 me-3">
                            <h5 class="mb-1">${post.title}</h5>
                            <p class="mb-1">${post.subtitle || ""}</p>
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
        }

        const categoryList = document.querySelector("#category-list");
        const allLi = document.createElement("li");
        allLi.innerHTML = `<a href="#" data-cat-id="all">전체보기</a>`;
        allLi.querySelector("a").addEventListener("click", async (e) => {
            e.preventDefault();
            try {
                const res = await fetch(`/blogs/${blog_id}/posts`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (!res.ok) throw new Error("전체 포스트 불러오기 실패");
                const allPosts = await res.json();

                const postContainer = document.querySelector("#recommend-post-list");
                postContainer.innerHTML = "";
                const list = document.createElement("div");
                list.classList.add("list-group");

                allPosts.forEach((post) => {
                    const item = document.createElement("a");
                    item.href = `../post.html?post_id=${post.post_id}`;
                    item.classList.add("list-group-item", "list-group-item-action");
                    item.innerHTML = `<div class="d-flex align-items-center">
                    <div id="imgList" class="me-2">
                        <img src="uploads/cover/${post.cover}" id="listImg" alt="Post Cover"/>
                    </div>
                    <div class="flex-grow-1 me-3">
                        <h5 class="mb-1">${post.title}</h5>
                        <p class="mb-1">${post.subtitle || ""}</p>
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
            } catch (err) {
                console.error(err);
                alert("전체 포스트 로딩 실패");
            }
        });
        categoryList.appendChild(allLi);

        categories.forEach((cat) => {
            const li = document.createElement("li");
            li.innerHTML = `<a href="#" data-cat-id="${cat.category_id}">${cat.name}</a>`;
            li.querySelector("a").addEventListener("click", async (e) => {
                e.preventDefault();
                try {
                    const res = await fetch(`/blogs/${blog_id}/categories/${cat.category_id}/posts`);
                    if (!res.ok) throw new Error("카테고리 포스트 불러오기 실패");
                    const catPosts = await res.json();

                    const postContainer = document.querySelector("#recommend-post-list");
                    postContainer.innerHTML = "";
                    const list = document.createElement("div");
                    list.classList.add("list-group");

                    catPosts.forEach((post) => {
                        const item = document.createElement("a");
                        item.href = `../post.html?post_id=${post.post_id}`;
                        item.classList.add("list-group-item", "list-group-item-action");
                        item.innerHTML = `<div class="d-flex align-items-center">
                        <div id="imgList" class="me-2">
                            <img src="uploads/cover/${post.cover}" id="listImg" alt="Post Cover"/>
                        </div>
                        <div class="flex-grow-1 me-3">
                            <h5 class="mb-1">${post.title}</h5>
                            <p class="mb-1">${post.subtitle || ""}</p>
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
                } catch (err) {
                    console.error(err);
                    alert("카테고리 포스트 로딩 실패");
                }
            });
            categoryList.appendChild(li);
        });

        const actionBtnContainer = document.getElementById("blog-action-btn");
        if (currentUser) {
            if (currentUser.user_id === blog.user_id) {
                actionBtnContainer.innerHTML = `<a id="subBtn" href="../form.html" class="btn btn-primary">포스트 작성하기</a>`;
            } else {
                actionBtnContainer.innerHTML = `<a id="subBtn" href="../settings.html" class="btn btn-secondary">계정 설정</a>`;
            }
        } else {
            actionBtnContainer.innerHTML = `<a href="../login.html" class="btn btn-sm btn-outline-secondary btn-login-or-settings">로그인 또는 회원가입</a>`;
        }
    } catch (err) {
        console.error(err);
        alert("블로그 데이터를 불러오는데 실패했습니다");
    }

    document.querySelector("a[aria-label='Search']")?.addEventListener("click", (e) => {
        e.preventDefault();
        window.location.href = "../search.html";
    });
});
