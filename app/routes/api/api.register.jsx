import { dbRegister } from "../../../database/modules/postgresql";


export async function action({request}) {

    const formdata = await request.formData();
    console.log(formdata)

    const username = formdata.get("username");
    const password = formdata.get("password");
    const email = formdata.get("email")

    dbRegister(username, password, email);

    return {message: "Send successfully!"};
};



