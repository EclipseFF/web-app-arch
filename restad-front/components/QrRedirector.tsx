'use client'
import {useEffect} from "react";
import {useRouter, useSearchParams} from "next/navigation";

export default function QrRedirector() {
    const searchParams = useSearchParams();

    const rest = searchParams?.get("rest");
    const uuid = searchParams?.get("uuid");

    useEffect(() => {
        const fetchQrResolver = async () => {
            if (rest && uuid) {
                try {
                    const response = await fetch(`/api/qr-resolver?rest=${rest}&uuid=${uuid}`);
                    if (response.ok) {
                        const data = await response.json();

                        console.log("QR resolver data:", uuid);
                        window.location.href = data.redirectUrl
                    } else {
                        console.error("Failed to set cookie.");
                    }
                } catch (error) {
                    console.error("Error fetching QR resolver data:", error);
                }
            }
        };

        fetchQrResolver();
    }, [rest, uuid]);

    return <div>Загрузка...</div>;
}