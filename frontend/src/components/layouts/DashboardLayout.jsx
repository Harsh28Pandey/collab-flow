import React, { useContext } from 'react';
import { UserContext } from '../../context/userContext.jsx';
import Navbar from './Navbar.jsx';
import SideMenu from './SideMenu.jsx';

const DashboardLayout = ({ children, activeMenu }) => {

    const { user } = useContext(UserContext);

    return (
        <div className="w-full min-h-screen bg-[#fafaf9] text-slate-900 overflow-x-hidden relative">

            {/* Subtle Dot Mesh Background (Fixed so it doesn't scroll) */}
            <div className="fixed inset-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_100%_100%_at_50%_0%,#000_60%,transparent_100%)] opacity-30 pointer-events-none z-0" />

            {/* Navbar */}
            <div className="relative z-40">
                <Navbar activeMenu={activeMenu} />
            </div>

            {user && (
                <div className="flex w-full relative pt-[61px] z-10">

                    {/* Desktop Sidebar */}
                    <div className="hidden lg:block fixed top-[61px] h-[calc(100vh-61px)] z-30 flex-shrink-0">
                        <SideMenu activeMenu={activeMenu} />
                    </div>

                    {/* Main Content */}
                    <main className='flex-1 min-w-0 min-h-[calc(100vh-61px)] px-4 sm:px-6 md:px-8 lg:ml-[245px] lg:px-8 xl:px-10 py-4 lg:py-6 transition-all duration-300 relative'>

                        {/* Content Wrapper */}
                        <div className='w-full max-w-[1700px] mx-auto animate-fadeIn'>
                            {children}
                        </div>

                    </main>

                </div>
            )}

        </div>
    );
}

export default DashboardLayout;