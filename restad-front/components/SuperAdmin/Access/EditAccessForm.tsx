'use client'
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Restaurant, Series, User} from "@/lib/models";
import EditAccessCard from "@/components/SuperAdmin/Access/EditAccessCard";
import {useEffect, useState} from "react";
import GetUsersPagination from "@/actions/users/get-users-pagination";
import {Checkbox} from "@/components/ui/checkbox";
import {Button} from "@/components/ui/button";
import SetUserRestaurantAccess from "@/actions/access/set-user-restaurant-access";
import GetSeriesPagination from "@/actions/series/get-series-pagination";
import SetSeriesRestaurantAccess from "@/actions/access/set-series-restaurant-access";

interface Props {
    restaurantUsers: User[]
    restaurant?: Restaurant
    series?: Series
}

export default function EditAccessForm(props: Props) {
    const [users, setUsers] = useState<User[]>([]);
    const [series, setSeries] = useState<Series[]>([]);
    const [page, setPage] = useState(1);
    const [newAccessUsers, setNewAccessUsers] = useState<User[]>([]);
    const [newAccessSeries, setNewAccessSeries] = useState<Series>();
    const [isNavigationAvailable, setIsNavigationAvailable] = useState(true);


    useEffect(() => {
        setNewAccessUsers(props.restaurantUsers)
    }, [props.restaurantUsers]);

    useEffect(() => {
        setNewAccessSeries(props.series)
    }, [props.series]);

    useEffect(() => {
        setIsNavigationAvailable(false)
        GetUsersPagination(page, 50).then((users) => setUsers(users)).then(() => setIsNavigationAvailable(true));
        GetSeriesPagination(page, 50).then((series) => setSeries(series)).then(() => setIsNavigationAvailable(true));
    }, [page]);

    function handleSaveUserRest() {
        if (!props.restaurant) {
            return;
        }
        SetUserRestaurantAccess(props.restaurant?.uuid, newAccessUsers.map(u => u.id)).then(() => {
            window.location.reload();
        });
    }

    function handleSaveSeriesRest() {
        if (!props.restaurant || !newAccessSeries) {
            return;
        }
        SetSeriesRestaurantAccess(newAccessSeries?.id, [props.restaurant?.uuid]).then(() => {
            window.location.reload();
        });
    }

    return (
        <AlertDialog>
            <AlertDialogTrigger>
                <EditAccessCard />
            </AlertDialogTrigger>
            <AlertDialogContent className="w-[1000px]">
                <AlertDialogTitle hidden={true}>Редактирование доступа</AlertDialogTitle>
                <Tabs defaultValue="user-rest" className="">
                    <TabsList className="">
                        <TabsTrigger value="user-rest">Пользователь - Ресторан</TabsTrigger>
                        <TabsTrigger value="series-rest">Франшиза - Ресторан</TabsTrigger>
                    </TabsList>
                    <TabsContent value="user-rest">
                        <div className="grid content-between min-h-96 h-full">
                            <div className="grid">
                                {users.map((user) => (
                                    <div key={user.id} className="flex items-center gap-2">
                                        <input type="checkbox" onChange={(e) => e.target.checked ? setNewAccessUsers([...newAccessUsers, user]) : setNewAccessUsers(newAccessUsers.filter(u => u.id !== user.id))} checked={newAccessUsers.some(u => u.id === user.id)} className=""/>

                                        <div>
                                            {user.name}
                                        </div>

                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex justify-between">
                                    <button onClick={() => isNavigationAvailable && (page > 1 ? setPage(page - 1) : null)}>
                                        {"<"}
                                    </button>
                                    {page}
                                    <button onClick={() => isNavigationAvailable && setPage(page + 1)}>
                                        {">"}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveUserRest}
                                    className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 mt-5">
                                    Сохранить
                                </button>
                            </div>
                        </div>
                    </TabsContent>
                    <TabsContent value="series-rest">

                        <div className="grid content-between min-h-96 h-full">
                            <div className="grid">
                                {series.map((series) => (
                                    <div key={series.id} className="flex items-center gap-2">
                                        <input type="checkbox"
                                               onChange={(e) => e.target.checked ? setNewAccessSeries(series) : setNewAccessSeries(undefined)}
                                               checked={newAccessSeries?.id === series.id} className=""/>

                                        <div>
                                            {series.name}
                                        </div>

                                    </div>
                                ))}
                            </div>
                            <div>
                                <div className="flex justify-between">
                                    <button
                                        onClick={() => isNavigationAvailable && (page > 1 ? setPage(page - 1) : null)}>
                                        {"<"}
                                    </button>
                                    {page}
                                    <button onClick={() => isNavigationAvailable && setPage(page + 1)}>
                                        {">"}
                                    </button>
                                </div>
                                <button
                                    onClick={handleSaveSeriesRest}
                                    className="bg-gray-800 text-white py-2 px-4 rounded-lg hover:bg-gray-900 mt-5">
                                    Сохранить
                                </button>
                            </div>
                        </div>

                    </TabsContent>
                </Tabs>
            </AlertDialogContent>
        </AlertDialog>
    )
}