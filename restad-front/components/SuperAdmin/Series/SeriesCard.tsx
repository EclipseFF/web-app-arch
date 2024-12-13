import Image from "next/image";
import {resUrl} from "@/lib/api";

interface CardProps {
    title: string;
}

export default function SeriesCard(props: CardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col items-center">
                </div>

                <div className="bg-white w-full p-2 text-center">
                    <p className="text-sm font-bold text-black">{props.title}</p>
                </div>
            </div>
    );
}