'use server'
import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";

export default async function AddMenu(target: string, scope:string, nameRu: string, nameKz: string, nameEn: string) {
    const data = {
        ru: nameRu,
        kaz: nameKz,
        eng: nameEn,
        target: target,
        scope: scope
    }

    const token = (await cookies()).get('token')?.value;
    if (!token) {
        throw new Error('Unauthorized: No token found');
    }

    fetch(apiUrl + '/menus', {
        headers: {
            'Authentication-Token': token,
            'Content-Type': 'application/json'
        },
        method: 'POST',
        body: JSON.stringify(data),
    })

}