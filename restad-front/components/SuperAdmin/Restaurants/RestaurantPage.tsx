'use client';

import { Dish, Menu, Restaurant, Series, User } from "@/lib/models";
import { useEffect, useState } from "react";

// Actions
import GetRestInfoById from "@/actions/restaurants/get-rest-info-by-id";
import GetRestUsers from "@/actions/restaurants/get-rest-users";
import GetMenusByRestaurant from "@/actions/restaurants/get-menus-by-restaurant";
import GetMenuItems from "@/actions/item/get-menu-items";
import AddMenuItem from "@/actions/item/add-menu-item";

// Components
import CreateDishForm from "@/components/Admin/CreateDishForm";
import EditDishForm from "@/components/Admin/EditDishForm";
import AddSeriesCard from "@/components/SuperAdmin/Series/AddSeriesCard";
import DishesList from "@/components/SuperAdmin/Restaurants/DishesList";
import CategoriesList from "@/components/SuperAdmin/Restaurants/CategoriesList";
import AddCategoriesCard from "@/components/SuperAdmin/Restaurants/AddCategoriesCard";
import CreateCategoryForm from "@/components/SuperAdmin/Restaurants/CreateCategoryForm";
import GetLangCookie from "@/actions/lang/get-lang-cookie";
import EditAccessCard from "@/components/SuperAdmin/Access/EditAccessCard";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import EditAccessForm from "@/components/SuperAdmin/Access/EditAccessForm";
import {Button} from "@/components/ui/button";
import DeleteRestaurant from "@/actions/restaurants/delete-restaurant";
import GetDishesByCategories from "@/actions/item/get-dishes-by-categories";

export default function RestaurantPage({ id, link }: { id: string, link: string }) {
    // State management
    const [dishes, setDishes] = useState<[{ menu: Menu, dishes: Dish[]}]>();
    const [series, setSeries] = useState<Series>();
    const [users, setUsers] = useState<User[]>([]);
    const [restInfo, setRestInfo] = useState<Restaurant>();
    const [menus, setMenus] = useState<Menu[]>([]);
    const [showPopup, setShowPopup] = useState(false);
    const [showCategoriesPopup, setShowCategoriesPopup] = useState(false);
    const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
    const [selectedMenu, setSelectedMenu] = useState<Menu | null>(null);
    const [pageLang, setPageLang] = useState<string>('');
    const [pageNum, setPageNum] = useState<number>(1);
    useEffect(() => {
        if (id) {
            GetRestInfoById(id).then((data) => {
                if (data?.series) setSeries(data.series);
                if (data?.restaurant) setRestInfo(data.restaurant);
            });
            GetRestUsers(id).then((data) => {
                if (data) setUsers(data);

            });
            GetMenusByRestaurant(id).then((data) => {
                if (data) setMenus(data);
            });

            GetLangCookie().then((lang) => {
                if (lang) {
                    setPageLang(lang);
                } else {
                    setPageLang('ru');
                }
            })
        }
    }, [id]);

    useEffect(() => {
        GetDishesByCategories(id, pageNum, 50).then((data) => {
            if (data) {

                setDishes(data as [{ menu: Menu, dishes: Dish[] }]);
            };
        });
    }, [id, pageNum]);

    const handleDishClick = (dish: Dish, menu: Menu) => {
        dish.categories = [menu];
        setSelectedDish(dish);
    };

    function handleDelete() {
        restInfo?.uuid && DeleteRestaurant(restInfo.uuid,).then(() => {
            window.location.href = '/' + link;
        })
    }

    return (
        <div className="bg-gray-50 min-h-screen p-6">
            <div className="bg-white shadow-md rounded-lg p-6 mb-6">
                {restInfo && (
                    <div className="text-center">
                        <h1 className="text-3xl font-bold">{restInfo.name}</h1>
                        <p className="text-gray-600">{restInfo.description || "No description available"}</p>
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-5 gap-3 mb-6">
                <div className="p-6 flex flex-col items-center">
                    <AddSeriesCard
                        onClick={() => setShowPopup(true)}
                        name="Добавить блюдо"
                    />
                    {showPopup && (
                        <CreateDishForm
                            uuid={id}
                            onClose={() => setShowPopup(false)}
                            onSubmit={AddMenuItem}
                            menus={menus}
                            lang={pageLang}
                        />
                    )}
                </div>
                <div className="p-6 flex flex-col items-center">
                    <AddCategoriesCard
                        onClick={() => setShowCategoriesPopup(true)}
                        name="Добавить категорию"
                    />
                    {showCategoriesPopup && (
                        <CreateCategoryForm
                            scope="restaurant"
                            target={id}
                            onClose={() => setShowCategoriesPopup(false)}
                            lang={pageLang}
                        />
                    )}
                </div>

                {
                    link == "superadmin" &&
                    <div className="p-6 flex flex-col items-center">
                        <EditAccessForm
                            restaurantUsers={users}
                            restaurant={restInfo}
                            series={series}
                        />
                    </div>
                }

                <div>
                    QR код
                </div>

                {
                    link == "superadmin" &&
                    <div className="p-6 flex flex-col items-center">
                        <Button variant="destructive" onClick={handleDelete}>
                            Удалить ресторан?
                        </Button>
                    </div>
                }
            </div>

            {/* Content Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {/* Dishes List */}
                <div className="bg-white col-span-3 shadow-md rounded-lg p-6">
                    <div className="flex justify-between">
                        <h2 className="text-xl font-semibold mb-4">Блюда</h2>
                        <div>
                            <button onClick={() => pageNum > 1 && setPageNum(pageNum - 1)} className="bg-gray-500 text-white px-2 py-1 rounded-md hover:bg-gray-600">&nbsp;{"<"}&nbsp;</button>
                            &nbsp;
                            <input type="number" value={pageNum} onChange={(e) => setPageNum(Number(e.target.value))} className="w-12 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500" />
                            &nbsp;
                            <button onClick={() => setPageNum(pageNum + 1)} className="bg-gray-500 text-white px-2 py-1 rounded-md hover:bg-gray-600">&nbsp;{">"}&nbsp;</button>

                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {dishes && dishes.map((d) => (
                            d.dishes && d.dishes.length > 0 && d.dishes.map((item) => (
                                <div
                                    key={item.id}
                                    className="cursor-pointer border p-4 rounded shadow hover:shadow-lg transition"
                                    onClick={() => handleDishClick(item, d.menu)}
                                >
                                    <h3 className="text-lg font-bold">
                                        {
                                            item.localizations && (
                                                item.localizations.find((loc) => loc.lang === pageLang)?.title ||
                                                item.localizations.find((loc) => loc.lang === "ru")?.title ||
                                                item.localizations.find((loc) => loc.lang === "kaz")?.title ||
                                                item.localizations.find((loc) => loc.lang === "en")?.title
                                                || "Нет названия"
                                            )
                                        }
                                    </h3>
                                    <p className="text-gray-600">
                                        {
                                            item.localizations && (
                                                item.localizations.find((loc) => loc.lang === pageLang)?.description ||
                                                item.localizations.find((loc) => loc.lang === "ru")?.description ||
                                                item.localizations.find((loc) => loc.lang === "kaz")?.description ||
                                                item.localizations.find((loc) => loc.lang === "en")?.description
                                                || "Нет описания")
                                        }
                                    </p>
                                    <p className="text-gray-800 font-semibold">Цена: {item.price}тг.</p>
                                </div>
                            ))
                        ))}
                    </div>
                </div>

                <div className="bg-white col-span-1 shadow-md rounded-lg p-6">
                    <h2 className="text-xl font-semibold mb-4">Категории</h2>
                    <CategoriesList menu={menus}/>
                </div>
            </div>

            {selectedDish && (
                <EditDishForm
                    dish={selectedDish}
                    menus={menus}
                    onClose={() => setSelectedDish(null)}
                    onSubmit={(formdata) => {
                        setSelectedDish(null);
                    }}
                    uuid={id}/>
            )}


        </div>
    );
}