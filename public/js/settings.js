document.addEventListener("DOMContentLoaded", () => {
    const token = localStorage.getItem("token");
    if (!token) {
        alert("로그인이 필요합니다");
        window.location.href = "../login.html";
        return;
    }

    const profileImg = document.getElementById("profileImage");

    const changePhotoBtn = document.getElementById("changePhotoBtn");
    const profileFile = document.getElementById("profileFile");
    const updateBtn = document.getElementById("changeBtn");
    const cancelBtn = document.getElementById("cancelBtn");
    const logoutBtn = document.getElementById("logoutBtn");

    async function loadProfile() {
        try {
            const res = await fetch("http://localhost:3000/users/profile", {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (!res.ok) {
                console.error("loadProfile failed, status:", res.status);
                if (res.status === 401) {
                    localStorage.removeItem("token");
                    window.location.href = "../login.html";
                }
                return;
            }
            const data = await res.json();

            const nameInput = document.querySelector("input[placeholder='이름']");
            const emailInput = document.querySelector("input[placeholder='이메일']");
            const blogTitleInput = document.querySelector("input[placeholder='블로그 제목']");
            const blogDescInput = document.querySelector("input[placeholder='블로그 설명']");

            if (nameInput) nameInput.value = data.user_name || "";
            if (emailInput) emailInput.value = data.email || "";
            if (blogTitleInput) blogTitleInput.value = data.blog_title || "";
            if (blogDescInput) blogDescInput.value = data.blog_description || "";

            if (data.profile && profileImg) {
                profileImg.src = `http://localhost:3000/uploads/profile/${data.profile}?t=${Date.now()}`;
            }
        } catch (err) {
            console.error("loadProfile error:", err);
            alert("프로필 정보를 불러올 수 없습니다");
        }
    }

    if (changePhotoBtn && profileFile) {
        changePhotoBtn.addEventListener("click", (e) => {
            e.preventDefault();
            profileFile.click();
        });
    }

    if (profileFile) {
        profileFile.addEventListener("change", async () => {
            const file = profileFile.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                profileImg.src = e.target.result;
            };
            reader.readAsDataURL(file);

            const formData = new FormData();
            formData.append("profile", file);

            try {
                const res = await fetch("http://localhost:3000/users/profile/photo", {
                    method: "put",
                    headers: { Authorization: `Bearer ${token}` },
                    body: formData,
                });
                const data = await res.json();

                if (!res.ok) {
                    alert(data.error || "프로필 사진 수정 실패");
                    return;
                }

                profileImg.src = `http://localhost:3000/uploads/profile/${data.profile}?t=${Date.now()}`;
                alert("프로필 사진이 변경되었습니다");
            } catch (err) {
                console.error(err);
                alert("업로드 중 오류가 발생했습니다");
            }
        });
    }

    if (updateBtn) {
        updateBtn.addEventListener("click", async () => {
            const user_name = document.querySelector("input[placeholder='이름']").value;
            const email = document.querySelector("input[placeholder='이메일']").value;
            const blog_title = document.querySelector("input[placeholder='블로그 제목']").value;
            const blog_description = document.querySelector("input[placeholder='블로그 설명']").value;
            try {
                const res = await fetch("http://localhost:3000/users/profile", {
                    method: "put",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({
                        user_name,
                        email,
                        blog_title,
                        blog_description,
                    }),
                });
                const data = await res.json();
                if (res.ok) {
                    alert("계정 정보가 성공적으로 수정되었습니다");
                    await loadProfile();
                } else {
                    alert(data.error || "수정 실패");
                }
            } catch (err) {
                console.error(err);
                alert("계정 정보 수정 중 오류가 발생했습니다");
            }
        });
    }

    if (cancelBtn) {
        cancelBtn.addEventListener("click", (e) => {
            e.preventDefault();
            window.location.href = "../index.html";
        });
    }

    if (logoutBtn) {
        logoutBtn.addEventListener("click", (e) => {
            e.preventDefault();
            localStorage.removeItem("token");
            localStorage.removeItem("user_id");
            localStorage.removeItem("user_name");

            alert("로그아웃 되었습니다");
            window.location.href = "../index.html";
        });
    }

    loadProfile();
});
