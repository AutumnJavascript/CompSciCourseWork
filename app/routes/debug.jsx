import { useState } from "react";
import { jwtToken } from "../../modules/cookies";
import { parsejwt } from "../../modules/webToken";

export async function loader({request}) {
    const cookieheader = request.headers.get("Cookie");
    const cookie = await jwtToken.parse(cookieheader);
    const cookiepayload = parsejwt(cookie);

    console.log(cookiepayload)
}

export default function App() {
    const [count, setCount] = useState(0);

    return <>
        <Testing count={count} setCount={setCount} />
    </>
}

function Testing({count, setCount}) {

    function handeclick() {
        setCount(count + 1);
    }

    return <div onClick={handeclick}>
        {count}
    </div>
}