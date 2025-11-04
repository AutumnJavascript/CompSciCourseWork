import { stat, opendir } from "node:fs/promises";



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



//  has callback function
// export async function fileexists(path, cb) {
//     //  will return true if file exists
//     //  and false if file does not exist
//     stat(path, (err) => {
//         cb(!err);
//     });
// }

//  using promises
export async function fileexists(path) {
    try {
        await stat(path);
        return true;
    } catch (err) {
        return false;
    }
}

