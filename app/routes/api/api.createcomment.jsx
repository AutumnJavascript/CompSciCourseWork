import { addcomment } from "../../../database/modules/postgresql";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt } from "../../../modules/webToken";

export async function action({request}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    const formdata = await request.formData();
    const comment = formdata.get("comment");
    const post_id = formdata.get("postID");

    const commentquery = await addcomment(cookiepayload.user_id,
        post_id,
        comment
    );
    
    return {ok: true, comment: commentquery};
}

