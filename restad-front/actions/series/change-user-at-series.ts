'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";

export default async function ChangeUserAtSeries(seriesId: number, userIds: number[]) {
    const data = {
        seriesId:seriesId,
        userIds: userIds
    }
    console.log(data)
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }

    fetch(apiUrl + '/series/acc-user', {
        headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
}