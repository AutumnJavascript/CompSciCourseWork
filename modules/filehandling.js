import { stat, opendir } from "node:fs/promises";
import { fileTypeFromBuffer } from "file-type";
import { randomUUID } from "node:crypto";
import path from "path";
import { writeFile, mkdir } from "fs/promises";



export async function directoryexists1(path, cb) {
    //  will return true if dir exists
    //  and false if dir does not exist
    opendir(path, (err, dir) => {
        (!err) ? dir.close() : null;
        cb(!err);
    });
}

export async function directoryexists(path) {
    //  will return true if dir exists
    //  and false if dir does not exist
    try {
        const dir = await opendir(path);
        dir.close();
        return true;
    } catch (err) {
        return false;
    }
}


//  using promises
export async function fileexists(path) {
    try {
        await stat(path);
        return true;
    } catch (err) {
        return false;
    }
}


export function getExtension(filename) {

}

export async function isImage(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    const check = type.mime.includes("image")

    // if (check) {
    //     console.log("is image");
    // }

    return check;
}

export async function isVideo(buffer) {
    const type = await fileTypeFromBuffer(buffer);
    const check = type.mime.includes("video");

    // if (check) {
    //     console.log("is video");
    // }

    return check;
}

export function newUUIDfilename(filename, newpath) {
    const newdirpath = path.resolve(newpath, "../");
    const extension = filename.split(".")[filename.split(".").length - 1];
    const newfilename = randomUUID() + "." + extension;

    return {newfilename, newdirpath};
}

export async function uploadprofilepic(picturefile, cookiepayload) {

    let filenamelist = [];
    const file = picturefile[0];

    const filebuffer = await file.arrayBuffer();
    const buffer = Buffer.from(filebuffer);
    const newpath = path.resolve(import.meta.dirname, "../", "public", "media", cookiepayload.username, "profilepicture", file.name);
    const exists = await fileexists(newpath);

    //  File type check
    const fileIsImage = await isImage(buffer);

    //  File must be image or it will not be saved
    if (fileIsImage) {
        if (!exists) {

            const writetofile = await writeFile(newpath, buffer);
            filenamelist.push(file.name);

        } else {
            const {newfilename, newdirpath} = newUUIDfilename(file.name, newpath);
            // console.log(newdirpath)

            const writetofile = await writeFile(path.join(newdirpath, newfilename), buffer);
            filenamelist.push(newfilename);

        }
    } 
    

    return filenamelist;
}

