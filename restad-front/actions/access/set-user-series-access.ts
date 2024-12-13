"use server"

import {apiUrl} from "@/lib/api";
import {cookies} from "next/headers";

export default async function SetUserSeriesAccess(userIds: number[], seriesId: number) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            throw new Error('Unauthorized: No token found');
        }
        const data = {
            userIds: userIds,
            seriesId: seriesId
        }

        const response = await fetch(apiUrl + '/series/access-user-series', {
            headers: {
                'Authentication-Token': token,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })

        if (!response.ok) {
            throw new Error('Failed to set user series access');
        }
        return "ok"
    } catch (error) {
        return "error"
    }
}