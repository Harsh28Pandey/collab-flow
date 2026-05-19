import React, { useContext } from 'react';

import { UserContext } from '../../context/userContext.jsx';

import Navbar from './Navbar.jsx';

import SideMenu from './SideMenu.jsx';

const DashboardLayout = ({ children, activeMenu }) => {

    const { user } = useContext(UserContext);

    return (

        <div className="w-full min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/30 to-white overflow-x-hidden">

            {/* Navbar */}

            <Navbar activeMenu={activeMenu} />

            {user && (

                <div className="flex w-full relative pt-[61px]">

                    {/* Desktop Sidebar */}

                    <div className="hidden lg:block fixed top-[61px] h-[calc(100vh-61px)] z-30 flex-shrink-0">

                        <SideMenu activeMenu={activeMenu} />

                    </div>

                    {/* Main Content */}

                    <main className='flex-1 min-w-0 min-h-[calc(100vh-61px)] px-4 sm:px-6 md:px-8 lg:ml-[245px] lg:px-8 xl:px-10 py-4 lg:py-6 transition-all duration-300'>

                        {/* Content Wrapper */}

                        <div className='
                            w-full
                            max-w-[1700px]
                            mx-auto
                            animate-fadeIn
                        '>

                            {children}

                        </div>

                    </main>

                </div>

            )}

        </div>
    );
}

export default DashboardLayout;