interface AddCategoryButtonProps {
    onClick: () => void;
}

export default function AddCategoryButton(props: AddCategoryButtonProps) {
    return (
        <button
            onClick={props.onClick}
            className="px-4 py-2 rounded-full border bg-white text-black flex items-center gap-2 hover:bg-gray-100 transition duration-200"
        >
            <span className="text-2xl font-bold">+</span>
        </button>
    );
}