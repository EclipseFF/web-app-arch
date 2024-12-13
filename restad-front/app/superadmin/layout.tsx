import Header from "@/components/SuperAdmin/Header";
import Footer from "@/components/Footer";

export default function DashboardLayout({
                                            children,
                                        }: {
    children: React.ReactNode
}) {
    return <div>
        <Header />
        {children}
        <Footer />
    </div>
}