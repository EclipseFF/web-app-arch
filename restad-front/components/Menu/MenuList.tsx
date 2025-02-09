'use client'
import MenuTabs from "@/components/Menu/MenuTabs";
import MenuItem from "@/components/Menu/MenuItem";
import {useEffect, useState} from "react";
import GetMenuItems from "@/actions/item/get-menu-items";
import GetDishesByCategories from "@/actions/item/get-dishes-by-categories";
import {useSearchParams} from "next/navigation";
import {Menu, Dish} from "@/lib/models";
import Cookies from "js-cookie";
import HandleUUIDFromQr from "@/actions/qr-resolver/qr-resolver";
import GetStoredUuid from "@/actions/qr-resolver/get-stored-uuid";
import GetLangCookie from "@/actions/lang/get-lang-cookie";


export default function MenuList() {
    const [menuItems, setMenuItems] = useState<[{ menu: Menu, dishes: Dish[]}]>()
    const [uuid, setUuid] = useState<string | null>(null)
    const [pageLang, setPageLang] = useState<string>('');

    const searchParams = useSearchParams()
    const cookie_uuid = searchParams?.get('rst') ?? '';
    const category = searchParams?.get('category') ?? '';

    useEffect(() => {
        if (cookie_uuid == "") {
            GetStoredUuid().then((uuid) => {
                if (uuid) {
                    setUuid(uuid)
                }
            })
        } else {
            HandleUUIDFromQr("",cookie_uuid).then((uuid) => {
                setUuid(cookie_uuid)
            })
        }
            GetDishesByCategories(uuid || '', 1, 100).then((menuItems) => setMenuItems(menuItems as [{ menu: Menu, dishes: Dish[] }]))

        GetLangCookie().then((lang) => {
            if (lang) {
                setPageLang(lang);
            } else {
                setPageLang('ru');
            }
        })

    }, [category, cookie_uuid, searchParams, uuid])

    return (
        <div className="p-4">
            <h2 className="text-2xl font-bold mb-4">Меню:</h2>
            <MenuTabs categories={menuItems ? menuItems.map((item) => item.menu) : []} lang={pageLang} />
            <div>
                {category && category === 'Все' &&
                    menuItems && menuItems.map((item, index) => (

                        item.dishes.map((item) =>
                            <MenuItem
                                key={index}
                                title={item.localizations && (
                                    item.localizations.find((loc) => loc.lang === pageLang)?.title ||
                                    item.localizations.find((loc) => loc.lang === "ru")?.title ||
                                    item.localizations.find((loc) => loc.lang === "kaz")?.title ||
                                    item.localizations.find((loc) => loc.lang === "en")?.title
                                    || "Нет названия"
                                ) || ""}
                                description={item.localizations && (
                                    item.localizations.find((loc) => loc.lang === pageLang)?.description ||
                                    item.localizations.find((loc) => loc.lang === "ru")?.description ||
                                    item.localizations.find((loc) => loc.lang === "kaz")?.description ||
                                    item.localizations.find((loc) => loc.lang === "en")?.description
                                    || "Нет названия"
                                ) || ""}
                                imageUrl={item.imageUrl}
                                restUUID={cookie_uuid}
                                id={item.id}
                                price={item.price}
                            />)

                    ))}


                {category && category !== "" &&
                    menuItems && menuItems.map((item, index) => (
                       item.menu.nameEn === category || item.menu.nameKz === category || item.menu.nameRu === category && item.dishes.map((item) =>
                            <MenuItem
                                key={index}
                                title={item.localizations && (
                                    item.localizations.find((loc) => loc.lang === pageLang)?.title ||
                                    item.localizations.find((loc) => loc.lang === "ru")?.title ||
                                    item.localizations.find((loc) => loc.lang === "kaz")?.title ||
                                    item.localizations.find((loc) => loc.lang === "en")?.title
                                    || "Нет названия"
                                ) || ""}
                                description={item.localizations && (
                                    item.localizations.find((loc) => loc.lang === pageLang)?.description ||
                                    item.localizations.find((loc) => loc.lang === "ru")?.description ||
                                    item.localizations.find((loc) => loc.lang === "kaz")?.description ||
                                    item.localizations.find((loc) => loc.lang === "en")?.description
                                    || "Нет названия"
                                ) || ""}
                                imageUrl={item.imageUrl}
                                restUUID={cookie_uuid}
                                price={item.price}
                                id={item.id}
                            />)

                    ))}
            </div>
        </div>
    );
}