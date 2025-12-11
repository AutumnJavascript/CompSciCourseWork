import { getmessage } from "../../../database/modules/postgresql";
import { jwtToken } from "../../../modules/cookies";
import { verifyjwt, parsejwt } from "../../../modules/webToken";

export async function action({params, request}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    if (!cookie || !verifyjwt(cookie)) {
        //  If there is no cookie
        return {ok: false};
    } 

    const cookiepayload = parsejwt(cookie);
    const messages = await getmessage(params.conversationid);
    const messageslist = messages.map((item) => {
        if (item.sender_id == cookiepayload.user_id) {
            item["owner"] = true;
        }
        return item;
    })

    return {conversationid: params.conversationid, messageslist};
}

