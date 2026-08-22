import { useNavigate } from "react-router-dom";
import { Suspense, lazy } from "react";
import Navbar from "../Landing/Navbar.jsx";
// ✅ Hero above-the-fold hai — LCP isi se aati hai, isliye eager rakha
import HomeHeroSection from "../../components/sections/HomeHeroSection.jsx";

// ✅ Baaki sab below-the-fold — lazy, initial bundle se bahar
const HomeAboutSection = lazy(() => import("../../components/sections/HomeAboutSection.jsx"));
const HomeProblemsSection = lazy(() => import("../../components/sections/HomeProblemsSection.jsx"));
const HomeFeaturesSection = lazy(() => import("../../components/sections/HomeFeaturesSection.jsx"));
const CTASection = lazy(() => import("../../components/sections/CTASection.jsx"));
const FooterSection = lazy(() => import("../../components/sections/FooterSection.jsx"));

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 text-gray-800">
            <Navbar />

            {/* HERO SECTION — LCP element, eager load */}
            <HomeHeroSection />

            {/* Baaki sections ek hi Suspense boundary me — sirf ek chhota fallback */}
            <Suspense fallback={<div className="min-h-[40vh]" />}>
                <HomeAboutSection />
                <HomeProblemsSection />
                <HomeFeaturesSection />
                <CTASection />
                <FooterSection />
            </Suspense>
        </div>
    );
};

export default Home;