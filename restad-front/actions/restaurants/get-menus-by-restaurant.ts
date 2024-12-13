'use server'

import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {Menu} from "@/lib/models";

export default async function GetMenusByRestaurant(id: string) {

    try {
        const token = (await cookies()).get('token')?.value

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }

        const response = await fetch(apiUrl + "/menus/restaurant/" + id, {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {
            return [];
        }
        const json = await response.json();

        let menus: Menu[] = [];
        json.menus.forEach((menu: any) => {
            menus.push({
                id: menu.id,
                restaurantId: menu.restaurantId,
                nameRu: menu.nameRu,
                nameEn: menu.nameEn,
                nameKz: menu.nameKz
            });
        });
        return menus;
    } catch (error) {
        console.error(error);
        return [];}
}