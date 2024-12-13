interface ItemCardProps {
    title: string;
    price: string;
    discount: string;
    imageUrl: string;
}

export default function ItemCard(props: ItemCardProps) {
    return (
        <div className="rounded-lg border overflow-hidden shadow-lg">
            <div className="relative">
                <img src={props.imageUrl} alt={props.title} className="w-full h-48 object-cover"/>
                <div className="absolute top-2 left-2 bg-black text-white text-sm font-semibold px-2 py-1 rounded">
                    {props.discount}
                </div>
            </div>
            <div className="p-4">
                <h3 className="font-semibold text-lg">{props.title}</h3>
                <p className="text-gray-500 mb-2">{props.price}</p>
                <button className="border border-purple-500 text-purple-500 rounded-full px-4 py-2 hover:bg-purple-100">
                    3D view
                </button>
            </div>
        </div>
    )
}