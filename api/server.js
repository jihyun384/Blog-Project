const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");
const app = express();

require("dotenv").config();

app.use(cors());
app.use(express.json());
app.use(
    express.urlencoded({
        extended: true,
    })
);
app.use(bodyParser.json());

const userRoutes = require("./routers/userRoutes");
const blogRoutes = require("./routers/blogRoutes");
const postRoutes = require("./routers/postRoutes");
const mainRouter = require("./routers/mainRoutes");
const searchRouter = require("./routers/searchRoutes.js");
const followRouter = require("./routers/followRoutes.js");
const commentRouter = require("./routers/commentRoutes");

app.use("/", express.static(path.join(__dirname, "../page")));
app.use("/public", express.static(path.join(__dirname, "../public")));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/main", mainRouter);
app.use("/users", userRoutes);
app.use("/blogs", blogRoutes);
app.use("/posts", postRoutes);
app.use("/search", searchRouter);
app.use("/follow", followRouter);
app.use("/comments", commentRouter);

app.listen(3000, () => console.log("http://localhost:3000 에서 서버 실행 중"));
