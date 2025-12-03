import { jwtToken } from "../../modules/cookies";
import { parsejwt } from "../../modules/webToken";

export async function loader({request}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    console.log(cookiepayload)
}

export default function App() {
    return <>
    </>
}