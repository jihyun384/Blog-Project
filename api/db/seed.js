const bcrypt = require("bcrypt");
const pool = require("../config/db");

// 더미 데이터 비밀번호 (모든 시드 계정 공통)
const SEED_PASSWORD = "test1234";

// 추가할 사용자 (기존 사용자: 홍길동, 영희)
const users = [
    { user_name: "철수", email: "test3@gmail.com", blog_title: "철수의 개발일지", blog_description: "공부한 내용을 기록합니다" },
    { user_name: "민지", email: "test4@gmail.com", blog_title: "민지의 여행기록", blog_description: "국내 여행 이야기" },
    { user_name: "준호", email: "test5@gmail.com", blog_title: "준호의 운동일지", blog_description: "꾸준히 운동하기" },
    { user_name: "수아", email: "test6@gmail.com", blog_title: "수아의 집밥 레시피", blog_description: "간단한 집밥 기록" },
];

// 추가할 포스트 (cover는 비워두고 직접 등록)
const posts = [
    {
        key: "movie1",
        author: "영희",
        title: "인터스텔라 다시 보기",
        subtitle: "세 번째 관람 후기",
        content:
            "주말에 인터스텔라를 다시 봤어요<div><br></div><div>볼 때마다 새로운 장면이 눈에 들어오는 것 같아요</div><div>특히 도킹 장면은 몇 번을 봐도 손에 땀이 나네요</div>",
        categories: ["영화", "리뷰", "SF"],
        created_at: "2026-09-26 20:13:00",
    },
    {
        key: "movie2",
        author: "영희",
        title: "가을에 보기 좋은 영화 3편",
        subtitle: "선선한 날씨에 어울리는 영화",
        content:
            "가을이 되면 꼭 다시 찾게 되는 영화들이 있어요<div><br></div><div>1. 비포 선라이즈</div><div>2. 어바웃 타임</div><div>3. 리틀 포레스트</div><div><br></div><div>모두 잔잔하게 보기 좋은 영화예요</div>",
        categories: ["영화", "추천", "감동"],
        created_at: "2026-09-29 21:40:00",
    },
    {
        key: "dev1",
        author: "철수",
        title: "Express 라우터 정리",
        subtitle: "라우터를 나누는 이유",
        content:
            "프로젝트가 커지면서 server.js 하나에 라우트를 다 넣기가 힘들어졌어요<div><br></div><div>그래서 express.Router()로 기능별로 파일을 나눴습니다</div><div>컨트롤러와 모델까지 분리하니 훨씬 읽기 편해졌어요</div>",
        categories: ["개발", "Node.js"],
        created_at: "2026-09-27 14:05:00",
    },
    {
        key: "dev2",
        author: "철수",
        title: "PostgreSQL 트랜잭션 사용하기",
        subtitle: "BEGIN, COMMIT, ROLLBACK",
        content:
            "여러 테이블을 한 번에 수정할 때는 트랜잭션이 꼭 필요하더라고요<div><br></div><div>중간에 에러가 나면 ROLLBACK으로 전부 되돌릴 수 있어요</div><div>pool.connect()로 받은 client는 꼭 release() 해주세요</div>",
        categories: ["개발", "데이터베이스"],
        created_at: "2026-09-30 10:22:00",
    },
    {
        key: "trip1",
        author: "민지",
        title: "강릉 1박 2일 여행",
        subtitle: "바다 보고 커피 마시고",
        content:
            "오랜만에 강릉에 다녀왔어요<div><br></div><div>첫째 날은 안목해변 카페거리에서 커피를 마셨고</div><div>둘째 날은 경포호 주변을 자전거로 한 바퀴 돌았어요</div><div><br></div><div>저녁으로 먹은 장칼국수가 정말 맛있었어요</div>",
        categories: ["여행", "일상", "추천"],
        created_at: "2026-09-28 18:30:00",
    },
    {
        key: "workout1",
        author: "준호",
        title: "헬스 3개월 차 후기",
        subtitle: "작심삼일을 넘어서",
        content:
            "헬스장을 다닌 지 벌써 3개월이 됐어요<div><br></div><div>처음에는 스쿼트 자세도 몰랐는데 이제 루틴이 조금 잡혔어요</div><div>월수금은 하체와 등, 화목은 가슴과 어깨를 하고 있어요</div>",
        categories: ["운동", "일상"],
        created_at: "2026-09-25 07:50:00",
    },
    {
        key: "cook1",
        author: "수아",
        title: "10분 완성 계란볶음밥",
        subtitle: "냉장고 털이 레시피",
        content:
            "바쁜 날 자주 해 먹는 계란볶음밥이에요<div><br></div><div>1. 파기름을 먼저 내주세요</div><div>2. 계란을 스크램블 한 뒤 밥을 넣고 볶아요</div><div>3. 간장 한 숟가락과 굴소스 반 숟가락이면 끝!</div>",
        categories: ["요리", "점심", "메뉴"],
        created_at: "2026-10-01 12:15:00",
    },
];

// 댓글: reply가 있으면 해당 댓글의 대댓글로 등록
const comments = [
    {
        post: "movie1",
        author: "홍길동",
        content: "저도 이 영화 정말 좋아해요",
        replies: [{ author: "영희", content: "명작은 몇 번을 봐도 좋죠" }],
    },
    { post: "movie1", author: "철수", content: "OST가 정말 최고예요" },
    {
        post: "movie2",
        author: "민지",
        content: "어바웃 타임 저도 인생영화예요",
        replies: [{ author: "영희", content: "반가워요! 같이 다시 보고 싶네요" }],
    },
    { post: "movie2", author: "홍길동", content: "리틀 포레스트 이번 주말에 봐야겠어요" },
    {
        post: "dev1",
        author: "홍길동",
        content: "저도 라우터 나누는 중인데 도움 됐어요",
        replies: [
            { author: "철수", content: "도움이 됐다니 다행이에요" },
            { author: "홍길동", content: "미들웨어 정리도 올려주세요!" },
        ],
    },
    { post: "dev1", author: "영희", content: "개발 공부 화이팅입니다" },
    {
        post: "dev2",
        author: "민지",
        content: "release()를 빼먹어서 고생한 적이 있어요",
        replies: [{ author: "철수", content: "finally에서 꼭 해주는 게 좋더라고요" }],
    },
    { post: "dev2", author: "홍길동", content: "깔끔한 정리 감사합니다" },
    {
        post: "trip1",
        author: "영희",
        content: "사진만 봐도 힐링되네요",
        replies: [{ author: "민지", content: "직접 가면 더 좋아요!" }],
    },
    { post: "trip1", author: "철수", content: "장칼국수 집 이름 알려주세요" },
    { post: "trip1", author: "홍길동", content: "다음 여행지는 어디인가요?" },
    {
        post: "workout1",
        author: "철수",
        content: "저도 운동 시작해야 하는데 자극받고 갑니다",
        replies: [{ author: "준호", content: "같이 해요! 처음이 제일 어려워요" }],
    },
    { post: "workout1", author: "수아", content: "3개월 꾸준히 하신 거 대단해요" },
    {
        post: "cook1",
        author: "홍길동",
        content: "오늘 저녁 메뉴로 정했습니다",
        replies: [
            { author: "수아", content: "맛있게 드세요!" },
            { author: "홍길동", content: "굴소스 넣으니 확실히 맛있네요" },
        ],
    },
    { post: "cook1", author: "준호", content: "닭가슴살 넣어도 맛있을 것 같아요" },
];

// 좋아요 (포스트별로 누른 사용자) - 없는 포스트는 0개
const likes = {
    movie1: ["홍길동", "철수", "민지"],
    movie2: ["민지"],
    dev1: ["홍길동", "영희", "준호"],
    dev2: [],
    trip1: ["홍길동", "영희", "철수", "수아"],
    workout1: ["수아"],
    cook1: ["홍길동", "민지", "준호"],
};

// 팔로우 [팔로워, 팔로잉]
const follows = [
    ["철수", "홍길동"],
    ["민지", "영희"],
    ["홍길동", "철수"],
    ["영희", "민지"],
    ["준호", "수아"],
    ["수아", "준호"],
    ["수아", "영희"],
];

(async () => {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        const exists = await client.query(`SELECT 1 FROM "User" WHERE email = ANY($1)`, [users.map((u) => u.email)]);
        if (exists.rowCount > 0) throw new Error("이미 시드 데이터가 존재합니다");

        const hashedPassword = await bcrypt.hash(SEED_PASSWORD, 10);
        for (const u of users) {
            const userRes = await client.query(
                `INSERT INTO "User" (user_name, email, password)
                VALUES ($1, $2, $3)
                RETURNING user_id`,
                [u.user_name, u.email, hashedPassword]
            );
            await client.query(
                `INSERT INTO "Blog" (user_id, title, description)
                VALUES ($1, $2, $3)`,
                [userRes.rows[0].user_id, u.blog_title, u.blog_description]
            );
        }

        // 사용자 이름 → user_id, blog_id
        const userRows = await client.query(
            `SELECT u.user_id, u.user_name, b.blog_id
            FROM "User" u
            JOIN "Blog" b ON u.user_id = b.user_id`
        );
        const userMap = Object.fromEntries(userRows.rows.map((r) => [r.user_name, r]));
        const userOf = (name) => {
            if (!userMap[name]) throw new Error(`사용자를 찾을 수 없습니다: ${name}`);
            return userMap[name];
        };

        // 포스트 key → post_id
        const postMap = {};
        for (const p of posts) {
            const postRes = await client.query(
                `INSERT INTO "Post" (blog_id, title, subtitle, content, created_at)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING post_id`,
                [userOf(p.author).blog_id, p.title, p.subtitle, p.content, p.created_at]
            );
            const post_id = postRes.rows[0].post_id;
            postMap[p.key] = post_id;

            for (const catName of p.categories) {
                const catRes = await client.query(
                    `INSERT INTO "Category" (name)
                    VALUES ($1)
                    ON CONFLICT (name) DO UPDATE SET name = EXCLUDED.name
                    RETURNING category_id`,
                    [catName]
                );
                await client.query(
                    `INSERT INTO "PostCategory" (post_id, category_id)
                    VALUES ($1, $2)`,
                    [post_id, catRes.rows[0].category_id]
                );
            }
        }
        const postOf = (key) => {
            if (!postMap[key]) throw new Error(`포스트를 찾을 수 없습니다: ${key}`);
            return postMap[key];
        };

        for (const c of comments) {
            const post_id = postOf(c.post);
            const parentRes = await client.query(
                `INSERT INTO "Comment" (post_id, user_id, content)
                VALUES ($1, $2, $3)
                RETURNING comment_id`,
                [post_id, userOf(c.author).user_id, c.content]
            );
            for (const r of c.replies || []) {
                await client.query(
                    `INSERT INTO "Comment" (post_id, user_id, parent_id, content)
                    VALUES ($1, $2, $3, $4)`,
                    [post_id, userOf(r.author).user_id, parentRes.rows[0].comment_id, r.content]
                );
            }
        }

        for (const [key, names] of Object.entries(likes)) {
            for (const name of names) {
                await client.query(
                    `INSERT INTO "Like" (post_id, user_id)
                    VALUES ($1, $2)
                    ON CONFLICT (post_id, user_id) DO NOTHING`,
                    [postOf(key), userOf(name).user_id]
                );
            }
        }

        for (const [follower, following] of follows) {
            await client.query(
                `INSERT INTO "Follower" (follower_user_id, following_user_id)
                VALUES ($1, $2)
                ON CONFLICT (follower_user_id, following_user_id) DO NOTHING`,
                [userOf(follower).user_id, userOf(following).user_id]
            );
        }

        // 추가한 포스트의 카운트 컬럼을 실제 데이터와 맞춤
        await client.query(
            `UPDATE "Post" p
            SET comment_count = (SELECT COUNT(*) FROM "Comment" c WHERE c.post_id = p.post_id),
                like_count = (SELECT COUNT(*) FROM "Like" l WHERE l.post_id = p.post_id)
            WHERE p.post_id = ANY($1)`,
            [Object.values(postMap)]
        );

        await client.query("COMMIT");
        console.log(`시드 데이터 생성 완료 (비밀번호: ${SEED_PASSWORD})`);
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("시드 데이터 생성 실패:", err.message);
        process.exitCode = 1;
    } finally {
        client.release();
        await pool.end();
    }
})();
