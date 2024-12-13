import {Button} from "@/components/ui/button";

export default async function Page() {

    return (
        <div className="bg-gray-100">
            Управление доступом
            <div className="grid grid-cols-3 gap-2 p-2">
                <Button variant="link">
                    Пользователь - Франшиза
                </Button>
                <Button variant="link">
                    Пользователь - Ресторан
                </Button>
                <Button variant="link">
                    Франшиза - Ресторан
                </Button>
            </div>
        </div>
    )
}