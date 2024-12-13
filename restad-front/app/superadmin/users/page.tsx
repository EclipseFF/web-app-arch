'use server'

import Header from "@/components/SuperAdmin/Header";
import Footer from "@/components/Footer";
import UsersList from "@/components/SuperAdmin/Users/UsersList";

export default async function Page() {

    return (
        <div className="min-h-screen bg-gray-100">

            <UsersList />

        </div>
    )
}