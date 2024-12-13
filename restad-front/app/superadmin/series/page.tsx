'use server'
import Footer from "@/components/Footer";
import Header from "@/components/SuperAdmin/Header";
import SeriesList from "@/components/SuperAdmin/Series/SeriesList";

export default async function Page(){

    return (
        <div className="min-h-screen bg-gray-100">

            <SeriesList link={"superadmin"} />

        </div>
    )
}