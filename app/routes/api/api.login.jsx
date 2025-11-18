import { dbLogin } from "../../../database/modules/postgresql";
import { checkemail } from "../../../modules/passwordcheck";

export async function action({request}) {

    const formdata = await request.formData();
    const identifier = formdata.get("identifier").trim();
    const password = formdata.get("password");
    let identifiertype;

    if (checkemail(identifier)) {
        identifiertype = "email";
    } else {
        identifiertype = "username";
    }
    
    const response = dbLogin({identifiertype, identifier, password});

    return response;
};



