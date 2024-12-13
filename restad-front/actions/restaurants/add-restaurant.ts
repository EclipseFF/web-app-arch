'use server';
import { apiUrl } from "@/lib/api";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function AddRestaurant(formdata: FormData) {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }
    const response = await fetch(apiUrl + '/restaurants', {
        headers: {
            'Authentication-Token': token
        },
        method: 'POST',
        body: formdata
    })
        .then((res) => {
            if (res.ok) {
                console.log("Successfully created restaurant" + res.statusText + res.status);
                redirect('/superadmin');
            }
        })
        .catch((error) => {
            console.log("Failed to create restaurant:" + error);
        });


}