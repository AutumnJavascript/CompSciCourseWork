import { Form, useActionData } from "react-router"
import "../CSS/style.css"

const host = process.env.host;

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

    return <>
        <h1>Register page</h1>

        <Form className="formelement" method="POST" >
            <div>
                <label htmlFor="username">Username</label>
                <input type="text" name="username"/>
            </div>

            <div>
                <label htmlFor="password">Password</label>
                <input type="password" name="password"/>
            </div>
            <button type="submit">Submit</button>

            <div>
                {fetchResponse ? fetchResponse.message : ""}
            </div>

        </Form>
    </>
};

