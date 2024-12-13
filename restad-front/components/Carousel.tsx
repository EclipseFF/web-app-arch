import {Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from "next/image";
import {clsx} from "clsx";

export default function MyCarousel(){
    return (
        <div className={clsx("w-full max-w-[350px] mx-auto md:max-w-[900px]")} id="promo-slider">
            <Carousel>
                <CarouselContent>
                    <CarouselItem>
                        <div className="flex items-center justify-center p-4 md:p-6">
                            <Image src={'/temp/banner.png'} alt={''} width={825} height={270}/>
                        </div>
                    </CarouselItem>
                    <CarouselItem>
                        <div className="flex items-center justify-center p-4 md:p-6">
                            <Image src={'/temp/banner.png'} alt={''} width={825} height={270}/>
                        </div>
                    </CarouselItem>
                    <CarouselItem>
                        <div className="flex items-center justify-center p-4 md:p-6">
                            <Image src={'/temp/banner.png'} alt={''} width={825} height={270}/>
                        </div>
                    </CarouselItem>
                </CarouselContent>
                <CarouselPrevious className="hidden md:visible"/>
                <CarouselNext className="hidden md:visible"/>
            </Carousel>
        </div>
    )
}