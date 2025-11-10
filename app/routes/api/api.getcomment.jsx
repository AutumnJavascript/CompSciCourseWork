import { getcomments } from "../../../database/modules/postgresql";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt } from "../../../modules/webToken";

export async function action({request, params}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    const commentquery = await getcomments(params.postid);
    console.log(commentquery);
    
    return {ok: true, comment: commentquery};
}

