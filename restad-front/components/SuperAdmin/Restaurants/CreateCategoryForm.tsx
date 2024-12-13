'use client'
import React, {useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import AddMenu from "@/actions/restaurants/add-menu";
import {Button} from "@/components/ui/button";
import {langs} from "@/lib/utils";

interface PopupProps {
    onClose: () => void;
    scope: string,
    target: string,
    lang: string
}

interface Localization {
    title: string;
    lang: string
}

export default function CreateCategoryForm(props: PopupProps){
    const router = useRouter()
    const [pageLangs, setPageLangs] = useState<string[]>([]);
    const [localizations, setLocalizations] = useState<Localization[]>([]);

    useEffect(() => {
        setPageLangs([props.lang]);
        setLocalizations([{title: '', lang: props.lang}])
    }, [props.lang]);
    const nameRu = localizations.find((l) => l.lang === 'ru')?.title || '';
    const nameEn = localizations.find((l) => l.lang === 'en')?.title || '';
    const nameKaz = localizations.find((l) => l.lang === 'kaz')?.title || '';

    const handleSubmit = () => {
        AddMenu(props.target, props.scope, nameRu, nameKaz, nameEn).then(() => router.refresh())
    }
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div
                className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl overflow-y-auto no-scrollbar max-h-[90vh] relative">
                <button
                    onClick={props.onClose}
                    className="absolute top-4 right-4 text-gray-600 hover:text-black text-2xl"
                >
                    &times;
                </button>


                <div className="mb-4">

                    {pageLangs.map((lang) => (
                        <div className="border-2" key={lang}>
                            <Button variant="destructive" onClick={() => {
                                setPageLangs(pageLangs.filter((l) => l !== lang))
                                setLocalizations(localizations.filter((l) => l.lang !== lang))
                            }}>
                                Убрать локализацию {lang}
                            </Button>
                            <div className="mb-4">
                                <label className="block text-gray-700 text-sm font-bold mb-2">Название:</label>
                                <input
                                    type="text"
                                    value={localizations.find((l) => l.lang === lang)?.title || ''}
                                    onChange={(e) => setLocalizations(localizations.map((l) => l.lang === lang ? {...l, title: e.target.value} : l))}
                                    className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                                />
                            </div>


                        </div>
                    ))}
                    {
                        langs.map((newLang) => (
                            !pageLangs.includes(newLang.value) && (
                                <Button key={newLang.value} onClick={() => {
                                    !pageLangs.includes(newLang.value) && setPageLangs([...pageLangs, newLang.value])
                                    !localizations.find((l) => l.lang === newLang.value) && setLocalizations([...localizations, {title: '', lang: newLang.value}])
                                }}>
                                    Добавить локализацию на {newLang.label}
                                </Button>
                            )
                        ))
                    }
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                >
                    Создать категорию (меню)
                </button>
            </div>
        </div>
    );

}