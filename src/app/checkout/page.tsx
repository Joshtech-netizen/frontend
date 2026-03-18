'use client';

import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import axios from 'axios';

export default function CheckoutPage() {
    const [loading, setLoading] = useState(false);

    // Mocking a cart for this example. 
    // In reality, this would come from your global state (Zustand/Redux/Context)
    const cartItems = [
        { product_id: 1, quantity: 2 },
    ];

    // 1. Paystack Configuration Setup
    // We leave amount and reference empty initially, as the backend will provide them.
    const [paystackConfig, setPaystackConfig] = useState({
        reference: '',
        email: 'customer@example.com', // Replace with actual logged-in user's email
        amount: 0,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    });

    // Initialize the Paystack hook
    const initializePayment = usePaystackPayment(paystackConfig);

    // 2. The Secure Checkout Handler
    const handleCheckout = async () => {
        setLoading(true);

        try {
            // STEP A: Ask the backend to calculate the total and create a pending order
            // Note: Ensure you are passing your Sanctum Auth Bearer token in the headers here!
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/checkout`,
                { items: cartItems },
                {
                    headers: {
                        'Authorization': `Bearer YOUR_USER_SANCTUM_TOKEN_HERE`,
                        'Accept': 'application/json'
                    }
                }
            );

            const { total_amount, order_reference } = response.data;

            // STEP B: Update our Paystack config with the OFFICIAL backend data
            const updatedConfig = {
                ...paystackConfig,
                amount: total_amount, // Paystack expects lowest denomination (e.g., pesewas)
                reference: order_reference,
            };
            
            setPaystackConfig(updatedConfig);

            // STEP C: Trigger the Paystack Popup
            // We pass the updated config directly to the initialize function to avoid state-lag
            initializePayment({
                config: updatedConfig,
                onSuccess: (reference) => {
                    console.log('Payment complete! Reference:', reference);
                    alert('Payment successful! Your order is being processed.');
                    // The backend Webhook is handling the actual database update, 
                    // so here you just redirect the user to a "Thank You" page.
                },
                onClose: () => {
                    console.log('User closed the payment modal.');
                    alert('Payment cancelled.');
                }
            });

        } catch (error: unknown) {
            const errorMessage = error instanceof axios.AxiosError 
                ? error.response?.data?.message || error.message 
                : error instanceof Error 
                ? error.message 
                : 'An unexpected error occurred';
            console.error('Checkout failed:', errorMessage);
            alert(errorMessage || 'Failed to initialize checkout.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-gray-800">Secure Checkout</h1>
                
                <div className="mb-6 border-b pb-4">
                    <p className="text-gray-600">Items in cart: {cartItems.length}</p>
                    {/* In a real app, map over cart items here to show names/quantities */}
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-4 rounded transition duration-200 disabled:opacity-50"
                >
                    {loading ? 'Preparing Secure Payment...' : 'Pay with Paystack'}
                </button>
            </div>
        </div>
    );
}