import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from "recharts";
import CustomTooltip from './CustomTooltip';
import CustomLegend from './CustomLegend';

const CustomPieChart = ({ data, colors }) => {
    return (
        <div className="relative w-full h-full min-h-[300px] sm:min-h-[340px] flex items-center justify-center overflow-hidden py-2">

            {/* Center Core Ambient Glow */}
            <div className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 bg-white/5 blur-[40px] rounded-full pointer-events-none"></div>

            <ResponsiveContainer width="100%" height={320}>
                <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                    {/* SVG Definitions for premium drop-shadows */}
                    <defs>
                        <filter id="pieShadow" x="-20%" y="-20%" width="140%" height="140%">
                            <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#000" floodOpacity="0.7" />
                        </filter>
                    </defs>

                    <Pie
                        data={data}
                        dataKey="count"
                        nameKey="status"
                        cx="50%"
                        cy="46%"                 
                        outerRadius="72%"        
                        innerRadius="52%"        
                        paddingAngle={6}         
                        cornerRadius={10}        
                        labelLine={false}
                        stroke="none"
                        style={{ filter: 'url(#pieShadow)' }}
                    >
                        {data.map((entry, index) => (
                            <Cell
                                key={`cell-${index}`}
                                fill={colors[index % colors.length]}
                                style={{
                                    filter: `drop-shadow(0px 0px 8px ${colors[index % colors.length]}60)`
                                }}
                            />
                        ))}
                    </Pie>

                    <Tooltip
                        content={<CustomTooltip />}
                        cursor={{ fill: 'transparent' }}
                    />

                    <Legend
                        content={<CustomLegend />}
                        verticalAlign="bottom"
                        wrapperStyle={{ paddingTop: '10px' }} 
                    />
                </PieChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CustomPieChart;