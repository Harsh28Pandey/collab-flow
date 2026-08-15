import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";

const CustomBarChart = ({ data }) => {

    //* function to assign modern neon colors based on priority
    const getBarColor = (entry) => {
        switch (entry?.priority) {
            case "Low":
                return "#34d399"; // Neon Emerald
            case "Medium":
                return "#38bdf8"; // Neon Cyan
            case "High":
                return "#f43f5e"; // Neon Rose / Red
            default:
                return "#38bdf8";
        }
    }

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            return (
                <div className='bg-zinc-900/90 backdrop-blur-3xl shadow-[0_10px_30px_rgba(0,0,0,0.8)] rounded-2xl p-3 border border-white/10 min-w-[130px] z-50'>
                    <p className='text-xs font-mono font-bold text-cyan-400 mb-1 tracking-wide'>
                        Priority: {payload[0].payload.priority}
                    </p>
                    <div className='flex items-center justify-between gap-4'>
                        <span className='text-[11px] font-mono text-zinc-400'>Count:</span>
                        <span className='text-xs font-mono font-black text-white bg-white/10 px-2 py-0.5 rounded-md'>
                            {payload[0].payload.count}
                        </span>
                    </div>
                </div>
            )
        }
        return null;
    }

    return (
        <div className="relative w-full h-full min-h-[300px] sm:min-h-[340px] flex items-center justify-center overflow-hidden py-2">

            {/* Center Core Ambient Glow */}
            <div className="absolute top-[50%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-white/5 blur-[50px] rounded-full pointer-events-none"></div>

            <ResponsiveContainer width="100%" height={320}>
                <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>

                    {/* SVG Definitions for Bar Shadows */}
                    <defs>
                        <filter id="barShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.6" />
                        </filter>
                    </defs>

                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />

                    <XAxis
                        dataKey="priority"
                        tick={{ fontSize: 11, fill: "#a1a1aa", fontFamily: "monospace" }}
                        stroke="rgba(255,255,255,0.1)"
                        tickLine={false}
                        axisLine={false}
                    />

                    <YAxis
                        tick={{ fontSize: 11, fill: "#a1a1aa", fontFamily: "monospace" }}
                        stroke="none"
                        tickLine={false}
                        axisLine={false}
                        allowDecimals={false}
                    />

                    <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(255,255,255,0.02)" }} />

                    <Bar
                        dataKey="count"
                        nameKey="priority"
                        radius={[10, 10, 0, 0]}
                        style={{ filter: 'url(#barShadow)' }}
                    >
                        {data?.map((entry, index) => {
                            const barColor = getBarColor(entry);
                            return (
                                <Cell
                                    key={`cell-${index}`}
                                    fill={barColor}
                                    style={{
                                        filter: `drop-shadow(0px 0px 8px ${barColor}60)`
                                    }}
                                />
                            );
                        })}
                    </Bar>

                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CustomBarChart;