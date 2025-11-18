import { jwtToken } from "../../../modules/cookies";
import { verifyjwt } from "../../../modules/webToken";

export async function action({request}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    if (!cookie) {
        //  If there is no cookie
        return {ok: true};

    } else if (!verifyjwt(cookie)) {
        //  cookie invalid
        return new Response("", {
            headers: {
                "Set-Cookie": await jwtToken.serialize("", {
                    maxAge: 1
                })
            }
        });
    }

    return new Response("", {
        headers: {
            "Set-Cookie": await jwtToken.serialize("", {
                maxAge: 1
            })
        }
    });
};