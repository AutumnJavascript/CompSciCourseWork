import { useLoaderData } from "react-router";
import { getPosts } from "../../database/modules/postgresql"
import { useEffect, useMemo, useRef, useState } from "react";
import "../CSS/style.css"
import { jwtToken } from "../../modules/cookies";
import { parsejwt } from "../../modules/webToken";


export async function loader({request}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);
    const a = await getPosts(cookiepayload.user_id);

    return a;
}


// export default function App() {

//     const fetchedmedia = useLoaderData();
//     //  list of all postmedia
//     const [postlist, setpostlist] = useState([]);
//     //  ID of all the posts fetched
//     //  no duplicates

//     useEffect(() => {
//         //  loops through the database query
//         //  and appends the postID value to an array
//         //  ignoring duplicates
//         let newpostlist = [];
//         for(const value of fetchedmedia) {
//             if (!newpostlist.includes(value.post_id)) {
//                 newpostlist.push(value.post_id);
//             }
//         }
//         setpostlist(newpostlist);
//     },[fetchedmedia]);


//     const posts = useMemo(() => {
//         return postlist.map((postID) => {
//             if (!postID) return

//             let filelist = [];
//             for (const value of fetchedmedia) {
//                 if (value.post_id == postID) {
//                     filelist.push(value)
//                 }
//             }

//             return <Post 
//                         data={filelist} 
//                         key={filelist[0].post_id}>
//                     </Post>
//         })
//     }, [fetchedmedia, postlist])

    
//     return <>
//         <h1>Home page</h1>

//         {posts}
//     </>
// }

export default function App() {

    const {postslist, mediafiles} = useLoaderData();
    //  postslist: list of post information
    //  mediafiles: list of all media files

    const posts = postslist.map((value) => {
        return <Post postinfo={value} 
                    mediafiles={mediafiles} 
                    key={value.post_id}
                ></Post>
    });

    return <>
        <h1>Home page</h1>

        {posts}
    </>
}


function Post({postinfo, mediafiles}) {

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

    return ( 
        <div className="postcontainer">

            {/* post information */}
            <h2 className="postusername">{postinfo.username}</h2> - <h3 className="posttitle">{postinfo.title}</h3>
            <p>{postinfo.description}</p>
            {mediaelements}

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
