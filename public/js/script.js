document.addEventListener("DOMContentLoaded", async () => {
    const token = localStorage.getItem("token");
    const currentUser = await getProfileIfValid(token);
    window.token = token;
    window.currentUser = currentUser;

    async function handleFollowClick(btn) {
        const followingUserId = btn.dataset.userId;
        if (!token) {
            alert("로그인이 필요합니다");
            window.location.href = "../login.html";
            return;
        }
        if (!followingUserId) return;

        try {
            const res = await fetch(`/follow/${followingUserId}/toggle`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!res.ok) throw new Error("팔로우 요청 실패");

            const data = await res.json();
            if (data.isFollowing) {
                btn.textContent = "팔로잉";
                btn.classList.remove("btn-outline-primary");
                btn.classList.add("btn-primary");
            } else {
                btn.textContent = "팔로우";
                btn.classList.remove("btn-primary");
                btn.classList.add("btn-outline-primary");
            }
        } catch (err) {
            console.error(err);
            alert("팔로우 처리 중 오류 발생");
        }
    }

    document.body.addEventListener("click", (e) => {
        if (e.target.classList.contains("follow-btn")) handleFollowClick(e.target);
    });

    const loginBtn = document.querySelector(".btn-login-or-settings");
    if (loginBtn) {
        if (currentUser) {
            loginBtn.textContent = "계정 설정";
            loginBtn.classList.replace("btn-outline-secondary", "btn-primary");
            loginBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = "../settings.html";
            };
        } else {
            loginBtn.textContent = "로그인 또는 회원가입";
            loginBtn.classList.replace("btn-primary", "btn-outline-secondary");
            loginBtn.onclick = (e) => {
                e.preventDefault();
                window.location.href = "../login.html";
            };
        }
    }

    async function getProfileIfValid(token) {
        if (!token) return null;
        try {
            const res = await fetch("/users/profile", { headers: { Authorization: `Bearer ${token}` } });
            if (!res.ok) return null;
            return await res.json();
        } catch (err) {
            console.error("getProfileIfValid error:", err);
            return null;
        }
    }
    window.getProfileIfValid = getProfileIfValid;

    document.body.addEventListener("click", (e) => {
        if (e.target.classList.contains("follow-btn")) handleFollowClick(e.target);
    });

    window.getProfileIfValid = getProfileIfValid;
    window.currentUser = currentUser;
    window.token = token;
});
