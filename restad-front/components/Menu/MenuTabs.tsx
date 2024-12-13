'use client'
import {useCallback, useEffect, useState} from "react";
import {usePathname, useSearchParams} from "next/navigation";
import {useRouter} from "next/navigation";
import {Menu} from "@/lib/models";

interface MenuTabsProps {
    categories: Menu[]
    lang: string
}

export default function MenuTabs(props: MenuTabsProps) {
    const [activeTab, setActiveTab] = useState<Menu>()
    const [menuTabs, setMenuTabs] = useState<Menu[]>([])
    const [lang, setLang] = useState('ru');
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();

    const createQueryString = useCallback(
        (name: string, value: string) => {
            if (!searchParams) {
                return
            }
            const params = new URLSearchParams(searchParams.toString());
            params.set(name, value);

            return params.toString();
        },
        [searchParams]
    )

    useEffect(() => {
        //const newUrl = `${pathname}?${createQueryString('category', 'Все')}`;
        //router.replace(newUrl);
        setActiveTab({restaurantId: "", id: -1, nameRu: 'Все', nameKz: 'Все', nameEn: 'Все'});
        setMenuTabs(props.categories)
        setLang(props.lang)
    }, [props.categories, props.lang]);

    const handleTabChange = (category: Menu) => {
        setActiveTab(category);
        const newUrl = `${pathname}?${createQueryString('category', category.nameRu || 'Все')}`;

        window.history.replaceState(null, '', newUrl);
    };

    return (
        <div className="flex flex-col md:flex-row items-center gap-4 md:gap-8 py-4 pb-10">
            <div
                className="flex md:flex-wrap overflow-x-auto md:overflow-x-visible gap-2 basis-full max-w-[350px] md:max-w-full bg-white no-scrollbar">
                <button
                        className={`text-lg md:text-base px-4 md:py-2 rounded-full border ${
                            activeTab?.nameRu === 'Все' ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                        onClick={() => handleTabChange({restaurantId: "", id: -1, nameRu: 'Все', nameKz: 'Все', nameEn: 'Все'})}> Все

                </button>
                {menuTabs.map((tab, index) => (
                    <button
                        key={tab.id}
                        className={`text-lg md:text-base px-4 md:py-2 rounded-full border ${
                            (activeTab?.nameRu === tab.nameRu || activeTab?.nameKz === tab.nameKz || activeTab?.nameEn === tab.nameEn) ? 'bg-black text-white' : 'bg-white text-black'
                        }`}
                        onClick={() => handleTabChange(tab)}
                    >
                        {
                            tab.nameRu !== "without category" && tab.nameEn !== "without category" && tab.nameKz !== "without category"  &&
                            (lang === "ru" ? tab.nameRu : lang === "kz" ? tab.nameKz : tab.nameEn)
                        }
                    </button>
                ))}

            </div>
        </div>
    )
}