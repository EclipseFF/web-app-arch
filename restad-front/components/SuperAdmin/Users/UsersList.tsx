'use client'
import CreateUser from "@/components/SuperAdmin/Users/CreateUser";
import {useState} from "react";
import AddSeriesCard from "@/components/SuperAdmin/Series/AddSeriesCard";
import {User} from "@/lib/models";
import {useEffect} from "react";
import GetUsersPagination from "@/actions/users/get-users-pagination";
import UserCard from "@/components/SuperAdmin/Users/UserCard";

export default function UsersList() {
    const [users, setUsers] = useState<User[]>([]);
    const [showPopup, setShowPopup] = useState<boolean>(false);
    const page = 1
    const elements = 50

    useEffect(() => {
        GetUsersPagination(page, elements).then((users) => setUsers(users))
        console.log(users)
    }, [])
    return (
        <div className="p-6">
            <div
                className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-w-screen-xl mx-auto">
                <AddSeriesCard onClick={() => setShowPopup(true)} name={"Добавить пользователя"}/>

                {users.map((user, index) => (
                    <UserCard key={index} user={user}/>
                ))}

                {showPopup && (
                    <CreateUser
                        onClose={() => setShowPopup(false)}
                    />
                )}
            </div>
        </div>
)
}