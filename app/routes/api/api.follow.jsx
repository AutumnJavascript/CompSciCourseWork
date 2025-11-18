import { followuser } from "../../../database/modules/postgresql";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt } from "../../../modules/webToken";

export async function action({request, params}) {
    const cookieheader = request.headers.get("Cookie");

    if (!cookieheader) {
        return {ok: false};
    } 

    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);
    const followrequest = await followuser(cookiepayload.user_id, params.userid);

    return {ok: true, ...followrequest}
}