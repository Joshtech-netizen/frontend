'use client'; 

import dynamic from 'next/dynamic';

// Dynamically import the checkout client to disable SSR and prevent Paystack window errors
const CheckoutClient = dynamic(() => import('./CheckoutClient'), {
    ssr: false,
});

export default function CheckoutPage() {
    return (
        <main>
            <CheckoutClient />
        </main>
    );
}