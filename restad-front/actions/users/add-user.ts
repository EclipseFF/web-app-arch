'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {User} from "@/lib/models";

export default async function AddUser(user: User) {
    const data = {
        surname: user.surname,
        name: user.name,
        patronymic: user.patronymic,
        email: user.email,
        password: user.password,
        role: user.role,
    }
    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }

    fetch(apiUrl + '/users', {
        headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data)
    })
}