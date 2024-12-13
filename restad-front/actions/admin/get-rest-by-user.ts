'use server'

import {apiUrl} from "@/lib/api";
import {Restaurant} from "@/lib/models";

export default async function GetRestByUser(page: number, elements: number, id: number) {

    try {
        const response = await fetch(apiUrl + "/restaurants/pagination?&page=" + page + "&elements=" + elements + "&userId=" + id);
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.status);
        }

        const json = await response.json();
        let restaurants: Restaurant[] = [];
        json.restaurants.forEach((restaurant: any) => {
            restaurants.push({
                uuid: restaurant.uuid,
                name: restaurant.name,
                translation: restaurant.translation,
                description: restaurant.description,
                logo_image: restaurant.logo_image,
                primary_color: restaurant.primary_color,
                secondary_color: restaurant.secondary_color,
                address: restaurant.address
            });
        });
        console.log(restaurants)
        return restaurants;
    } catch (error) {
        console.error(error);
        return [];
    }
}