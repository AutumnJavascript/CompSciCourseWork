import { createCookie } from "react-router";

export const jwtToken = createCookie("jwt", {
    httpOnly: false,
    sameSite: true,
    secure: false
});
