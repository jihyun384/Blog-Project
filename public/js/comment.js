document.addEventListener("DOMContentLoaded", () => {
    const commentsContainer = document.getElementById("comments-container");
    const commentContent = document.getElementById("comment-content");
    const commentSubmit = document.getElementById("comment-submit");

    const token = localStorage.getItem("token");
    const currentUserId = parseInt(localStorage.getItem("user_id"));
    const currentUserName = localStorage.getItem("user_name");
    const post_id = getPostIdFromURL();

    let comments = [];
    let blogId = null;

    function getPostIdFromURL() {
        const params = new URLSearchParams(window.location.search);
        const postId = parseInt(params.get("post_id"));
        if (isNaN(postId)) {
            alert("올바른 포스트 ID가 없습니다");
            throw new Error("post_id가 유효하지 않습니다!");
        }
        return postId;
    }

    async function loadComments() {
        try {
            const res = await fetch(`/comments/${post_id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("댓글 로드 실패");
            const data = await res.json();

            comments = data.comments || [];
            blogId = data.blog_author || null;

            renderComments(comments, commentsContainer);
        } catch (err) {
            console.error(err);
            commentsContainer.innerHTML = `<p class="text-danger">댓글을 불러오지 못했습니다</p>`;
        }
    }

    function renderComments(list, container) {
        container.innerHTML = "";
        if (!Array.isArray(list)) return;

        list.forEach((comment) => {
            console.log("comment.user_id:", comment.user_id, "currentUserId:", currentUserId, "blogId:", blogId);

            const commentEl = document.createElement("div");
            commentEl.className = "comment mb-2";

            commentEl.innerHTML = `<div class="comment-content p-2 border rounded">
                    <strong>${comment.user_name || "익명"}</strong>
                    <small class="text-muted ms-2">${new Date(comment.created_at).toLocaleString()}</small>
                    <p class="mb-1">${comment.content}</p>
                </div>
            `;

            const actions = document.createElement("div");
            actions.className = "comment-actions mb-2";

            const replyBtn = document.createElement("button");
            replyBtn.className = "btn btn-sm btn-link";
            replyBtn.textContent = "대댓글 달기";
            replyBtn.onclick = () => showReplyForm(commentEl, comment.comment_id);
            actions.appendChild(replyBtn);

            if (comment.user_id === currentUserId) {
                const editBtn = document.createElement("button");
                editBtn.className = "btn btn-sm btn-link";
                editBtn.textContent = "수정";
                editBtn.onclick = () => editComment(comment.comment_id, comment.content);
                actions.appendChild(editBtn);
            }

            if (comment.user_id === currentUserId || Number(blogId) === currentUserId) {
                const deleteBtn = document.createElement("button");
                deleteBtn.className = "btn btn-sm btn-link text-danger";
                deleteBtn.textContent = "삭제";
                deleteBtn.onclick = () => deleteComment(comment.comment_id);
                actions.appendChild(deleteBtn);
            }

            commentEl.appendChild(actions);

            if (comment.children && comment.children.length > 0) {
                const repliesContainer = document.createElement("div");
                repliesContainer.className = "replies ms-4";
                renderComments(comment.children, repliesContainer);
                commentEl.appendChild(repliesContainer);
            }

            container.appendChild(commentEl);
        });
    }

    commentSubmit.addEventListener("click", async () => {
        const content = commentContent.value.trim();
        if (!content) return alert("댓글 내용을 입력해주세요.");

        try {
            const res = await fetch(`/comments/${post_id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content,
                }),
            });

            if (!res.ok) throw new Error("댓글 작성 실패");

            commentContent.value = "";
            loadComments();
        } catch (err) {
            console.error(err);
            alert("댓글 작성 실패");
        }
    });

    function showReplyForm(parentEl, parentId) {
        const formDiv = document.createElement("div");
        formDiv.className = "mt-2";

        const input = document.createElement("input");
        input.type = "text";
        input.placeholder = "댓글 내용을 입력하세요";
        input.className = "form-control mb-1";

        const btn = document.createElement("button");
        btn.className = "btn btn-sm btn-primary";
        btn.textContent = "등록";
        btn.onclick = async () => {
            const content = input.value.trim();
            if (!content) return;

            try {
                await fetch(`/comments/${post_id}`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        content,
                        parent_id: parentId,
                    }),
                });
                loadComments();
            } catch (err) {
                console.error(err);
                alert("댓글 작성 실패");
            }
        };

        formDiv.appendChild(input);
        formDiv.appendChild(btn);
        parentEl.appendChild(formDiv);
    }

    async function deleteComment(commentId) {
        if (!confirm("정말 삭제하시겠습니까?")) return;

        try {
            const res = await fetch(`/comments/${post_id}/${commentId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("댓글 삭제 실패");
            loadComments();
        } catch (err) {
            console.error(err);
            alert("댓글 삭제 실패");
        }
    }

    async function editComment(commentId, oldContent) {
        const newContent = prompt("댓글 내용을 수정하세요", oldContent);
        if (!newContent) return;

        try {
            const res = await fetch(`/comments/${post_id}/${commentId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    content: newContent,
                }),
            });

            if (!res.ok) throw new Error("댓글 수정 실패");
            loadComments();
        } catch (err) {
            console.error(err);
            alert("댓글 수정 실패");
        }
    }

    loadComments();
});
