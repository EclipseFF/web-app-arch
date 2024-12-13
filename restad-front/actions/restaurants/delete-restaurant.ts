'use server'

import {apiUrl} from "@/lib/api";
import {cookies} from "next/headers";

export default async function DeleteRestaurant(uuid: string) {
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }
    await fetch(apiUrl + '/restaurants/' + uuid, {
        headers: {
            'Authentication-Token': token
        },
        method: 'DELETE',
    })
}