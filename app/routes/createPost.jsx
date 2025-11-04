import { redirect, useLoaderData } from "react-router";
import { jwtToken } from "../../modules/cookies";
import { useEffect, useRef, useState } from "react";
import { verifyjwt } from "../../modules/webToken";

const host = process.env.HOST;

export async function action({request}) {

    const formdata = await request.formData();
    const username = formdata.get("username");
    const password = formdata.get("password");
    const email = formdata.get("email");

    if (checkpassword(password).includes(0)) return 401;
    if (!validateusername(username)) return 401;
    if (!checkemail(email)) return 401;

    const registerRequest = await fetch(host + "api/register", {
        method: "POST",
        body: formdata
    });
    const response = await registerRequest.json();

    //  Returns 200 if successful
    //  Returns 23505 if username is not unqiue
    return response;
}


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
    const form = useRef();

    async function handlesubmit(e) {
        e.preventDefault();
        const formdata = new FormData(e.target);

        const request = await fetch("/api/createpost", {
            method: "POST",
            body: formdata,
        });
    }

    return <>
        <h1>Create post</h1>

        <form className="formelement" onSubmit={handlesubmit} ref={form}>
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
                <input type="text" name="hashtag"/>
            </div>

            <div>
                <input type="file" name="media" multiple/>
            </div>

            <button type="submit">Submit</button>
        </form>
    </>
};


