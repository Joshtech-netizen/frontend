'use client';

import Link from 'next/link';

export default function SuccessPage() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="bg-white p-10 rounded-2xl shadow-xl max-w-lg w-full text-center">
                <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
                <h1 className="text-3xl font-extrabold text-gray-900 mb-4">Payment Successful!</h1>
                <p className="text-gray-600 mb-8">
                    Thank you for your purchase. Your order has been securely processed and is being prepared for shipment.
                </p>
                <Link 
                    href="/" 
                    className="inline-block bg-black hover:bg-gray-800 text-white font-bold py-3 px-8 rounded-lg transition duration-200"
                >
                    Return to Store
                </Link>
            </div>
        </div>
    );
}