
export async function action({request}) {

    const formdata = await request.formData();

    console.log(formdata);

    return {message: "Send successfully!"};
};



