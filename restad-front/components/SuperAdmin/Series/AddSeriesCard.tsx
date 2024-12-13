interface AddSeriesCardProps {
    onClick: () => void;
    name: string;
}

export default function AddSeriesCard(props: AddSeriesCardProps){
    return (
        <div
            onClick={props.onClick}
            className="bg-white rounded-lg shadow-md p-4 flex items-center justify-center cursor-pointer hover:bg-gray-100 transition duration-200"
        >
            <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mb-2">
                    <span className="text-4xl font-bold text-purple-600">+</span>
                </div>
                <h3 className="text-lg font-semibold">{props.name}</h3>
            </div>
        </div>
    )
}