'use server'
import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {Dish, Restaurant, Series, User} from "@/lib/models";

export default async function GetRestInfoById(id: string) {
    try {
        const token = (await cookies()).get('token')?.value

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }

        const response = await fetch(apiUrl + "/restaurants/" + id, {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {
            return {};
        }
        const json = await response.json();


        let restaurant: Restaurant;
        if (json.restaurant) {
            restaurant = {
                uuid: json.restaurant.uuid,
                name: json.restaurant.name,
                translation: json.restaurant.translation,
                description: json.restaurant.description,
                logo_image: json.restaurant.logo_image,
                primary_color: json.restaurant.primary_color,
                secondary_color: json.restaurant.secondary_color,
                address: json.restaurant.address
            };
        }
        else {
            return {};
        }
        let series: Series;
        if (json.series) {
            series = {
                id: json.series.id,
                name: json.series.name,
                createdAt: json.series.createdAt,
                updatedAt: json.series.updatedAt,
            };
        }  else {
            return {restaurant};
        }
       return {restaurant, series};
    }
    catch (error) {
        console.error(error);
        return {};}
}