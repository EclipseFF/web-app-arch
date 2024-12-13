'use client'
import React, {useEffect, useState} from "react";
import {apiUrl} from "@/lib/api";
import {redirect} from "next/navigation";
import GetToken from "@/actions/users/get-token";
import {Restaurant} from "@/lib/models";
import {QRCodeCanvas} from "qrcode.react";
import Image from "next/image";
import { transliterate as tr, slugify } from 'transliteration';
interface PopupProps {
    onClose: () => void;
    onSubmit: (formdata: FormData) => void;
}

export default function CreateRestaurant(props: PopupProps){
    const [name, setName] = useState('');
    const [transliteration, setTransliteration] = useState('');
    const [description, setDescription] = useState('');
    const [primaryColor, setPrimaryColor] = useState('#FFFFFF');
    const [secondaryColor, setSecondaryColor] = useState('#FFFFFF');
    const [address, setAddress] = useState('');
    const [logoImage, setLogoImage] = useState<File | null>(null);
    const [token, setToken] = useState('');
    const [qrLink, setQrLink] = useState<string | null>(null);

    useEffect(() => {
        GetToken().then((token) => {
            if (token) {
                setToken(token);
            }
        });
    }, []);
    const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        if (event.target.files && event.target.files.length >0) {
            setLogoImage(event.target.files[0]);
        }
    }

    const handleSubmit  = () => {
        let formdata : FormData = new FormData();
        formdata.append("name", name)
        formdata.append("translation", transliteration)
        formdata.append("description", description)
        formdata.append("primary_color", primaryColor)
        formdata.append("secondary_color", secondaryColor)
        formdata.append("address", address)
        if (logoImage) {
            formdata.append("logo_image", logoImage);
        }


        fetch(apiUrl + '/restaurants', {
            headers: {
                'Authentication-Token': token,
            },
            method: 'POST',
            body: formdata,
        })
            .then((response) => {
                if (response.ok) {
                    const json = response.json();
                    console.log(json)
                    let restaurant: Restaurant;
                    if (json) {
                        json.then((json) => {
                            restaurant = {
                                uuid: json.restaurant.uuid,
                                name: json.restaurant.name,
                                translation: json.restaurant.translation,
                                description: json.restaurant.description,
                                logo_image: json.restaurant.logo_image,
                                primary_color: json.restaurant.primary_color,
                                secondary_color: json.restaurant.secondary_color,
                                address: json.restaurant.address
                            }
                            const qrLink = `https://restad.kz/qr-resolver?rst=${encodeURIComponent(json.restaurant.translation)}&uuid=${json.restaurant.uuid}`;
                            setQrLink(qrLink);
                        });

                    }
                } else {
                    console.error('Error creating restaurant:', response.statusText);
                }
            })
            .catch((error) => {
                console.error('Error creating restaurant:', error);
            });
    }

    const downloadQRCode = () => {
        const canvas = document.querySelector('canvas');
        if (canvas) {
            const url = canvas.toDataURL('image/png');
            const link = document.createElement('a');
            link.href = url;
            link.download = 'restaurant_qr_code.png';
            link.click();
        }
    };

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
                    <label className="block text-gray-700 text-sm font-bold mb-2">Логотип:</label>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
                    />
                    {logoImage && (
                        <Image src={URL.createObjectURL(logoImage)} alt={'Лого'} width={200} height={200} />
                    )}
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Название:</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => (
                            setName(e.target.value),
                            setTransliteration(slugify(e.target.value))
                        )}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Транслитерация:</label>
                    <input
                        type="text"
                        value={transliteration}
                        onChange={(e) => setTransliteration(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Описание:</label>
                    <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                        rows={3}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Основной цвет:</label>
                    <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-full h-10 p-2 rounded-md focus:outline-none"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Вторичный цвет:</label>
                    <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-full h-10 p-2 rounded-md focus:outline-none"
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-gray-700 text-sm font-bold mb-2">Адресс:</label>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-2 border rounded-md text-gray-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                </div>

                {qrLink && (
                    <div className="mt-6">
                        <h3 className="text-xl font-bold mb-4">QR Code</h3>
                        <QRCodeCanvas value={qrLink} size={256} />
                        <button
                            onClick={downloadQRCode}
                            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                        >
                            Download QR Code
                        </button>
                        <button
                            onClick={props.onClose}
                            className="mt-4 ml-4 px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                        >
                            Close
                        </button>
                    </div>
                )}

                {!qrLink &&
                    <button
                        onClick={handleSubmit}
                        className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 w-full mt-4"
                    >
                        Submit
                    </button>}
            </div>
        </div>
    );

}