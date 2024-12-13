'use server'
import {apiUrl} from "@/lib/api";
import {cookies} from "next/headers";
import {redirect} from "next/navigation";

export default async function logout(){
    try {
        const token = (await cookies()).get('token')?.value;

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }
        (await cookies()).delete('token');
        fetch(apiUrl + '/users/logout', {
            headers: {
                'Authentication-Token': token
            },
            method: 'POST'
        })

        redirect('/login')
    } catch (error) {
        redirect('/login')
    }
}
