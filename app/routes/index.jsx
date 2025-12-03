import { useLoaderData } from "react-router";
import { getPosts } from "../../database/modules/postgresql"
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
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
        posts.currenttime = Date.now();
        return posts;
    } 

    const posts = await getPosts();
    posts.currenttime = Date.now();
    return posts;
}


export default function App() {

    const {postslist, mediafiles, hashtags, currenttime} = useLoaderData();
    //  postslist: list of post information
    //  mediafiles: list of all media files
    //  hashtags: list of all postid and hashtag pair
    const ws = useRef();

    useEffect(function () {
        // const url = "ws://127.0.0.1/";
        // const url = "ws://localhost:3000/";
        const url = "ws://192.168.1.113:3000/";
        ws.current = new WebSocket(url);

        ws.current.addEventListener("message", (data) => {
            console.log(data.data);
        });
    },[])


    const posts = postslist.map((value) => {
        return <Post postinfo={value} 
                    mediafiles={mediafiles} 
                    hashtaglist={hashtags}
                    currenttime={currenttime}
                    key={value.post_id}
                ></Post>
    });

    return <>
        <h1 className="pagetitle">Home page</h1>

        {posts}
    </>
}


export function Post({postinfo, mediafiles, hashtaglist, currenttime}) {

    const [liked, setliked] = useState(postinfo.user_liked);
    const [likecounter, setlikecounter] = useState(Number(postinfo.likecount));
    const [opencomment, setopencomment] = useState(false);
    const [commentlist, setCommentlist] = useState([]);
    const gotComment = useRef(false);
    const created_date = useRef(Date.parse(postinfo.created_time) / 1000);
    const currentimage = useRef(1);
    const carousel = useRef();

    const agodate = useMemo(() => {
        const msdifference = (currenttime / 1000) - created_date.current;
        const months = Math.floor(msdifference/(60*60*24*30));
        const weeks = Math.floor(msdifference/(60*60*24*7));
        const days = Math.floor(msdifference/(60*60*24));
        const hours = Math.floor(msdifference/(60*60));
        const minutes = Math.floor(msdifference/(60));


        if (months > 1) {
            return `${months} months ago`;
        } else if (weeks > 1) {
            return `${weeks} weeks ago`;
        } else if (days > 1) {
            return `${days} days ago`;
        } else if (hours > 1) {
            return `${hours} hours ago`;
        } else if (minutes > 1) {
            return `${minutes} minutes ago`;  
        }  else {
            return "1 minute ago"
        }
    },[])

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
            mediaelements.push(<div className="imageexpander" key={media.post_media_id}>
                        <img className="imageCSS" 
                            src={`/media/${postinfo.username}/${media.filename}`} 
                            alt={postinfo.username}
                    /></div>);
        } else {
            mediaelements.push(<div className="imageexpander" key={media.post_media_id}>
                <video className="imageCSS" controls={true}>
                <source src={`/media/${postinfo.username}/${media.filename}`}></source>
            </video></div>);
        }
    }

    let hashtagUI = [];
    for (const hashtag of hashtaglist) {
        if (hashtag.post_id != postinfo.post_id) continue;
        hashtagUI.push(hashtag.hashtag);
    }

    const handleback = useCallback(() => {
        const length = mediaelements.length;
        currentimage.current = (currentimage.current != 1) ? currentimage.current - 1 : length;
        carousel.current.style.transform = `translateX(${(currentimage.current - 1) * -34}rem)`;
    }, [mediaelements])

    const handlenext = useCallback(() => {
        const length = mediaelements.length;
        currentimage.current = (currentimage.current != length) ? currentimage.current + 1 : 1;
        carousel.current.style.transform = `translateX(${(currentimage.current - 1) * -34}rem)`;
    }, [mediaelements])


    return ( 
        <div className="postcontainer">

            {/* post information */}
            <div className="titlecontainer">
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
                <div className="usernamedate">
                    <h2 className="postusername"><Link className="postusername" to={`/user/${postinfo.user_id}`}>{postinfo.username}</Link></h2>
                    <p>{agodate}</p>
                </div>
                {/* <h3 className="posttitle">{postinfo.title}</h3> */}
            </div>
            <p>{postinfo.description}</p>

            {/* Media elements */}
            <div style={{position: "relative", width: "max-content"}}>
                <div className="stencel">
                    <div className="carousel" ref={carousel}>{mediaelements}</div>
                </div>
                <button onClick={handleback} className="scrollbutton leftbutton">
                    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 10L8 14L6 14L-2.62268e-07 8L6 2L8 2L8 6L16 6L16 10L8 10Z" fill="#ffffffff"/>
                    </svg>
                </button>
                <button onClick={handlenext} className="scrollbutton rightbutton">
                    <svg width="1rem" height="1rem" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M8 6L8 2L10 2L16 8L10 14L8 14L8 10L-1.74845e-07 10L-3.01991e-07 6L8 6Z" fill="#ffffffff"/>
                    </svg>
                </button>
            </div>


            {/* Hashtags */}
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
