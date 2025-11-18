import { useLoaderData } from "react-router";
import { getPosts } from "../../database/modules/postgresql"
import { useRef, useState } from "react";
import "../CSS/style.css"
import { jwtToken } from "../../modules/cookies";
import { parsejwt } from "../../modules/webToken";
import { Link } from "react-router";


export async function loader({request}) {
    const cookieheader = request.headers.get("Cookie");

    if (cookieheader) {
        const cookie = await jwtToken.parse(cookieheader);
        const cookiepayload = parsejwt(cookie);
        const posts = await getPosts(cookiepayload.user_id);
        return posts;
    } 

    const posts = await getPosts();
    return posts;
}


export default function App() {

    const {postslist, mediafiles, hashtags} = useLoaderData();
    //  postslist: list of post information
    //  mediafiles: list of all media files
    //  hashtags: list of all postid and hashtag pair

    const posts = postslist.map((value) => {
        return <Post postinfo={value} 
                    mediafiles={mediafiles} 
                    hashtaglist={hashtags}
                    key={value.post_id}
                ></Post>
    });

    return <>
        <h1>Home page</h1>

        {posts}
    </>
}


export function Post({postinfo, mediafiles, hashtaglist}) {

    const [liked, setliked] = useState(postinfo.user_liked);
    const [likecounter, setlikecounter] = useState(Number(postinfo.likecount));
    const [opencomment, setopencomment] = useState(false);
    const [commentlist, setCommentlist] = useState([]);
    const gotComment = useRef(false);

    async function handlelike() {
        const request = await fetch(`/api/likepost/${postinfo.post_id}`, {
            method: "post",
        });
        const response = await request.json();
        if (response.ok) {
            setliked(response.liked);
            setlikecounter((response.liked) ? likecounter + 1 : likecounter - 1);            
        }
    }

    async function handleopencomment() {
        setopencomment(!opencomment);
        if (gotComment.current) return;

        const request = await fetch(`api/getcomment/${postinfo.post_id}`, {
            method: "post"
        });
        const response = await request.json();
        //  concat the two lists
        setCommentlist([...commentlist, ...response.comment]);
        gotComment.current = (response.ok) ? true : false;
    }

    async function handlecomment(e) {
        //  stops auto reload behavor
        e.preventDefault();
        //  adds post id to form data
        const formdata = new FormData(e.target);
        formdata.append("postID", postinfo.post_id);

        const request = await fetch("api/createcomment", {
            method: "post",
            body: formdata
        });
        const response = await request.json();

        if (response.ok) {
            setCommentlist([...commentlist, ...response.comment]);
        };
    }


    let mediaelements = [];
    for (const media of mediafiles) {
        if (media.post_id != postinfo.post_id) continue;
        if (media.mimetype == "image") {
            mediaelements.push(<img className="imageCSS" 
                    src={`/media/${postinfo.username}/${media.filename}`} 
                    alt={postinfo.username}
                    key={media.post_media_id} />);
        } else {
            mediaelements.push(<video
                className="imageCSS" controls={true}
                key={media.post_media_id}>
                <source src={`/media/${postinfo.username}/${media.filename}`}></source>
            </video>);
        }
    }

    let hashtagUI = [];
    for (const hashtag of hashtaglist) {
        if (hashtag.post_id != postinfo.post_id) continue;
        hashtagUI.push(hashtag.hashtag);
    }


    return ( 
        <div className="postcontainer">

            {/* post information */}
            <div className="profilepiccont">
                <Link to={`/user/${postinfo.user_id}`}>
                    {(postinfo.profilepicname) ? 
                        <img src={`/media/${postinfo.username}/profilepicture/${postinfo.profilepicname}`}
                            className="profilepic"></img> 
                    : 
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="3rem" height="3rem"><g id="_01_align_center" data-name="01 align center"><path d="M21,24H19V18.957A2.96,2.96,0,0,0,16.043,16H7.957A2.96,2.96,0,0,0,5,18.957V24H3V18.957A4.963,4.963,0,0,1,7.957,14h8.086A4.963,4.963,0,0,1,21,18.957Z"/><path d="M12,12a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,12ZM12,2a4,4,0,1,0,4,4A4,4,0,0,0,12,2Z"/></g></svg>
                    }
                </Link>
            </div>       
            <h2 className="postusername"><Link to={`/user/${postinfo.user_id}`}>{postinfo.username}</Link></h2> - <h3 className="posttitle">{postinfo.title}</h3>
            <p>{postinfo.description}</p>
            {mediaelements}

            {hashtagUI.map((value, index) => { return <div key={index}>
                <Link to={`/hashtag/${value}`}>#{value}</Link>
            </div>})}


            {/* interactions */}
            <div>
                <button className="interactbutton" onClick={handlelike}>
                    {(liked) ? "♥️" : "♡"}
                    {likecounter}
                </button>
                <button className="interactbutton" onClick={handleopencomment}>💬</button>
                <button className="interactbutton">🔖</button>
            </div>

            {/* toggle comment section */}
            {opencomment && <div className="commentsectioncontainer">

                <form onSubmit={handlecomment}>
                    <textarea name="comment" id="comment"></textarea>
                    <button type="submit">Send</button>
                </form>
                <div className="commentsection">
                    {/* comments go here */}
                    {commentlist.map((value) => 
                        <Comment 
                            value={value} 
                            key={value.comment_id}>
                        </Comment>)}
                </div>

            </div>}

        </div>  
    )
}

function Comment({value}) {


    return <div>
        <h3>{value.username} - {value.time}</h3> 
        <p>{value.comment}</p>
    </div>
}
