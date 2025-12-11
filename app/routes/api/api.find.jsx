export async function action({request}) {

    const body = await request.json();
    console.log(body);

    return {ok: true};
}

export function App() {
    return <></>
}