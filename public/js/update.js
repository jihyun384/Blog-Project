document.addEventListener("DOMContentLoaded", async () => {
    const editor = document.getElementById("editor");

    const btnBold = document.getElementById("btn-bold");
    const btnItalic = document.getElementById("btn-italic");
    const btnUnderline = document.getElementById("btn-underline");
    const btnStrike = document.getElementById("btn-strike");
    const btnOrderedList = document.getElementById("btn-ordered-list");
    const btnUnorderedList = document.getElementById("btn-unordered-list");
    const coverInput = document.getElementById("cover-input");
    const imageInput = document.getElementById("image-input");

    const categoryInput = document.getElementById("category-input");
    const categoryContainer = document.getElementById("category-container");
    let categories = [];

    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get("post_id");
    const token = localStorage.getItem("token");

    if (postId) {
        try {
            const res = await fetch(`/posts/${postId}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "포스트 불러오기 실패");

            const titleInput = document.getElementById("post-title");
            const subtitleInput = document.getElementById("post-subtitle");

            if (titleInput) titleInput.value = data.title || "";
            if (subtitleInput) subtitleInput.value = data.subtitle || "";
            if (editor) editor.innerHTML = data.content || "";

            categories = Array.isArray(data.categories) ? data.categories : [];
            renderCategories();

            const coverImg = document.getElementById("cover-img");
            if (coverImg && data.cover) {
                coverImg.src = `http://localhost:3000/uploads/cover/${data.cover}`;
            }
        } catch (err) {
            console.error(err);
            alert("포스트 불러오기 실패");
        }
    }

    function setStyle(style) {
        document.execCommand(style, false, null);
        focusEditor();
        checkStyle();
    }

    function focusEditor() {
        editor.focus({
            preventScroll: true,
        });
    }

    function checkStyle() {
        toggleActive(btnBold, "bold");
        toggleActive(btnItalic, "italic");
        toggleActive(btnUnderline, "underline");
        toggleActive(btnStrike, "strikeThrough");
        toggleActive(btnOrderedList, "insertOrderedList");
        toggleActive(btnUnorderedList, "insertUnorderedList");
    }

    function toggleActive(button, style) {
        if (document.queryCommandState(style)) {
            button.classList.add("active");
        } else {
            button.classList.remove("active");
        }
    }

    btnBold.addEventListener("click", () => setStyle("bold"));
    btnItalic.addEventListener("click", () => setStyle("italic"));
    btnUnderline.addEventListener("click", () => setStyle("underline"));
    btnStrike.addEventListener("click", () => setStyle("strikeThrough"));
    btnOrderedList.addEventListener("click", () => setStyle("insertOrderedList"));
    btnUnorderedList.addEventListener("click", () => setStyle("insertUnorderedList"));

    imageInput.addEventListener("change", (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = document.createElement("img");
            img.src = ev.target.result;

            const range = window.getSelection().getRangeAt(0);
            range.insertNode(img);

            range.setStartAfter(img);
            range.setEndAfter(img);
            window.getSelection().removeAllRanges();
            window.getSelection().addRange(range);
        };
        reader.readAsDataURL(file);
    });

    editor.addEventListener("keyup", checkStyle);
    editor.addEventListener("mouseup", checkStyle);

    function renderCategories() {
        categoryContainer.querySelectorAll(".category-tag").forEach((el) => el.remove());

        categories.forEach((cat, index) => {
            const tag = document.createElement("span");
            tag.className = "badge bg-secondary me-1 mb-1 category-tag";
            tag.textContent = cat;

            const removeBtn = document.createElement("button");
            removeBtn.type = "button";
            removeBtn.className = "btn-close btn-close-white btn-sm ms-1";
            removeBtn.style.fontSize = "0.6rem";
            removeBtn.onclick = () => {
                categories.splice(index, 1);
                renderCategories();
            };

            tag.appendChild(removeBtn);
            categoryContainer.insertBefore(tag, categoryInput);
        });
    }

    categoryInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter" || e.key === ",") {
            e.preventDefault();
            const value = categoryInput.value.trim();
            if (value && !categories.includes(value)) {
                categories.push(value);
                renderCategories();
            }
            categoryInput.value = "";
        }
    });

    const completeBtn = document.getElementById("complete-btn");
    const completeModal = new bootstrap.Modal(document.getElementById("completeModal"));
    completeBtn.addEventListener("click", () => completeModal.show());

    document.getElementById("submit-btn").addEventListener("click", async () => {
        const title = document.getElementById("post-title").value;
        const subtitle = document.getElementById("post-subtitle").value;
        const content = editor.innerHTML;

        if (!title || !content) {
            alert("제목과 내용을 입력해주세요");
            return;
        }
        if (categories.length === 0) {
            alert("최소 1개 이상의 카테고리를 입력해주세요");
            return;
        }

        const formData = new FormData();
        formData.append("title", title);
        formData.append("subtitle", subtitle);
        formData.append("content", content);
        formData.append("categories", JSON.stringify(categories));
        if (coverInput.files[0]) formData.append("cover", coverInput.files[0]);

        try {
            const res = await fetch(`/posts/${postId}`, {
                method: "put",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "포스트 작성 실패");

            window.location.href = `post.html?post_id=${data.post_id}`;
        } catch (err) {
            console.error("에러:", err);
            alert(err.message);
        }
    });

    document.getElementById("cancel-btn").addEventListener("click", () => {
        if (confirm("작성 중인 내용을 취소하시겠습니까?")) window.history.back();
    });
});
