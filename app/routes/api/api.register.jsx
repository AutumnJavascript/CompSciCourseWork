import { dbRegister } from "../../../database/modules/postgresql";


export async function action({request}) {

    const formdata = await request.formData();

    const username = formdata.get("username");
    const password = formdata.get("password");
    const email = formdata.get("email")

    const response = dbRegister(username, password, email);


    return response;
};



