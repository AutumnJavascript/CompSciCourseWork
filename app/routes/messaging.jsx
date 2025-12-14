import { useRef, useEffect, useState, useContext, createContext, useMemo } from "react";
import { jwtToken } from "../../modules/cookies";
import { verifyjwt, parsejwt } from "../../modules/webToken";
import { createconversation, getDirectConversation, getuser } from "../../database/modules/postgresql";
import { redirect, useLoaderData } from "react-router";
import { getconversation } from "../../database/modules/postgresql";

const UserProvider = createContext();

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

    const cookiepayload = parsejwt(cookie);

    if (params.userid) {
        const {username, profilepicname} = await getuser(params.userid, cookiepayload.user_id);
        await createconversation(cookiepayload.user_id, params.userid);

        const conversationid = await getDirectConversation(cookiepayload.user_id, params.userid);
        const conversations = await getconversation(cookiepayload.user_id);

        return {userid: params.userid, username, profilepicname, conversationid, conversations};
    }

    const conversations = await getconversation(cookiepayload.user_id);
    return {conversations};
}

function debounce(cb, delay) {
    let timer;
    return (...args) => {
        clearTimeout(timer);
        timer = setTimeout(() => cb(...args), delay);
    }
}

export default function App() {

    const ws = useRef();
    const [messagelist, setMessagelist] = useState([]);
    const {userid, username, profilepicname, conversationid, conversations} = useLoaderData();
    const [inputmessage, setInputMessage] = useState("");
    const textinput = useRef();
    const [currentconversation, setCurrentConversation] = useState((userid) ? conversationid : null);
    const conversationmessages = useRef({});
    const [userinfo, setUserinfo] = useState({username, profilepicname});
    const currentconversationref = useRef();
    const bottommessage = useRef();
    const [render, rerender] = useState(false);
    const [searchresult, setSearchresult] = useState([]);
    const messageparams = useRef(null);
    const [highlighted, setHighlighted] = useState(null);

    const messageidlist = useMemo(() => {
        return conversations.map((conversation) => conversation.conversation_id);
    },[conversations])

    useEffect(() => {
        currentconversationref.current = currentconversation;
    },[currentconversation])

    useEffect(() => {
        // const url = "ws://192.168.1.113:3000/";
        const url = "ws://localhost:3000/";
        ws.current = new WebSocket(url);

        //  this function is ran when the websocket server sends a message
        //  and this client receives the data
        ws.current.addEventListener("message", (data) => {
            const message = JSON.parse(data.data);

            //  user receives message to a conversation not present on screen
            if (message.conversationid != currentconversationref.current) {
                
                //  adds new message to the message list
                //  and increments the notification count
                conversationmessages.current = {...conversationmessages.current, 
                    [message.conversationid]: {
                        messagelist: [...conversationmessages.current[message.conversationid].messagelist, message],
                        lastmessage: message,
                        notificationCount: conversationmessages.current[message.conversationid].notificationCount + 1,
                        groupchat: conversationmessages.current[message.conversationid].groupchat,
                        cname: conversationmessages.current[message.conversationid].cname,
                        uname: conversationmessages.current[message.conversationid].uname
                }}
                rerender(!render);

            } else {
                setMessagelist((messagelist) => [...messagelist, message]);
                conversationmessages.current = {...conversationmessages.current, 
                    [message.conversationid]: {
                        messagelist: [...conversationmessages.current[message.conversationid].messagelist, message],
                        lastmessage: message,
                        notificationCount: conversationmessages.current[message.conversationid].notificationCount,
                        groupchat: conversationmessages.current[message.conversationid].groupchat,
                        cname: conversationmessages.current[message.conversationid].cname,
                        uname: conversationmessages.current[message.conversationid].uname
                }}
            }
        });

        for (const conversation of conversations) {
            conversationmessages.current[conversation.conversation_id] = {
                messagelist: [],
                lastmessage: conversation,
                notificationCount: 0,
                groupchat: conversation.isgroupchat,
                cname: conversation.conversation_title,
                uname: conversation.username
            }
        }

        return () => {
            ws.current.close();
        }
    },[]);

    useEffect(() => {
        console.log("a")
        if (!currentconversation) return;
        if (conversationmessages.current[currentconversation].messagelist.length != 0) {
            const info = findusername(currentconversation, conversations);
            setMessagelist(conversationmessages.current[currentconversation].messagelist);
            setUserinfo({username: info.username, profilepicname: info.profilepicname});
            return;
        };

        fetch(`/api/getmessage/${currentconversation}`, {
            method: "post"
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            setMessagelist(data.messageslist);
            const info = findusername(currentconversation, conversations);
            setUserinfo({username: info.username, profilepicname: info.profilepicname});
            conversationmessages.current = {...conversationmessages.current, 
                [currentconversation]: {
                    messagelist: data.messageslist,
                    lastmessage: data.messageslist[data.messageslist.length - 1],
                    notificationCount: 0,
                    groupchat: conversationmessages.current[data.conversationid].groupchat,
                    cname: conversationmessages.current[data.conversationid].cname,
                    uname: conversationmessages.current[data.conversationid].uname
            }}
        });
    },[currentconversation])

    useEffect(() => {
        if (messageparams.current && document.getElementById(messageparams.current)) {
            bottommessage.current.scrollTop = document.getElementById(messageparams.current).offsetTop - 80;
            messageparams.current = null;
        } else if (bottommessage.current) {
            bottommessage.current.scrollTop = bottommessage.current.scrollHeight;
        }
    },[userinfo, messagelist])

    function handlesend() {
        if (!inputmessage) return;

        //  makes the websocket message structure
        const messagepayload = {
            type: "message",
            conversationid: currentconversation,
            messagetext: inputmessage,
            reply: false
        }
        ws.current.send(JSON.stringify(messagepayload));

        //  empties the input box
        setInputMessage("");
        textinput.current.innerText = "";
    }

    function handlechange(e) {
        setInputMessage(e.target.innerText);
    }

    function handlekeydown(e) {

        if (e.code == "Enter" && e.shiftKey == true) {
            return;
        } else if (e.code == "Enter") {
            e.preventDefault();     
            handlesend();       
        }

    }

    function handleclick(id) {
        setCurrentConversation(id);
        conversationmessages.current[id].notificationCount = 0;
    }

    const handleinput = debounce((e) => {
        if (!e.target.value.trim()) return;
        fetch("/api/find", {
            method: "post",
            body: JSON.stringify({
                category: "message",
                text: e.target.value.trim(),
                list: messageidlist
            })
        })
        .then(response => response.json())
        .then((data) => {
            console.log(data);
            setSearchresult(data);
        })
    }, 700);

    function viewmessage(conversationid, messageid) {
        messageparams.current = messageid;
        setCurrentConversation(conversationid);
        conversationmessages.current[conversationid].notificationCount = 0;
        setHighlighted(messageid);
    }

    return <UserProvider value={conversationmessages}>
        <div className="rootmessagecontainer">
            <div className="messagesidebar">
                <div className="messagetopbar">
                    <p>Messages</p>
                    <div className="messagesearchcontainer">
                        <div className="searchandresult">
                            <div className="searchinputcontainer">
                                <input type="text" placeholder="Search..." onInput={handleinput}/>
                                <svg className="searchsvg" xmlns="http://www.w3.org/2000/svg" style={{width: "1.2rem"}} viewBox="0 0 640 640"><path d="M480 272C480 317.9 465.1 360.3 440 394.7L566.6 521.4C579.1 533.9 579.1 554.2 566.6 566.7C554.1 579.2 533.8 579.2 521.3 566.7L394.7 440C360.3 465.1 317.9 480 272 480C157.1 480 64 386.9 64 272C64 157.1 157.1 64 272 64C386.9 64 480 157.1 480 272zM272 416C351.5 416 416 351.5 416 272C416 192.5 351.5 128 272 128C192.5 128 128 192.5 128 272C128 351.5 192.5 416 272 416z"/></svg>
                            </div>
                            <div className="resultscontainer">
                                {searchresult && searchresult.map && searchresult.map((result) => { 
                                    return <div style={{zIndex: 2}} key={result.message_id} onPointerDown={() => {viewmessage(result.conversation_id, result.message_id)}}>
                                        <h3 className="resultconversation">{(conversationmessages.current[result.conversation_id].isgroupchat) ?
                                            conversationmessages.current[result.conversation_id].cname:
                                            conversationmessages.current[result.conversation_id].uname}</h3>
                                        <h4 className="resulttext">{result.messagetext}</h4>
                                    </div>
                                })}
                            </div>
                        </div>
                    </div>
                </div>
                <div className="messagecardlist">
                    {conversations.map((conversation) => {
                        return <MessageCard 
                        conversation={conversation} 
                        handleclick={handleclick} 
                        conversationmessages={conversationmessages} 
                        active={conversation.conversation_id == currentconversation}
                        key={conversation.conversation_id}/>
                    })}
                </div>
            </div>
            <div className="mainmessage">
                {(currentconversation) ? (
                    <><div className="messageheader">
                        <div className="messageheaderpfpcontainer">
                            {(userinfo.profilepicname) ?
                                <img src={`/media/${userinfo.username}/profilepicture/${userinfo.profilepicname}`}
                                    className="profilepic"></img>
                                :
                                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="3rem" height="3rem"><g id="_01_align_center" data-name="01 align center"><path d="M21,24H19V18.957A2.96,2.96,0,0,0,16.043,16H7.957A2.96,2.96,0,0,0,5,18.957V24H3V18.957A4.963,4.963,0,0,1,7.957,14h8.086A4.963,4.963,0,0,1,21,18.957Z" /><path d="M12,12a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,12ZM12,2a4,4,0,1,0,4,4A4,4,0,0,0,12,2Z" /></g></svg>}
                        </div>
                        <div className="messageusernamestatus">
                            <h1>{userinfo.username}</h1>
                            <p>online</p>
                        </div>
                    </div>
                    <div className="messagedisplay" ref={bottommessage}>
                        {messagelist.map((message) => <Message 
                            message={message} 
                            key={message.message_id} 
                            conversationmessages={conversationmessages}
                            highlighted={highlighted == message.message_id}/>)}
                    </div>
                    <div className="toolbar">

                        <div
                            className="sendmessage"
                            role="textbox"
                            contentEditable={true}
                            aria-multiline={true}
                            value={inputmessage}
                            onInput={handlechange}
                            onKeyDown={handlekeydown}
                            ref={textinput}>
                        </div>

                        <div className="toolbarbuttoncontainer">
                            <button className="toolbarbutton" onClick={() => { console.log(conversationmessages); } }>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "hsla(195, 2%, 48%, 1.00)", width: "1.6rem" }} viewBox="0 0 640 640"><path d="M512 128C514 128 515.9 128.1 517.8 128.3L422.1 224L490 224L562 152C570.8 163 576 176.9 576 192L576 448C576 483.3 547.3 512 512 512L128 512C92.7 512 64 483.3 64 448L64 192C64 156.7 92.7 128 128 128L198.1 128L102.1 224L170 224L265 129L266 128L358.1 128L262.1 224L330 224L425 129L426 128L512.1 128z" /></svg>
                            </button>
                            <button className="toolbarbutton">
                                <svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "hsla(245, 73%, 63%, 1.00)", width: "1.6rem" }} viewBox="0 0 640 640"><path d="M288.6 76.8C344.8 20.6 436 20.6 492.2 76.8C548.4 133 548.4 224.2 492.2 280.4L328.2 444.4C293.8 478.8 238.1 478.8 203.7 444.4C169.3 410 169.3 354.3 203.7 319.9L356.5 167.3C369 154.8 389.3 154.8 401.8 167.3C414.3 179.8 414.3 200.1 401.8 212.6L249 365.3C239.6 374.7 239.6 389.9 249 399.2C258.4 408.5 273.6 408.6 282.9 399.2L446.9 235.2C478.1 204 478.1 153.3 446.9 122.1C415.7 90.9 365 90.9 333.8 122.1L169.8 286.1C116.7 339.2 116.7 425.3 169.8 478.4C222.9 531.5 309 531.5 362.1 478.4L492.3 348.3C504.8 335.8 525.1 335.8 537.6 348.3C550.1 360.8 550.1 381.1 537.6 393.6L407.4 523.6C329.3 601.7 202.7 601.7 124.6 523.6C46.5 445.5 46.5 318.9 124.6 240.8L288.6 76.8z" /></svg>
                            </button>
                            <button className="toolbarbutton" onClick={handlesend}>
                                <svg xmlns="http://www.w3.org/2000/svg" style={{ fill: "hsla(323, 62%, 64%, 1.00)", width: "1.6rem" }} viewBox="0 0 640 640"><path d="M541.9 139.5C546.4 127.7 543.6 114.3 534.7 105.4C525.8 96.5 512.4 93.6 500.6 98.2L84.6 258.2C71.9 263 63.7 275.2 64 288.7C64.3 302.2 73.1 314.1 85.9 318.3L262.7 377.2L321.6 554C325.9 566.8 337.7 575.6 351.2 575.9C364.7 576.2 376.9 568 381.8 555.4L541.8 139.4z" /></svg>
                            </button>
                        </div>

                    </div></>

                ) : (
                    <div className="emptymessagecontainer">
                        <svg style={{fill: "hsl(0,0%,70%)", width: "10rem"}} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640"><path d="M155.8 96C123.9 96 96.9 119.4 92.4 150.9L64.6 345.2C64.2 348.2 64 351.2 64 354.3L64 480C64 515.3 92.7 544 128 544L512 544C547.3 544 576 515.3 576 480L576 354.3C576 351.3 575.8 348.2 575.4 345.2L547.6 150.9C543.1 119.4 516.1 96 484.2 96L155.8 96zM155.8 160L484.3 160L511.7 352L451.8 352C439.7 352 428.6 358.8 423.2 369.7L408.9 398.3C403.5 409.1 392.4 416 380.3 416L259.9 416C247.8 416 236.7 409.2 231.3 398.3L217 369.7C211.6 358.9 200.5 352 188.4 352L128.3 352L155.8 160z"/></svg>
                        <h1>Click on a conversation to message!</h1>
                    </div>
                )}
            </div>
        </div>
    </UserProvider>
}

function findusername(conversationid, conversations) {
    for (const conversation of conversations) {
        if (conversationid == conversation.conversation_id) {
            return conversation
        }
    }
}

function MessageCard({conversation, handleclick, active}) {

    const conversationmessages = useContext(UserProvider);
    const id = useMemo(() => {
        return conversation.conversation_id
    },[])
    
    return <div 
            key={conversation.conversation_id}
            className={`messagecardcontainer ${(active) ? "active" : ""}`}
            onClick={() => {handleclick(conversation.conversation_id)}}
            >
        <div className="profilepiccont">
                {(conversation.profilepicname) ? 
                    <img src={`/media/${conversation.username}/profilepicture/${conversation.profilepicname}`}
                        className="profilepic"></img> 
                : 
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" style={{width: "3rem", height: "3rem"}}><g id="_01_align_center" data-name="01 align center"><path d="M21,24H19V18.957A2.96,2.96,0,0,0,16.043,16H7.957A2.96,2.96,0,0,0,5,18.957V24H3V18.957A4.963,4.963,0,0,1,7.957,14h8.086A4.963,4.963,0,0,1,21,18.957Z"/><path d="M12,12a6,6,0,1,1,6-6A6.006,6.006,0,0,1,12,12ZM12,2a4,4,0,1,0,4,4A4,4,0,0,0,12,2Z"/></g></svg>
                }
        </div>   
        <div className="messagecardinfo">
            <h2 className="messagecardtitle">
                {(conversation.isgroupchat) ? 
                    conversation.conversation_title : 
                    conversation.username}
            </h2>
            <h2 className="messagecardmessage">
                {(conversationmessages.current[conversation.conversation_id]?.lastmessage) ?
                    conversationmessages.current[conversation.conversation_id].lastmessage.messagetext :
                    (conversation.messagetext) ? 
                    conversation.messagetext : 
                    ""
                }
            </h2>
        </div>
            {(conversationmessages.current[id]?.notificationCount && conversationmessages.current[id]?.notificationCount != 0) ?
                <div className="notification">
                    {conversationmessages.current[id].notificationCount}
                </div> : 
                ""
            }
    </div>
}

function Message({message, highlighted}) {

    if (message.owner) {
        return <div className={`ownmessage defaultmessage ${(highlighted) ? "highlightedmessage" : ""}`} id={message.message_id}>
            {message.messagetext}
        </div>;
    }
    return <div className={`notownmessage defaultmessage ${(highlighted) ? "highlightedmessage" : ""}`} id={message.message_id}>
        {message.messagetext}
    </div>;

}