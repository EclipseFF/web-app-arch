'use client';
import {useSearchParams} from "next/navigation";
import {Suspense, useEffect, useState} from "react";
import HandleUUIDFromQr from "@/actions/qr-resolver/qr-resolver";
import WarningPopup from "@/components/WarningPopup";
import Image from "next/image";


export default function Page() {
    const [isPopupVisible, setIsPopupVisible] = useState(true);
    const handleConfirm = () => {
        setIsPopupVisible(false);
    };
    useEffect(() => {
        console.log('Page loaded, showing warning popup');
    }, []);

    return (
        <Suspense fallback={<div>Загрузка...</div>}>
            {isPopupVisible && (
                <WarningPopup
                    onConfirm={handleConfirm}
                    message="В ресторане есть процент за обслуживание 10%. Согласитесь чтобы продолжить"
                />
            )}
            {!isPopupVisible && (
                <Child />
            )}
        </Suspense>
    );
}

function Child() {
    const searchParams = useSearchParams();
    const name = searchParams?.get('rst');
    const uuid = searchParams?.get('uuid');

    useEffect(() => {
        if (!name || !uuid) {
            return;
        }

        const handleQr = async () => {
            await HandleUUIDFromQr(name, uuid);
        };

        handleQr();

        const redirectUrl = `https://${name}.restad.kz/?rst=${uuid}`;
        //const redirectUrl = `http://localhost:3000/?rst=${uuid}`;
        //const redirectUrl = `http://${name}.192.168.1.73:3000/?rst=${uuid}`;
        window.location.href = redirectUrl;
    }, [name, uuid]);

    if (!name || !uuid) {
        return <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-lg font-semibold text-gray-700">
            <div>Ошибка, пожалуйста попробуйте еще раз</div>
            <Image src={"/restad.png"} alt={"restad"} width={200} height={200} />
        </div>;
    }

    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100 text-lg font-semibold text-gray-700">
            <div>Загрузка</div>
            <Image src={"/restad.png"} alt={"restad"} width={200} height={200} />
        </div>
    );
}