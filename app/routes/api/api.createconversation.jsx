import { redirect } from "react-router";
import { createconversation } from "../../../database/modules/postgresql";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt, verifyjwt } from "../../../modules/webToken";

export async function action({request, params}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);

    if (!cookieheader) return;
    if (!verifyjwt(cookie)) return;

    const cookiepayload = parsejwt(cookie);
    const ownprofile = (params.userid == cookiepayload.user_id);

    if (ownprofile) return;
    await createconversation(cookiepayload.user_id, params.userid);

    return {ok: true};
}