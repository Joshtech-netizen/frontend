'use client';

import { useState } from 'react';
import { usePaystackPayment } from 'react-paystack';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useCartStore } from '../../store/cartStore';


export default function CheckoutClient() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    
    // Pull data from Zustand
    const cartItems = useCartStore((state) => state.items);
    const clearCart = useCartStore((state) => state.clearCart);
    const removeItem = useCartStore((state) => state.removeItem);

    const [paystackConfig, setPaystackConfig] = useState({
        reference: '',
        email: 'client@demo.com', 
        amount: 0,
        publicKey: process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY as string,
    });

    const initializePayment = usePaystackPayment(paystackConfig);

    const formatPrice = (priceInPesewas: number) => {
        return new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(priceInPesewas / 100);
    };

    const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

    const handleCheckout = async () => {
        if (cartItems.length === 0) return;
        setLoading(true);

        try {
            const response = await axios.post(
                `${process.env.NEXT_PUBLIC_BACKEND_API_URL}/checkout`,
                { items: cartItems.map(item => ({ product_id: item.product_id, quantity: item.quantity })) },
                {
                    headers: {
                        // REPLACE THIS WITH YOUR TINKER TOKEN FOR THE DEMO
                        'Authorization': `Bearer 2|H219uK8gXCvULsQV25vsUNDp8CgxNkXOMJrJtkfw13586ee2`, 
                        'Accept': 'application/json'
                    }
                }
            );

            const { total_amount, order_reference } = response.data;

            const updatedConfig = {
                ...paystackConfig,
                amount: total_amount,
                reference: order_reference,
            };
            
            setPaystackConfig(updatedConfig);

            initializePayment({
                config: updatedConfig,
                onSuccess: (reference) => {
                    console.log('Payment complete! Reference:', reference);
                    clearCart(); // Empty the cart!
                    router.push('/success'); // Send them to the Thank You page
                },
                onClose: () => {
                    alert('Payment cancelled.');
                }
            });

        } catch (error: unknown) {
            console.error('Checkout failed:', error);
                        const errorMessage = axios.isAxiosError(error) && error.response?.data?.message 
                ? error.response.data.message 
                : 'Failed to initialize checkout.';
            alert(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    if (cartItems.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
                <h1 className="text-2xl font-bold mb-4">Your cart is empty</h1>
                <button onClick={() => router.push('/')} className="text-blue-600 hover:underline">Return to Store</button>
            </div>
        );
    }

    return (
        <div className="min-h-screen p-8 bg-gray-50 flex justify-center items-start pt-20">
            <div className="max-w-md w-full bg-white p-8 rounded-xl shadow-lg">
                <h1 className="text-2xl font-bold mb-6 text-gray-800 border-b pb-4">Order Summary</h1>
                
                <div className="space-y-4 mb-6">
                    {cartItems.map((item) => (
                        <div key={item.product_id} className="flex justify-between items-center">
                            <div>
                                <p className="font-semibold text-gray-800">{item.name}</p>
                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                            </div>
                            <div className="text-right">
                                <p className="font-bold">{formatPrice(item.price * item.quantity)}</p>
                                <button onClick={() => removeItem(item.product_id)} className="text-xs text-red-500 hover:underline">Remove</button>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="border-t pt-4 mb-8 flex justify-between items-center">
                    <span className="font-bold text-lg">Total</span>
                    <span className="font-black text-xl text-green-600">{formatPrice(cartTotal)}</span>
                </div>

                <button
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-4 px-4 rounded-lg transition duration-200 disabled:opacity-50"
                >
                    {loading ? 'Preparing Secure Payment...' : 'Pay Securely'}
                </button>
            </div>
        </div>
    );
}

