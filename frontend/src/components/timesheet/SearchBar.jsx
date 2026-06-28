import React from "react";
import { Search } from "lucide-react";

const SearchBar = ({ value, onChange }) => {
    return (
        <div className="relative w-full md:w-80">

            <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            />

            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder="Search Employee..."
                className="w-full rounded-2xl border border-gray-300 bg-white py-3 pl-11 pr-4 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition"
            />

        </div>
    );
};

export default SearchBar;