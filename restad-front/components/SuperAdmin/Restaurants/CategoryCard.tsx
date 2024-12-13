interface CardProps {
    name: string;
}

export default function CategoryCard(props: CardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="flex flex-col items-center">
                <div className="bg-white w-full p-2 text-center">
                    <p className="text-sm font-bold text-black">{props.name}</p>
                </div>
            </div>
        </div>
    );
}