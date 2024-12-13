interface MenuItemProps {
    title: string;
    imageSrc: string;
}

export default function MenuItem(props: MenuItemProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4">
            <img src={props.imageSrc} alt={props.title} className="w-full h-32 object-cover rounded-md" />
            <h3 className="mt-2 text-lg font-semibold">{props.title}</h3>
        </div>
    );
}