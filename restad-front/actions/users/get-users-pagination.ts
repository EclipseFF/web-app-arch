'use server'

import {apiUrl} from "@/lib/api";
import {User} from "@/lib/models";
import {cookies} from "next/headers";

export default async function GetUsersPagination(page: number, elements: number) {

    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }

    try {
        const response = await fetch(apiUrl + "/users/pagination?&page=" + page + "&elements=" + elements, {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.status);
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
                role: user.role,
                password: user.password,
                isVerified: false,
                isBlocked: false,
                isDeleted: false,
                updatedAt: user.updatedAt,
                createdAt: user.createdAt
            });
        });
        return users;
    } catch (error) {
        console.error(error);
        return [];
    }
}