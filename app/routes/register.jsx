import { Form, useActionData } from "react-router"
import "../CSS/style.css"
import { useEffect, useState, createContext, useRef } from "react"
import { checkemail, checkpassword, validateusername } from "../../modules/passwordcheck";
import { jwtToken } from "../../modules/cookies";

const host = process.env.HOST;

const UserProvider = createContext();

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
    const {code, jwt} = await registerRequest.json();

    //  Returns 200 if successful
    //  Returns 23505 if username is not unqiue
    return new Response(code, {
            headers: {
                "Set-Cookie": await jwtToken.serialize(jwt)
            }
        }
    );
}


export default function App() {

    const fetchResponse = useActionData();
    const [checklist, setChecklist] = useState([0,0,0,0,0,1]);
    const [status, setStatus] = useState("");
    const usernameStatus = useRef(0);

    useEffect(() => {
        if (fetchResponse == 200) {
            setStatus("Register successful");
        } else if (fetchResponse == 23505) {
            setStatus("Username already taken, please pick another one");
        } else if (fetchResponse == 401) {
            setStatus("Please check the details are in the correct format");
        };
    },[fetchResponse]);

    function handlepassword(event) {
        const response = checkpassword(event.target.value);
        //  Returns an array of checklist requirments
        // 0 = fail and 1 = pass
        setChecklist(response);
    }

    function handleusername(username) {
        const response = validateusername(username);
        if (response) {
            usernameStatus.current = 0;
        } else {
            usernameStatus.current = 1;
        }
    }

    return <>
        <h1>Register page</h1>

        <Form className="formelement" method="POST" >
            <div>
                <label htmlFor="email">Email</label>
                <input type="email" name="email" required={true}/>
            </div>

            <div>
                <label htmlFor="username">Username</label>
                <input type="text" name="username" required={true}/>
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input type="text" name="password" onChange={handlepassword} required={true}/>
            </div>

            <Checklist checklist={checklist}/>

            <button type="submit">
                Submit
            </button>

            <div>
                {status}
            </div>

        </Form>
    </> 
};


function Checklist({checklist}) {

    const passwordRequirements = [
        "At least 8 characters",
        "At least 1 number",
        "At least 1 upper case character",
        "At least 1 lower case character",
        "At least 1 special character",
        "No spaces"
    ]

    return <>
        {checklist.map((value, index) => 
            <p key={index}>
                {(value === 0) ? "✕" : "✔"} {passwordRequirements[index]}
            </p>)
        }
    </>
}

