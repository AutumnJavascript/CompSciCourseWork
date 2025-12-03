import { redirect } from "react-router";
import { jwtToken } from "../../modules/cookies";
import { useState } from "react";
import { verifyjwt } from "../../modules/webToken";

export async function loader({request}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    if (!cookie) {
        //  If there is no cookie
        return redirect("/login");

    } else if (!verifyjwt(cookie)) {
        //  cookie invalid
        return redirect("/login", {
            headers: {
                "Set-Cookie": await jwtToken.serialize("", {
                    maxAge: 1
                })
            }
        });
    }
};


export default function App() {

    const [hashtaglist, sethashtaglist] = useState([]);
    const [hashtagfield, setHashtagfield] = useState("");

    async function handlesubmit(e) {
        e.preventDefault();
        const formdata = new FormData(e.target);
        formdata.append("hashtaglist", hashtaglist);

        const request = await fetch("/api/createpost", {
            method: "POST",
            body: formdata,
        });
    };


    function handleaddhashtag(e) {
        e.preventDefault();
        //  if the hashtag is already attached
        if (hashtaglist.indexOf(hashtagfield) != -1) return;
        sethashtaglist([...hashtaglist, hashtagfield]);
        setHashtagfield("");
    }

    // updates the value of the input field
    function handlehashtagfield(e) {
        setHashtagfield(e.target.value);
    }

    //  deletes the hashtag from the hashtag list
    function handledelete(e, hashtag) {
        e.preventDefault();
        const newlist = hashtaglist.filter((value) => value!=hashtag);
        sethashtaglist(newlist);
    }

    return <>
        <h1>Create post</h1>

        <form className="formelement" onSubmit={handlesubmit}>
            <div>
                <label htmlFor="title">Title</label>
                <input type="text" name="title" required={true}/>
            </div>

            <div>
                <label htmlFor="description">Description</label>
                <input type="text" name="description"/>
            </div>

            <div>
                <label htmlFor="hashtag">Hashtags</label>
                <input type="text" name="hashtag" onChange={handlehashtagfield} value={hashtagfield}/>
                <button onClick={handleaddhashtag}>add</button>
            </div>

            {hashtaglist.map((value, index) => <Hashtag value={value} key={index}>
                <button onClick={(e) => {handledelete(e, value)}}>X</button>
            </Hashtag>)}

            <div>
                <input type="file" name="media" multiple/>
            </div>

            <button type="submit">Submit</button>
        </form>
    </>
};

function Hashtag({value, children}) {

    return <div>
        {value}{children}
    </div>
}