import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt } from "../../../modules/webToken";
import { directoryexists, fileexists } from "../../../modules/filehandling";
import { randomUUID } from "crypto";
import { postupload } from "../../../database/modules/postgresql";


export async function action({request}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);
    
    const formdata = await request.formData();
    const files = formdata.getAll("media");
    const mediapath = path.resolve(import.meta.dirname, "../../..", "media", cookiepayload.username);

    const exists = await directoryexists(mediapath);

    if (!exists) mkdir(mediapath);
    const savedfilenames = uploadfiles(files, cookiepayload);

    postupload(cookiepayload.user_id, formdata, savedfilenames);

    return {ok: true}
}


async function uploadfiles(files, cookiepayload) {

    let filenamelist = [];

    for (const file of files) {
        const filebuffer = await file.arrayBuffer();
        const buffer = Buffer.from(filebuffer);
        const newpath = path.resolve(import.meta.dirname, "../../..", "media", cookiepayload.username, file.name);

        const exists = await fileexists(newpath);

        if (!exists) {
            const writetofile = await writeFile(newpath, buffer);
            filenamelist.push(file.name);
        } else {
            const newdirpath = path.resolve(newpath, "../");
            const extension = file.name.split(".")[file.name.split(".").length - 1];
            const newfilename = randomUUID() + "." + extension
            const writetofile = await writeFile(path.join(newdirpath, newfilename), buffer);
            filenamelist.push(newfilename);
        }
    }

    return filenamelist;
}


