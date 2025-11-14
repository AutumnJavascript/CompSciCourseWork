import { uploadprofilepic } from "../../../modules/filehandling";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt } from "../../../modules/webToken";
import path from "path";
import { directoryexists } from "../../../modules/filehandling";
import { mkdir } from "fs/promises";
import { profilepageDB } from "../../../database/modules/postgresql";

export async function action({request}) {

    const formdata = await request.formData();

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);
    
    const file = formdata.getAll("picture");
    const mediapath = path.resolve(import.meta.dirname, 
        "../../..", 
        "public", 
        "media", 
        cookiepayload.username, 
        "profilepicture");

    const exists = await directoryexists(mediapath);

    if (!exists) mkdir(mediapath);
    const filenamelist = await uploadprofilepic(file, cookiepayload);
    console.log(filenamelist);

    await profilepageDB(filenamelist[0], cookiepayload.user_id);

    return {ok: true}
}