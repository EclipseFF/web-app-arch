'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {User} from "@/lib/models";

export default async function GetRestUsers(id: string) {
    try {
        const token = (await cookies()).get('token')?.value

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }

        const response = await fetch(apiUrl + "/users/restaurant/" + id, {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {
            return [];
        }
        const json = await response.json();

        let users: User[] = [];
        json.users.forEach((user: any) => {
            users.push({
                id: user.id,
                name: user.name,
                surname: user.surname,
                patronymic: user.patronymic,
                email: user.email,
                password: user.password,
                role: user.role,
                isVerified: user.isVerified,
                isBlocked: user.isBlocked,
                isDeleted: user.isDeleted,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt,
            });
        });
        console.log(users)
        return users;
    } catch (error) {
        return [];}
}