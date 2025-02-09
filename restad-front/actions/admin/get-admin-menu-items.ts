import {cookies} from "next/headers";
import {apiUrl} from "@/lib/api";
import {Dish} from "@/lib/models";

export default async function getAdminMenuItems(restaurant_uuid: string, page: number, elements: number): Promise<Dish[]>{
    try {
     const token = (await cookies()).get('token')?.value

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }

        const response = await fetch (apiUrl + "/dishes/pagination?restaurant_uuid=" + restaurant_uuid + "&page=" + page + "&elements=" + elements, {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {
            throw new Error('Failed to fetch: ' + response.status);
        }
        
        const json = await response.json();
        return json.dishes.map((dish: any) => ({
            id: dish.id,
            title: dish.title,
            description: dish.description,
            imageUrl: dish.image_url,
            link3d: dish.link3d,
            price: dish.price,
            categories: dish.categories
        }));
    } catch (error) {
        return [];
    }
}