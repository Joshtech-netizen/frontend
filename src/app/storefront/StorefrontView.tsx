/* eslint-disable react-hooks/set-state-in-effect */
'use client';

import { useState, useLayoutEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import useSWR from 'swr';
import { useCartStore } from '../../store/cartStore';

interface Product {
    id: number;
    name: string;
    description: string;
    price: number;
    stock_quantity: number;
    image_url: string | null;
}

// SWR Fetcher function
const fetcher = (url: string) => axios.get(url).then((res) => res.data);

export default function Storefront() {
    const [isMounted, setIsMounted] = useState(false);
    useLayoutEffect(() => setIsMounted(true), []);

    const addItemToCart = useCartStore((state) => state.addItem);
    const cartItems = useCartStore((state) => state.items);
    const totalCartItems = cartItems.reduce((total, item) => total + item.quantity, 0);

    // REAL-TIME MAGIC: SWR automatically fetches data and refetches it in the background every 5 seconds.
    // If the admin changes stock, the UI updates instantly.
    const { data: products, error, isLoading } = useSWR<Product[]>(
        `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/products`,
        fetcher,
        { refreshInterval: 5000 }
    );

    const formatPrice = (priceInPesewas: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(priceInPesewas / 100);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (error) return <div className="text-center mt-20 text-red-500">Failed to load products.</div>;

    return (
        <div className="min-h-screen bg-gray-100 pb-12">
            {/* Top Navigation Bar (Jumia Style) */}
            <nav className="bg-white shadow-sm sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                        {/* A simple placeholder logo */}
                        <div className="bg-orange-500 text-white font-black text-xl px-2 py-1 rounded">SYL SONA VENTURES</div>
                    </div>
                    <div className="flex-1 max-w-2xl mx-8 hidden md:block">
                        <input
                            type="text"
                            placeholder="Search products, brands and categories"
                            className="w-full border border-gray-300 rounded-md py-2 px-4 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500"
                        />
                    </div>
                    <div className="flex items-center">
                        <Link href="/checkout" className="flex items-center text-gray-700 hover:text-orange-500 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            {/* Update this span right here! */}
                            <span className="ml-2 font-bold bg-orange-500 text-white rounded-full px-2 py-0.5 text-xs">
                                {isMounted ? totalCartItems : 0}
                            </span>
                        </Link>
                    </div>
                </div>
            </nav>

            {/* Hero Banner */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 mb-8">
                <div className="bg-linear-to-r from-orange-500 to-yellow-400 rounded-xl p-8 md:p-12 text-white shadow-md flex flex-col justify-center h-48 md:h-64 relative overflow-hidden">
                    <h1 className="text-3xl md:text-5xl font-black mb-2 z-10">Flash Sales Everyday!</h1>
                    <p className="text-lg md:text-xl font-medium z-10 opacity-90">Up to 40% off on premium items.</p>
                    {/* Decorative background element */}
                    <div className="absolute right-0 bottom-0 opacity-20 transform translate-x-1/4 translate-y-1/4">
                        <svg className="w-64 h-64" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2L2 22h20L12 2z" /></svg>
                    </div>
                </div>
            </div>

            {/* Product Grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="bg-white rounded-xl shadow-sm p-4 md:p-6">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 border-b pb-2">Top Selling Items</h2>

                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                        {products?.map((product) => (
                            <div key={product.id} className="bg-white rounded-lg border border-gray-100 shadow-sm hover:shadow-lg transition-shadow duration-300 overflow-hidden flex flex-col group relative">

                                {/* Discount Badge */}
                                <div className="absolute top-2 left-2 bg-orange-100 text-orange-600 text-xs font-black px-2 py-1 rounded z-10">
                                    -15%
                                </div>

                                {/* Image Container */}
                                <div className="h-48 md:h-56 bg-white w-full relative flex items-center justify-center p-4">
                                    {product.image_url ? (
                                        <Image
                                            src={product.image_url}
                                            alt={product.name}
                                            fill
                                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <span className="text-gray-300 font-medium text-xs">No Image</span>
                                    )}
                                </div>

                                <div className="p-4 flex flex-col grow border-t border-gray-50">
                                    <h3 className="text-sm text-gray-700 font-medium line-clamp-2 mb-1 h-10">
                                        {product.name}
                                    </h3>
                                    <div className="mt-auto">
                                        <span className="text-lg font-black text-gray-900 block mb-3">
                                            {formatPrice(product.price)}
                                        </span>
                                        <button
                                            onClick={() => addItemToCart({
                                                product_id: product.id,
                                                name: product.name,
                                                price: product.price,
                                                stock_quantity: product.stock_quantity
                                            })}
                                            disabled={product.stock_quantity === 0}
                                            className="w-full bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 text-white font-bold py-2 rounded shadow-sm transition-colors text-sm uppercase tracking-wide"
                                        >
                                            {product.stock_quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}