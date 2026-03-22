'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

interface OrderItem { id: number; quantity: number; unit_price: number; product: { name: string; }; }
interface Order { id: number; reference: string; total_amount: number; status: string; created_at: string; user: { name: string; email: string; }; items: OrderItem[]; }

export default function AdminDashboard() {
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<'orders' | 'addProduct'>('orders');
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [productName, setProductName] = useState('');
    const [productDescription, setProductDescription] = useState('');
    const [productPrice, setProductPrice] = useState('');
    const [productStock, setProductStock] = useState('');
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Dynamic Token Helper
    const getToken = () => localStorage.getItem('admin_token');

    useEffect(() => {
        // SECURITY GATE: If there is no token in the browser, instantly kick them to login.
        if (!getToken()) {
            router.push('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/orders`, {
                    headers: { 'Authorization': `Bearer ${getToken()}`, 'Accept': 'application/json' }
                });
                setOrders(response.data);
            } catch (err: unknown) {
                if (axios.isAxiosError(err) && (err.response?.status === 401 || err.response?.status === 403)) {
                    localStorage.removeItem('admin_token'); // Clear invalid token
                    router.push('/login'); // Kick them out
                } else {
                    setError("Failed to load dashboard data.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [router]);

    const handleLogout = async () => {
        try {
            // Tell the backend to destroy the token
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/logout`, {}, {
                headers: { 'Authorization': `Bearer ${getToken()}` }
            });
        } catch (e) {
            console.error(e);
        } finally {
            // Delete it from the browser and kick them to login
            localStorage.removeItem('admin_token');
            router.push('/login');
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) { setImageFile(file); setImagePreview(URL.createObjectURL(file)); }
    };

    const handleAddProduct = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        const priceInPesewas = Math.round(parseFloat(productPrice) * 100);
        const formData = new FormData();
        formData.append('name', productName);
        formData.append('description', productDescription);
        formData.append('price', priceInPesewas.toString());
        formData.append('stock_quantity', productStock);
        if (imageFile) formData.append('image', imageFile);

        try {
            await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_API_URL}/admin/products`, formData, {
                headers: { 'Authorization': `Bearer ${getToken()}` } 
            });
            alert('Product added successfully!');
            setProductName(''); setProductDescription(''); setProductPrice(''); setProductStock(''); setImageFile(null); setImagePreview(null);
            setActiveTab('orders');
        } catch (error) {
            console.error('Failed to add product:', error);
            alert('Failed to add product.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const formatPrice = (priceInPesewas: number) => new Intl.NumberFormat('en-GH', { style: 'currency', currency: 'GHS' }).format(priceInPesewas / 100);
    const formatDate = (dateString: string) => new Date(dateString).toLocaleDateString('en-GH', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-500 font-semibold">Verifying Secure Access...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            <div className="max-w-6xl mx-auto">
                {/* Header with Logout Button */}
                <div className="flex justify-between items-center mb-8 border-b pb-4">
                    <h1 className="text-3xl font-extrabold text-gray-900">Control Panel</h1>
                    <div className="flex space-x-4">
                        <Link href="/" target="_blank" className="text-sm font-semibold bg-white border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition text-gray-700">
                            View Live Store
                        </Link>
                        <button onClick={handleLogout} className="text-sm font-bold bg-red-50 text-red-600 px-4 py-2 rounded-lg hover:bg-red-100 transition">
                            Log Out
                        </button>
                    </div>
                </div>

                {/* Dashboard Navigation Tabs */}
                <div className="flex space-x-4 mb-6 border-b border-gray-200 pb-2">
                    <button onClick={() => setActiveTab('orders')} className={`pb-2 px-1 font-semibold text-sm transition-colors ${activeTab === 'orders' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-900'}`}>Recent Orders</button>
                    <button onClick={() => setActiveTab('addProduct')} className={`pb-2 px-1 font-semibold text-sm transition-colors ${activeTab === 'addProduct' ? 'border-b-2 border-orange-500 text-orange-500' : 'text-gray-500 hover:text-gray-900'}`}>+ Add New Product</button>
                </div>

                {/* TAB CONTENT: Orders List */}
                {activeTab === 'orders' && (
                    <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                                <thead className="bg-gray-50">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Order ID</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Customer</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Amount</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Status</th>
                                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">Date</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {orders.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-500">No orders yet.</td></tr>
                                    ) : (
                                        orders.map((order) => (
                                            <tr key={order.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-medium text-gray-900">{order.reference}</div>
                                                    <div className="text-xs text-gray-500">{order.items.length} items</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm text-gray-900 font-medium">{order.user.name}</div>
                                                    <div className="text-sm text-gray-500">{order.user.email}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="text-sm font-black text-gray-900">{formatPrice(order.total_amount)}</div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 inline-flex text-xs leading-5 font-black rounded-full ${order.status === 'paid' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                                        {order.status.toUpperCase()}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                    {formatDate(order.created_at)}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* TAB CONTENT: Add New Product Form */}
                {activeTab === 'addProduct' && (
                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 md:p-8 max-w-3xl">
                        <h2 className="text-xl font-bold text-gray-900 mb-6 border-b pb-4">Create New Product</h2>
                        <form onSubmit={handleAddProduct} className="space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Product Name</label>
                                    <input required type="text" placeholder="Enter product name" value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Price (GHS)</label>
                                    <input required type="number" step="0.01" min="0" placeholder="Enter price in GHS" value={productPrice} onChange={(e) => setProductPrice(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Initial Stock</label>
                                    <input required type="number" min="0" placeholder="Enter stock quantity" value={productStock} onChange={(e) => setProductStock(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
                                    <textarea required rows={4} placeholder="Enter product description" value={productDescription} onChange={(e) => setProductDescription(e.target.value)} className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-orange-500 outline-none transition" />
                                </div>
                                <div className="sm:col-span-2 border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition cursor-pointer relative">
                                    <input type="file" accept="image/*" onChange={handleImageChange} title="Upload product image" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                                    {imagePreview ? (
                                        <div className="flex flex-col items-center"><Image src={imagePreview} alt="Preview" width={160} height={160} className="h-40 object-cover rounded-lg shadow-sm mb-4" /><span className="text-sm font-medium text-orange-600">Click to change image</span></div>
                                    ) : (
                                        <div className="flex flex-col items-center text-gray-500"><p className="font-semibold text-sm">Upload Product Image</p></div>
                                    )}
                                </div>
                            </div>
                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button type="submit" disabled={isSubmitting} className="bg-orange-500 text-white font-bold py-3 px-8 rounded-lg hover:bg-orange-600 transition disabled:opacity-50">
                                    {isSubmitting ? 'Saving...' : 'Save Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}