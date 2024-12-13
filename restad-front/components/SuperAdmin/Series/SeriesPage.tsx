'use client'
import {Restaurant, Series, User} from "@/lib/models";
import GetSeriesInfoById from "@/actions/series/get-series-info-by-id";
import Header from "@/components/SuperAdmin/Header";
import Footer from "@/components/Footer";
import SeriesInfo from "@/components/SuperAdmin/Series/SeriesInfo";
import {useEffect, useState} from "react";

export default function SeriesPage({id, link} : {id: string, link: string}) {

    const [restaurants, setRestaurants] = useState<Restaurant[]>([])
    const [series, setSeries] = useState<Series>()
    const [users, setUsers] = useState<User[]>([])

    useEffect(() => {
        if(id) {
            GetSeriesInfoById(Number(id)).then((data) => {
                if (data && data.users){
                    setUsers(data.users)
                }
                if (data && data.restaurants){
                    setRestaurants(data.restaurants)
                }
                if (data && data.series){
                    setSeries(data.series)
                }

            })
        }
    }, [id])

    return (
        <div>
            <SeriesInfo restaurants={restaurants} users={users} series={series} link={link} />
        </div>
    )
}