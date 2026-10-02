document.addEventListener("DOMContentLoaded", () => {
    let mode = "signup";

    const userNameInput = document.getElementById("user_name");
    const passwordCheckBox = document.getElementById("password-check");
    const submitBtn = document.getElementById("submit-btn");

    function resetClass(element, clasIName) {
        element.classList.remove(clasIName);
    }

    document.querySelector(".show-signup").addEventListener("click", () => {
        mode = "signup";
        const form = document.querySelector(".form");
        resetClass(form, "signin");
        resetClass(form, "reset");
        form.classList.add("signup");

        userNameInput.style.display = "block";
        passwordCheckBox.style.display = "block";

        document.getElementById("submit-btn").innerText = "회원가입";
    });

    document.querySelector(".show-signin").addEventListener("click", () => {
        mode = "login";
        const form = document.querySelector(".form");
        resetClass(form, "signup");
        resetClass(form, "reset");
        form.classList.add("signin");

        userNameInput.style.display = "none";
        passwordCheckBox.style.display = "none";

        document.getElementById("submit-btn").innerText = "로그인";
    });

    submitBtn.addEventListener("click", async () => {
        console.log("현재 모드:", mode);
        const email = document.getElementById("email").value;
        const password = document.getElementById("password").value;

        if (mode === "signup") {
            const user_name = document.getElementById("user_name").value;
            const passwordCheck = document.getElementById("password-check").value;

            if (password !== passwordCheck) {
                alert("비밀번호가 일치하지 않습니다");
                return;
            }

            try {
                const res = await fetch("http://localhost:3000/users/signup", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        user_name,
                        email,
                        password,
                    }),
                });
                const data = await res.json();

                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    alert("성공적으로 회원가입이 완료되었습니다");
                    window.location.href = "index.html";
                } else {
                    alert(data.error || "회원가입 실패");
                }
            } catch (err) {
                console.error(err);
                alert("회원가입 중 오류가 발생했습니다");
            }
        } else if (mode === "login") {
            console.log("로그인 시도:", { email, password });
            try {
                const res = await fetch("http://localhost:3000/users/login", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        email,
                        password,
                    }),
                });
                const data = await res.json();
                console.log("로그인 응답:", data);

                if (res.ok) {
                    localStorage.setItem("token", data.token);
                    localStorage.setItem("user_id", data.user_id);
                    localStorage.setItem("user_name", data.user_name);

                    alert("성공적으로 로그인이 완료되었습니다");
                    window.location.href = "index.html";
                } else {
                    alert(data.error || "로그인 실패");
                }
            } catch (err) {
                console.error(err);
                alert("로그인 중 오류가 발생했습니다");
            }
        }
    });
});
