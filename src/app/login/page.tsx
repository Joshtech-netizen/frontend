'use client';

import { useState } from 'react';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function LoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const response = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/login`, {
                email,
                password,
            });

            // SECURITY: The backend verified the password and gave us a secure, temporary token.
            const { token, is_admin } = response.data;

            if (!is_admin) {
                setError('Access denied. Admin privileges required.');
                setLoading(false);
                return;
            }

            // Save the token securely in the browser's local storage
            localStorage.setItem('admin_token', token);
            
            // Redirect straight to the secure dashboard
            router.push('/admin');
            
        } catch (err: unknown) {
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Invalid email or password.');
            } else {
                setError('Invalid email or password.');
            }
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg border border-gray-100">
                
                <div className="text-center">
                    <div className="mx-auto h-12 w-12 bg-orange-500 rounded-lg flex items-center justify-center mb-4">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                    </div>
                    <h2 className="text-3xl font-extrabold text-gray-900">Admin Portal</h2>
                    <p className="mt-2 text-sm text-gray-600">Secure access for authorized personnel only.</p>
                </div>

                {error && (
                    <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
                        <p className="text-sm text-red-700 font-medium">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Email Address</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                                placeholder="admin@example.com"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-lg relative block w-full px-4 py-3 border border-gray-300 placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors"
                                placeholder="••••••••"
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-orange-500 hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50"
                    >
                        {loading ? 'Authenticating...' : 'Sign In to Dashboard'}
                    </button>
                </form>

                <div className="text-center mt-4">
                    <Link href="/" className="text-sm font-medium text-gray-500 hover:text-orange-500 transition-colors">
                        &larr; Return to Storefront
                    </Link>
                </div>
            </div>
        </div>
    );
}