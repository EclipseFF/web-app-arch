'use server'
import {apiUrl} from "@/lib/api";
import {cookies} from "next/headers";

export default async function AddMenuItem(formdata: FormData){
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }
    console.log(formdata)
    await fetch(apiUrl + '/dishes/rest', {
        headers: {
            'Authentication-Token': token,
        },
        method: 'POST',
        body: formdata
    })
        .then((res) => {
            if (res.ok) {
                console.log("Successfully created dish" + res.statusText + res.status);
            } else {
                console.log("Failed to create dish:" + res.statusText + res.status);
            }
        })
        .catch((error) => {
            console.log("Failed to create restaurant:" + error);
        });
}