'use server'
import {User} from "@/lib/models";
import GetUserBySession from "@/actions/users/get-user-by-session";
import RestList from "@/components/Admin/RestList";
import {redirect} from "next/navigation";
import SeriesList from "@/components/SuperAdmin/Series/SeriesList";

export default async function Admin() {

    const request = GetUserBySession();
    const user = await request;
    if (!user || (user.role !== 'moderator' && user.role !== 'admin')) {
        redirect('/login');
    }

    return (
        <div className="container mx-auto px-4">
            {user && <SeriesList link={"admin"} />}
            {user && <RestList id={user.id} />}
        </div>
    );
}