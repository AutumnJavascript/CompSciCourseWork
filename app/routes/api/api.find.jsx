import { searchMessage } from "../../../database/modules/postgresql";

export async function action({request}) {

    const body = await request.json();
    console.log(body);

    // searchMessage(body.list, body.text);
    if (!body.text.trim()) {
        return {ok: true};
    }

    const messagelist = await searchMessage(body.list, body.text);
    // console.log(messagelist);

    return messagelist;
}

export function App() {
    return <></>
}