import Header from "@/components/SuperAdmin/Header";
import RestaurantList from "@/components/SuperAdmin/Restaurants/RestaurantList";
import Footer from "@/components/Footer";

export default function SuperAdmin() {
    return (
        <div className="min-h-screen bg-gray-100">
            <RestaurantList/>
        </div>
    )
}