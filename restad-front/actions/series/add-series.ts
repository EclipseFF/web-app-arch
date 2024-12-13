'use server'
import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {redirect} from "next/navigation";

export default async function AddSeries(name: string) {
    const data = {
        name: name,
        userIds: []
    }
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }

    fetch(apiUrl + '/series', {
        headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
}