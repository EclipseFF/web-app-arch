'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {User} from "@/lib/models";

export default async function GetUserBySession(){
        const cookieStore = await cookies();
        const token = cookieStore.get('token')?.value;

        if (!token) {
            return undefined;
        }

        const response = await fetch(apiUrl + "/users/session", {
            headers: {
                'Authentication-Token': token
            },
        });
        const json = await response.json();
        if (!response.ok) {
            return undefined;
        }

        if (response.status !== 200) {
            cookieStore.delete('token');
            return undefined
        }

        let user: User;
        if (json.user) {
            user = {
                id: json.user.id,
                name: json.user.name,
                email: json.user.email,
                role: json.user.role,
                password: json.user.password,
                isVerified: json.user.isVerified,
                isBlocked: json.user.isBlocked,
                isDeleted: json.user.isDeleted,
                updatedAt: json.user.updatedAt,
                createdAt: json.user.createdAt
            }
        }
        else {
            return undefined;
        }
        return user;
    }
