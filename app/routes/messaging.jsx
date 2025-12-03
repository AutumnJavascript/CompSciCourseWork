import { useRef, useEffect, useState } from "react";
import { jwtToken } from "../../modules/cookies";
import { verifyjwt, parsejwt } from "../../modules/webToken";
import { getuser } from "../../database/modules/postgresql";
import { useLoaderData } from "react-router";

export async function loader({params, request}) {

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

    if (params.userid) {
        const cookiepayload = parsejwt(cookie);
        const {username, profilepicname} = await getuser(params.userid, cookiepayload.user_id);


        return {username, profilepicname};
    }

    return {ok: true};
}

export default function App() {

    const ws = useRef();
    const [messageinput, setMessageinput] = useState("");
    const [messagelist, setMessagelist] = useState([]);
    const {username, profilepicname} = useLoaderData();

    useEffect(function () {
        const url = "ws://192.168.1.113:3000/";
        ws.current = new WebSocket(url);

        //  this function is ran when the websocket server sends a message
        //  and this client receives the data
        ws.current.addEventListener("message", (data) => {
            setMessagelist([...messagelist, data.data]);
        });
    },[])

    function handlesend() {
        ws.current.send(JSON.stringify(messageinput));
    }

    return <>
        <div className="rootmessagecontainer">
            <div className="messagesidebar">
                <div className="messagetopbar">
                    <p>Messages</p>
                    <div className="messagesearchcontainer">
                        <input type="text" placeholder="Search..."/>
                        <svg className="searchsvg" xmlns="http://www.w3.org/2000/svg" width={1.2 + "rem"} viewBox="0 0 640 640"><path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/></svg>
                    </div>
                </div>
                <div className="messagecardlist">

                </div>
            </div>
            <div className="mainmessage">
                <div className="messageheader">
                    <div className="messageheaderpfpcontainer">
                        {(profilepicname) ? 
                            <img src={`/media/${username}/profilepicture/${profilepicname}`}
                                className="profilepic"></img> 
                        : 
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="3rem" height="3rem"><g id="_01_align_center" data-name="01 align center"><path d="M21,24H19V18.957A2.96,2.96,0,0,0,16.043,16H7.957A2.96,2.96,0,0,0,5,18.957V24H3V18.957A4.963,4.963,0,0,1,7.957,14h8.086A4.963,4.963,0,0,1,21,18.957Z"/><path d="M12,12a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,12ZM12,2a4,4,0,1,0,4,4A4,4,0,0,0,12,2Z"/></g></svg>
                        }
                    </div> 
                    <div className="messageusernamestatus">
                        <h1>{username}</h1>
                        <p>online</p>
                    </div>
                </div>
            </div>
        </div>

        <input type="text" value={messageinput} onChange={(e) => setMessageinput(e.target.value)}/>
        <button onClick={handlesend}>send</button>

        {messagelist.map((value, index) => <div key={index}>{value}</div>)}
    </>
}