import { Form, useActionData } from "react-router"
import "../CSS/style.css"
import { useEffect, useState } from "react"
import { jwtToken } from "../../modules/cookies";
import { createjwt } from "../../modules/webToken";

const host = process.env.HOST;


export async function action({request}) {

    const formdata = await request.formData();
    const loginRequest = await fetch(host + "api/login", {
        method: "POST",
        body: formdata
    });
    const response = await loginRequest.json();

    if (response.code == 200) {
        //  password correct
        const jwt = await createjwt({
            user_id: response.userInfo.user_id,
            role: "user",
            issued_at: Date.now(),
            username: response.userInfo.username
        });

        return new Response(response.code, {
                headers: {
                    "Set-Cookie": await jwtToken.serialize(jwt)
                }
            }
        );
    } else {
        //  password incorrect or account does not exist
        return 403;
    }
}


export default function App() {

    const fetchResponse = useActionData();
    const [error, setError] = useState("");

    useEffect(() => {
        if (fetchResponse == 200) {
            setError("Login successful");
        } else if (fetchResponse == 403) {
            setError("Invalid login details, please try again")
        }
    },[fetchResponse]);

    return <>
        <h1>Login page</h1>

        <Form className="formelement" method="POST">

            <div>
                <label htmlFor="identifier">Username or email</label>
                <input type="text" name="identifier" required={true}/>
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input type="text" name="password" required={true}/>
            </div>

            <button type="submit">Submit</button>

            <div>
                {error}
            </div>

        </Form>
    </> 
};


