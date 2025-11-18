import { useLoaderData } from "react-router";
import { gethashtagposts } from "../../database/modules/postgresql";
import "../CSS/style.css";
import { jwtToken } from "../../modules/cookies";
import { parsejwt } from "../../modules/webToken";
import { Post } from "./index.jsx";

export async function loader({request, params}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    // const userinfo = await getuser(params.hashtag);
    const userposts = await gethashtagposts(params.hashtag, cookiepayload.user_id);

    // console.log(userposts);

    return {...userposts, pagehashtag: params.hashtag};
}

export default function App() {

    const {postslist, mediafiles, hashtags, pagehashtag} = useLoaderData();
    const posts = postslist.map((value) => {
        return <Post postinfo={value} 
                    mediafiles={mediafiles} 
                    hashtaglist={hashtags}
                    key={value.post_id}
                ></Post>
    });

    return <div>
        <h1>#{pagehashtag}</h1>
        {posts}
    </div>
}