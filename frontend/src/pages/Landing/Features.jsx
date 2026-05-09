import Navbar from "../Landing/Navbar.jsx";
import AnimatedFlow from "./AnimatedFlow.jsx";
import { useNavigate } from "react-router-dom";
import CTASection from "../../components/sections/CTASection.jsx";
import FooterSection from "../../components/sections/FooterSection.jsx";
import FeaturesProductVisualSection from "../../components/sections/FeaturesProductVisualSection.jsx";
import FeaturesGridSection from "../../components/sections/FeaturesGridSection.jsx";
import FeaturesHeroSection from "../../components/sections/FeaturesHeroSection.jsx";

const Features = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 text-gray-800">
            <Navbar />

            {/* HERO */}
            <FeaturesHeroSection />

            {/* FEATURES GRID */}
            <FeaturesGridSection />

            {/* FLOW */}
            <AnimatedFlow />

            {/* PRODUCT VISUAL */}
            <FeaturesProductVisualSection />

            {/* CTA SECTION */}
            <CTASection />

            {/* FOOTER */}
            <FooterSection />
        </div>
    );
};

export default Features;