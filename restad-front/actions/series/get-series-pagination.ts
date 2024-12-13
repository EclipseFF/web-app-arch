'use server'
import {apiUrl} from "@/lib/api";
import {Series} from "@/lib/models";
import {cookies} from "next/headers";

export default async function GetSeriesPagination(page: number, elements: number) {
    try {
        const token = (await cookies()).get('token')?.value

        if (!token) {
            throw new Error('Unauthorized: No token found');
        }

        const response = await fetch (apiUrl + "/series/pagination?page=" + page + "&elements=" + elements, {
            headers: {
                'Authentication-Token': token
            }
        });
        if (!response.ok) {
            return [];
        }

        const json = await response.json();
        let series: Series[] = [];
        if (json.series) {
            json.series.forEach((serie: any) => {
                series.push({
                    id: serie.id,
                    name: serie.name
                });
            });
        } else {
            console.log('No series found in response');
            return [];
        }
        return series;
    } catch (error) {
        console.error(error);
        return [];
    }
}