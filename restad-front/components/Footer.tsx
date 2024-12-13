export default function Footer(){
    return (
        <footer className="bg-[#03081F] text-white py-6">
            <div className="container mx-auto px-4 flex flex-row md:flex-row justify-between items-center">
                <div className="text-left md:text-left mb-4 md:mb-0">
                    <p>restad by Quanta</p>
                    <p>ИП “Quanta”</p>
                </div>
                <div className="text-right mb-4">
                    <p>+7 228 069 14 88</p>
                    <p>еще какая-то инфа</p>
                </div>
            </div>
        </footer>
    );
}