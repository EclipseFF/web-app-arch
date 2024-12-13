'use client';

import { useEffect, useState } from "react";
import { Series } from "@/lib/models";
import GetSeriesPagination from "@/actions/series/get-series-pagination";
import SeriesCard from "@/components/SuperAdmin/Series/SeriesCard";
import AddSeriesCard from "@/components/SuperAdmin/Series/AddSeriesCard";
import CreateSeries from "@/components/SuperAdmin/Series/CreateSeries";
import Link from "next/link";

export default function SeriesList({link}: {link: string}) {
    const [series, setSeries] = useState<Series[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const page = 1;
    const elements = 50;

    useEffect(() => {
        GetSeriesPagination(page, elements).then((series) => setSeries(series));
    }, []);

    return (
        <div className="bg-gray-50 p-6">
            <h2 className="text-lg font-bold mb-4 text-center">Список франшиз:</h2>
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-w-screen-xl mx-auto">

                {link == "superadmin" &&
                    <div className="flex justify-center items-center">
                        <AddSeriesCard onClick={() => setShowPopup(true)} name="Добавить франшизу"/>
                    </div>
                }

                {series.map((serie, index) => (
                    <Link href={`/${link}/series/${serie.id}`} key={index}>
                        <SeriesCard title={serie.name}/>
                    </Link>
                ))}
            </div>

            {showPopup && (
                <CreateSeries
                    onClose={() => setShowPopup(false)}
                />
            )}
        </div>
    );
}