import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { jwtToken } from "../../../modules/cookies";
import { parsejwt } from "../../../modules/webToken";
import { directoryexists, fileexists, isImage, isVideo, newUUIDfilename } from "../../../modules/filehandling";
import { postupload } from "../../../database/modules/postgresql";



export async function action({request}) {

    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);
    
    const formdata = await request.formData();
    const files = formdata.getAll("media");
    const mediapath = path.resolve(import.meta.dirname, "../../..", "public", "media", cookiepayload.username);

    const exists = await directoryexists(mediapath);

    if (!exists) mkdir(mediapath);
    const {filenamelist, filetype} = await uploadfiles(files, cookiepayload);

    // console.log(filenamelist);
    // console.log(filetype);

    postupload(cookiepayload.user_id, formdata, filenamelist, filetype);

    return {ok: true}
}


async function uploadfiles(files, cookiepayload) {

    let filenamelist = [];
    let filetype = [];

    for (const file of files) {
        const filebuffer = await file.arrayBuffer();
        const buffer = Buffer.from(filebuffer);
        const newpath = path.resolve(import.meta.dirname, "../../..", "public", "media", cookiepayload.username, file.name);
        const exists = await fileexists(newpath);

        //  File type check
        const fileIsImage = await isImage(buffer);
        const fileIsVideo = await isVideo(buffer);

        //  File must be image or video or it will not be saved
        if (fileIsImage || fileIsVideo) {
            if (!exists) {
                const writetofile = await writeFile(newpath, buffer);

                filenamelist.push(file.name);
                filetype.push((fileIsImage) ? "image" : "video");
            } else {
                const {newfilename, newdirpath} = newUUIDfilename(file.name, newpath);

                const writetofile = await writeFile(path.join(newdirpath, newfilename), buffer);
                filenamelist.push(newfilename);
                filetype.push((fileIsImage) ? "image" : "video");
            }
        } 
    }

    return {filenamelist, filetype};
}


