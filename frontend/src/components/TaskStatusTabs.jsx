import React from 'react'

const TaskStatusTabs = ({ tabs, activeTab, setActiveTab }) => {
    return (
        <div className='my-2'>
            <div className='flex overflow-x-auto scrollbar-hide gap-1.5 sm:gap-2 px-1'>

                {tabs.map((tab) => (
                    <button
                        key={tab.label}
                        onClick={() => setActiveTab(tab.label)}
                        className={`relative shrink-0 px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-mono font-bold whitespace-nowrap transition-all duration-300 cursor-pointer ${activeTab === tab.label
                                ? 'text-cyan-300 bg-cyan-500/15 border border-cyan-500/30 shadow-[0_0_15px_rgba(56,189,248,0.2)]'
                                : 'text-zinc-400 hover:text-zinc-200 bg-zinc-900/60 hover:bg-zinc-900 border border-white/5'
                            }`}
                    >
                        <div className='flex items-center gap-2'>
                            <span>{tab.label}</span>

                            <span
                                className={`text-[10px] sm:text-xs font-mono font-black px-2 py-0.5 rounded-full ${activeTab === tab.label
                                        ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                                        : 'bg-zinc-800 text-zinc-400 border border-white/5'
                                    }`}
                            >
                                {tab.count}
                            </span>
                        </div>

                        {activeTab === tab.label && (
                            <div className='absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-[2px] bg-gradient-to-r from-cyan-400 to-purple-500 rounded-full shadow-[0_0_8px_rgba(56,189,248,0.8)]'></div>
                        )}
                    </button>
                ))}

            </div>
        </div>
    )
}

export default TaskStatusTabs;