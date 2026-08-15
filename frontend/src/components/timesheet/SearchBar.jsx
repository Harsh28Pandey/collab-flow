import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange }) => {
    return (
        <div className="relative w-full md:w-80">

            <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-cyan-400"
            />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search Employee..."
                className="w-full h-11 rounded-2xl border border-white/10 bg-zinc-950/80 backdrop-blur-xl py-3 pl-11 pr-4 text-xs sm:text-sm font-mono text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-400 transition-all shadow-inner"
            />

        </div>
    );
};

export default SearchBar;