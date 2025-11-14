import { useLoaderData } from "react-router";
import { getuser, getuserposts } from "../../database/modules/postgresql";
import "../CSS/style.css";
import { jwtToken } from "../../modules/cookies";
import { parsejwt } from "../../modules/webToken";
import { Post } from "./index.jsx";

export async function loader({request, params}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    const userinfo = await getuser(params.userid);
    const userposts = await getuserposts(params.userid, cookiepayload.user_id);

    // console.log(userposts);

    return {userinfo, userposts};
}

export default function App() {

    const {userinfo, userposts} = useLoaderData();

    async function handlesubmit(e) {
        e.preventDefault();
        const formdata = new FormData(e.target);

        const request = await fetch("/api/uploadprofilepic", {
            method: "POST",
            body: formdata,
        });
    }

    const posts = userposts.postslist.map((value) => {
        return <Post postinfo={value} 
                    mediafiles={userposts.mediafiles} 
                    key={value.post_id}
                ></Post>
    });

    return <div>

        {userinfo && <div>
            <div className="profilepiccont">
                {(userinfo.profilepicname) ? 
                    <img src={`/media/${userinfo.username}/profilepicture/${userinfo.profilepicname}`}
                        className="profilepic"></img> 
                : 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="3rem" height="3rem"><g id="_01_align_center" data-name="01 align center"><path d="M21,24H19V18.957A2.96,2.96,0,0,0,16.043,16H7.957A2.96,2.96,0,0,0,5,18.957V24H3V18.957A4.963,4.963,0,0,1,7.957,14h8.086A4.963,4.963,0,0,1,21,18.957Z"/><path d="M12,12a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,12ZM12,2a4,4,0,1,0,4,4A4,4,0,0,0,12,2Z"/></g></svg>
                }
            </div>
            <h2>{userinfo.username}</h2>
            <p>{userinfo.description}</p>
        </div>}

        <form className="formelement" onSubmit={handlesubmit}>
            <h2>Change profile picture</h2>
            <div>
                <input type="file" name="picture" accept="image/*"/>
            </div>
            <button type="submit">Submit</button>
        </form>

        {posts}

    </div>
}