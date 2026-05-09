import Navbar from "../Landing/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import CTASection from "../../components/sections/CTASection.jsx";
import FooterSection from "../../components/sections/FooterSection.jsx";
import HomeFeaturesSection from "../../components/sections/HomeFeaturesSection.jsx";
import HomeProblemsSection from "../../components/sections/HomeProblemsSection.jsx";
import HomeAboutSection from "../../components/sections/HomeAboutSection.jsx";
import HomeHeroSection from "../../components/sections/HomeHeroSection.jsx";

const Home = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 text-gray-800">
            <Navbar />

            {/* HERO SECTION */}
            <HomeHeroSection />

            {/* ABOUT SECTION */}
            <HomeAboutSection />

            {/* PROBLEMS SECTION */}
            <HomeProblemsSection />

            {/* FEATURE STRIP */}
            <HomeFeaturesSection />

            {/* CTA SECTION */}
            <CTASection />

            {/* FOOTER */}
            <FooterSection />
        </div>
    );
};

export default Home;