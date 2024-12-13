"use server"

import {apiUrl} from "@/lib/api";
import {cookies} from "next/headers";

export default async function SetUserRestaurantAccess(restUUID: string, userIds: number[]) {
    try {
        const token = (await cookies()).get('token')?.value;
        if (!token) {
            throw new Error('Unauthorized: No token found');
        }
        const data = {
            restUUID: restUUID,
            userIds: userIds
        }
        const response = await fetch(apiUrl + '/restaurants/access-user-restaurant', {
            headers: {
                'Authentication-Token': token,
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(data)
        })
        console.log(response.status)
        if (!response.ok) {
            throw new Error('Failed to set user series access');
        }
        return "ok"
    } catch (error) {
        return "error"
    }
}