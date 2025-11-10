import { likepost } from "../../../database/modules/postgresql";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt, verifyjwt } from "../../../modules/webToken";
import { redirect } from "react-router";

export async function action({request, params}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    if (!cookie) {
        //  If there is no cookie
        return {ok: false}

    } else if (!verifyjwt(cookie)) {
        //  cookie invalid
        return redirect("/login", {
            headers: {
                "Set-Cookie": await jwtToken.serialize("", {
                    maxAge: 1
                })
            }
        });
    }

    const response = await likepost(cookiepayload.user_id, params.postid);

    return {ok: true, ...response};
}