import { dbRegister } from "../../../database/modules/postgresql";
import { createjwt } from "../../../modules/webToken";


export async function action({request}) {

    const formdata = await request.formData();

    const username = formdata.get("username").trim();
    const password = formdata.get("password");
    const email = formdata.get("email").trim();

    // console.log(username)

    // const response = dbRegister(username, password, email);
    const {code, userid} = dbRegister(username, password, email);

    // console.log(userid);

    const jwt = await createjwt({
        user_id: userid,
        role: "user",
        issued_at: Date.now(),
        username: username
    });

    return {code, jwt};
};



