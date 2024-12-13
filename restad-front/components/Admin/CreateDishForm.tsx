'use client'
import React, {useEffect, useState} from "react";
import {Menu} from "@/lib/models";
import {apiUrl} from "@/lib/api";
import GetToken from "@/actions/users/get-token";
import Image from "next/image";
import GetLangCookie from "@/actions/lang/get-lang-cookie";
import {Button} from "@/components/ui/button";
import {Popover, PopoverContent, PopoverTrigger} from "@/components/ui/popover";
import {langs} from "@/lib/utils";

interface PopupProps {
    onClose: () => void;
    onSubmit: (formdata: FormData) => void;
    menus: Menu[];
    uuid: string;
    lang: string
}

export interface Localization {
    title: string;
    description: string;
    lang: string
}

export default function CreateDishForm(props: PopupProps){
    const [menuId, setMenuId] = useState<number>(-1);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [price, setPrice] = useState<number>(0);
    const [image, setImage] = useState<File | null>(null);
    const [available, setAvailable] = useState<boolean>(true);
    const [token, setToken] = useState('');
    const [pageLangs, setPageLangs] = useState<string[]>([props.lang]);
    const [localizations, setLocalizations] = useState<Localization[]>([]);


    useEffect(() => {
        setPageLangs([props.lang]);
        setLocalizations([{title: '', description: '', lang: props.lang}])
    }, [props.lang]);

    useEffect(() => {
        GetToken().then((token) => {
            if (token) {
                setToken(token);
            }
        });
    }, []);

    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length >0) {
            setImage(event.target.files[0]);
        }
    }

    const handleSubmit  = () => {
        let formdata : FormData = new FormData();
        formdata.append("uuid", props.uuid)
        if(menuId===-1){
            formdata.append("menu", "")
        }else {
            formdata.append("menu", menuId?.toString()|| "")
        }
        formdata.append("price", price?.toString()|| "")
        formdata.append("available", available?.toString()|| "")
        if (image) {
            formdata.append("image", image);
        }
        localizations.forEach((localization) => {
            formdata.append(localization.lang, JSON.stringify({title: localization.title, description: localization.description, lang: localization.lang}));
        })

        fetch(apiUrl + '/dishes/rest', {
            headers: {
                'Authentication-Token': token
            },
            method: 'POST',
            body: formdata
        })

        props.onClose();

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
                    <label className="block text-gray-700 text-sm font-bold mb-2">Изображение:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {
                        image && (
                            <Image src={URL.createObjectURL(image)} alt="Selected" width={100} height={100}/>
                        )
                    }
                </div>
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

                        <div className="mb-4">
                            <label className="block text-gray-700 text-sm font-bold mb-2">Описание:</label>
                            <input
                                type="text"
                                value={localizations.find((l) => l.lang === lang)?.description || ''}
                                onChange={(e) => setLocalizations(localizations.map((l) => l.lang === lang ? {...l, description: e.target.value} : l))}
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
                                !localizations.find((l) => l.lang === newLang.value) && setLocalizations([...localizations, {title: '', description: '', lang: newLang.value}])
                            }}>
                                Добавить локализацию на {newLang.label}
                            </Button>
                        )
                    ))
                }

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Цена:</label>
                    <input
                        type="number"
                        value={price}
                        onChange={(e) => setPrice(Number(e.target.value))}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Доступно ли?</label>
                    <input
                        type="checkbox"
                        checked={available}
                        onChange={() => setAvailable(!available)}
                        className="mr-2"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Категория:</label>
                    <select value={menuId} onChange={(e) => setMenuId(Number(e.target.value))} name="menuId"
                            id="menuId-select">
                        <option value={-1}>Без категории</option>
                        {props.menus && props.menus.length > 0 && (
                            props.menus.map((menu) => (
                                <option key={menu.id} value={menu.id}>{menu.nameRu}</option>
                            ))
                        )}
                    </select>
                </div>

                <button
                    onClick={handleSubmit}
                    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                >
                    Загрузить
                </button>
            </div>
        </div>
    );

}