import { index, route } from "@react-router/dev/routes";

export default [
    index("./routes/index.jsx"),
    route("login", "./routes/login.jsx"),
    route("register", "./routes/register.jsx"),

    // api routes
    route("api/login", "./routes/api/api.login.jsx"),
    route("api/register", "./routes/api/api.register.jsx"),
];
