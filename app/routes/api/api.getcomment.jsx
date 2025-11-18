import { getcomments } from "../../../database/modules/postgresql";


export async function action({request, params}) {

    const commentquery = await getcomments(params.postid);
    
    return {ok: true, comment: commentquery};
}

