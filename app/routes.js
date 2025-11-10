import { index, route } from "@react-router/dev/routes";

export default [
    index("./routes/index.jsx"),
    route("login", "./routes/login.jsx"),
    route("register", "./routes/register.jsx"),
    route("createpost", "./routes/createPost.jsx"),
    route(".well-known/appspecific/com.chrome.devtools.json", "./routes/dev.jsx"),

    // api routes
    route("api/login", "./routes/api/api.login.jsx"),
    route("api/register", "./routes/api/api.register.jsx"),
    route("api/createpost", "./routes/api/api.createpost.jsx"),
    route("api/likepost/:postid", "./routes/api/api.likepost.jsx"),
    route("api/createcomment", "./routes/api/api.createcomment.jsx"),
    route("api/getcomment/:postid", "./routes/api/api.getcomment.jsx"),
];
