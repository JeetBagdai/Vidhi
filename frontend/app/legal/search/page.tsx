"use client";

import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import Link from 'next/link';

interface Act {
    id: number;
    title: string;
    year: number;
    description: string;
}

export default function LegalSearchPage() {
    const [acts, setActs] = useState<Act[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");

    useEffect(() => {
        fetchActs();
    }, []);

    const fetchActs = async () => {
        try {
            const res = await fetch("http://localhost:8000/legal/acts?limit=20");
            const data = await res.json();
            setActs(data);
        } catch (error) {
            console.error("Error fetching acts:", error);
        } finally {
            setLoading(false);
        }
    };

    const filteredActs = acts.filter(act =>
        act.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        act.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <main className="min-h-screen bg-gray-900 text-white">
            <Navbar />

            <div className="pt-24 px-4 max-w-6xl mx-auto">
                <h1 className="text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                    Legal Knowledge & Constitution
                </h1>

                {/* Search Bar */}
                <div className="mb-8 relative">
                    <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                            <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                        </svg>
                    </div>
                    <input
                        type="search"
                        className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                        placeholder="Search Acts, Sections, or Keywords..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Results Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="animate-pulse bg-gray-800 h-40 rounded-xl border border-gray-700 p-6">
                                <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
                                <div className="h-3 bg-gray-700 rounded w-1/2 mb-2"></div>
                                <div className="h-3 bg-gray-700 rounded w-5/6"></div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredActs.map((act) => (
                            <Link href={`/legal/acts/${act.id}`} key={act.id} className="block group">
                                <div className="p-6 bg-gray-800 rounded-xl border border-gray-700 shadow-lg transition-transform transform group-hover:-translate-y-1 group-hover:shadow-xl h-full flex flex-col">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{act.title}</h3>
                                        <span className="bg-blue-900 text-blue-300 text-xs font-medium me-2 px-2.5 py-0.5 rounded text-end">{act.year}</span>
                                    </div>
                                    <p className="text-gray-400 text-sm flex-grow line-clamp-3">
                                        {act.description || "No description available."}
                                    </p>
                                    <div className="mt-4 pt-4 border-t border-gray-700 flex justify-between items-center text-sm text-gray-500">
                                        <span>Central Act</span>
                                        <span className="flex items-center text-blue-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            Read more <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8l4 4m0 0l-4 4m4-4H3"></path></svg>
                                        </span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </main>
    );
}
