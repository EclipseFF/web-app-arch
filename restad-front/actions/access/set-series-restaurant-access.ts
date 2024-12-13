'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";

export default async function SetSeriesRestaurantAccess(seriesId: number, restaurantUUIDs: string[]) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            throw new Error('Unauthorized: No token found');
        }
        const data = {
            seriesId: seriesId,
            restaurantsUUIDs: restaurantUUIDs
        }

        const response = await fetch(apiUrl + '/series/access-series-restaurant', {
            headers: {
                'Authentication-Token': token,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.status);
        }
        return "ok"
    } catch (error) {
        return "error"
    }
}