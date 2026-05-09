import Navbar from "../Landing/Navbar.jsx";
import { useNavigate } from "react-router-dom";
import CTASection from "../../components/sections/CTASection.jsx";
import AboutValuesSection from "../../components/sections/AboutValuesSection.jsx";
import AboutMissionVisionSection from "../../components/sections/AboutMissionVisionSection.jsx";
import AboutStorySection from "../../components/sections/AboutStorySection.jsx";
import AboutHeroSection from "../../components/sections/AboutHeroSection.jsx";
import FooterSection from "../../components/sections/FooterSection.jsx";

const About = () => {
    const navigate = useNavigate();

    return (
        <div className="bg-gray-50 text-gray-800">
            <Navbar />

            {/* HERO */}
            <AboutHeroSection />

            {/* STORY */}
            <AboutStorySection />

            {/* MISSION & VISION */}
            <AboutMissionVisionSection />

            {/* VALUES */}
            <AboutValuesSection />

            {/* CTA SECTION */}
            <CTASection />

            {/* FOOTER */}
            <FooterSection />
            
        </div>
    );
};

export default About;