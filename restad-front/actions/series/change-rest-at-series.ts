'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";

export default async function ChangeRestAtSeries(seriesId: number, restaurantsUUIDs: string[]) {
    const data = {
        seriesId:seriesId,
        restaurantsUUIDs: restaurantsUUIDs
    }
    console.log(data)
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }

    fetch(apiUrl + '/series/acc-rest', {
        headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
}