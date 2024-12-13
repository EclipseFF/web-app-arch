'use server'
import RestaurantPage from "@/components/SuperAdmin/Restaurants/RestaurantPage";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id

    return (
        <div>
            <RestaurantPage id={id} link={"admin"} />
        </div>
    )
}