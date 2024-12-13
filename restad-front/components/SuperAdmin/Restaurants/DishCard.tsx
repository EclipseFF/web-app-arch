import Image from "next/image";
import {resUrl} from "@/lib/api";

interface CardProps {
    title: string;
    description: string;
    image_url: string;
    price:number;
    id: number;
}

export default function DishCard(props: CardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col items-center">
                <div className="bg-black w-full h-32 flex items-center justify-center">
                    <Image
                        src={resUrl + "/" + props.id + "/"+ props.image_url}
                        alt={props.title}
                        width={238}
                        height={203}
                    />
                </div>

                <div className="bg-white w-full p-2 text-center">
                    <p className="text-sm font-bold text-black">{props.title}</p>
                    <p className="text-sm font-bold text-black">{props.description}</p>
                    <p className="text-sm font-bold text-black">{props.price}</p>
                </div>
            </div>
        </div>
    );
}