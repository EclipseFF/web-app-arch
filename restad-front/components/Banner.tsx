import Image from "next/image";

export default function Banner() {
    return (
        <div className="flex justify-center items-center bg-white rounded-lg shadow-lg overflow-hidden p-4 mb-8">
            <div className="relative">
                <Image src={'/temp/partner.svg'} alt={"Stan nashim partnerom"} width={825} height={270}/>
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white bg-opacity-90 px-6 py-2 rounded-full">
                    <p className="text-center text-black font-semibold">Станьте нашим партнером</p>
                </div>
            </div>
        </div>
    );
} 