import { createHmac } from "crypto";
//  Imports the crypto module
//  contains the HMAC keyed hashing algorithm sub program


const key = "secretkey"

export async function createjwt(object) {

    const payload = JSON.stringify(object);
    const header = JSON.stringify(createHeader());
    //  converts a javascript object into a string format

    const encodedPayload = toBase64(payload);
    const encodedHeader = toBase64(header);
    //  Encodes the Strings into Base64URL

    const hmac = createHmac("sha256", key);
    hmac.update(encodedHeader + encodedPayload);
    const signature = hmac.digest("hex");
    //  Outputs signature from the HMAC SHA256 hashing algorithm 

    const jwt = encodedHeader + "." + encodedPayload + "." + signature;
    //  A special character to separate the 3 parts of a JWT

    return jwt;
}

export function parsejwt(jwt) {
    
    const {encodedPayload} = extractpayload(jwt);
    
    const decodedPayload = toUTF8(encodedPayload);
    //  Converts the Base64URL encoded payload back to utf-8
    
    return JSON.parse(decodedPayload)
    //  Converts string back into a javascript object
}

export async function verifyjwt(jwt) {

    const {encodedHeader, encodedPayload, expectedsignature} = extractpayload(jwt);

    const hmac = createHmac("sha256", key);
    hmac.update(encodedHeader + encodedPayload);
    const signature = hmac.digest("hex");

    if (signature === expectedsignature) {
        return true;
    } else {
        return false;
    }
}

function extractpayload(jwt) {

    let deconstructedJWT = jwt;
    
    const firstPosition = deconstructedJWT.indexOf(".");
    deconstructedJWT = jwt.slice(firstPosition + 1, jwt.length);
    const secondPosition = deconstructedJWT.indexOf(".") + firstPosition + 1;


    const encodedHeader = jwt.slice(0, firstPosition);
    const encodedPayload = jwt.slice(firstPosition + 1, secondPosition);
    const expectedsignature = jwt.slice(secondPosition + 1, jwt.length);

    return {encodedHeader, encodedPayload, expectedsignature};
}


function toBase64(data) {
    return Buffer.from(data, "utf-8").toString("base64url")
}

function toUTF8(buffer) {
    return Buffer.from(buffer, "base64url").toString("utf-8")
}

function createHeader() {

    const header = {
        algorithm: "HS256",
        type: "jwt"
    };

    return header;
}



// let token = await createjwt({user_id: 1, username: "ariana"});
// console.log(token);

// const token = "EyJhbGdvcml0aG0iOiJIUzI1NiIsInR5cGUiOiJqd3QifQ.eyJ1c2VyX2lkIjoxLCJ1c2VybmFtZSI6ImFyaWFuYSJ9.993af8e079706d7bf0d4142a49ada6f0ca3de8fede3bda61f3e1509cb14d20db"
// const payload = parsejwt(token);
// console.log(payload);

