import Header from "@/components/Header";
import MyCarousel from "@/components/Carousel";
import ItemCarousel from "@/components/ItemCarousel/ItemCarousel";
import MenuList from "@/components/Menu/MenuList";
import Banner from "@/components/Banner";
import Footer from "@/components/Footer";
import {Suspense} from "react";

export default function Home() {
  return (
      <div>
          <Suspense>
        <Header />
          </Suspense>
        {/*<MyCarousel />*/}
          <ItemCarousel />
          <Suspense>
            <MenuList />
          </Suspense>
          <Banner />
          <Footer />
      </div>
  )
}
