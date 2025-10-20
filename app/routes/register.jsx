import { Form, useActionData } from "react-router"
import "../CSS/style.css"
import { useEffect, useState, createContext, useContext } from "react"
import { checkpassword } from "../../modules/passwordcheck";

const host = process.env.HOST;

const UserProvider = createContext();

export async function action({request}) {

    const formdata = await request.formData();

    const registerRequest = await fetch(host + "api/register", {
        method: "POST",
        body: formdata
    });
    const response = await registerRequest.json();

    return response;
}


export default function App() {

    const fetchResponse = useActionData();
    const [checklist, setChecklist] = useState([0,0,0,0,0,1]);
    const [error, setError] = useState("");

    useEffect(() => {
        if (fetchResponse == 200) {
            setError("Register successful");
        } else if (fetchResponse == 23505) {
            setError("Username already taken, please pick another one");
        }
    },[fetchResponse])

    function handlepassword(event) {
        const response = checkpassword(event.target.value);
        //  Returns an array of checklist requirments
        //  If value is 0 then fail 
        //  If value is 1 then pass

        setChecklist(response);
    }

    return <UserProvider.Provider value={checklist}>
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

            <Checklist />

            <button type="submit">Submit</button>

            <div>
                {error}
            </div>

        </Form>
    </UserProvider.Provider> 
};


function Checklist() {
    const checklist = useContext(UserProvider);

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

