import Image from "next/image";

interface DiscountCardProps {
    title: string;
    discount: string;
    imageSrc: string;
    newPrice: string;
    onRemove: () => void;
}

export default function DiscountCard(props: DiscountCardProps) {
    return (
        <div className="relative bg-gray-100 rounded-lg overflow-hidden shadow-md">
            <Image src={props.imageSrc} width={500} height={500} alt={props.title} className="w-full h-40 object-cover"/>

            <div className="absolute top-0 right-0 bg-black text-white px-2 py-1 rounded-bl-lg">
                {props.discount}
            </div>

            <div className="p-4">
                <h3 className="text-lg font-semibold mb-2">{props.title}</h3>
                <p className="text-sm text-gray-700">Новая цена: {props.newPrice}</p>
            </div>

            <div className="p-4">
                <button
                    onClick={props.onRemove}
                    className="w-full bg-red-500 text-white py-2 rounded-lg hover:bg-red-700 transition"
                >
                    Удалить
                </button>
            </div>
        </div>
    );
};
