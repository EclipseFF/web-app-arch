'use server'
import SeriesPage from "@/components/SuperAdmin/Series/SeriesPage";

export default async function Page({
                                       params,
                                   }: {
    params: Promise<{ id: string }>
}) {
    const id = (await params).id

    return (
        <div>
            <SeriesPage id={id} link={"admin"} />
        </div>
    )
}