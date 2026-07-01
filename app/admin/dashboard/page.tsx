'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Users, Trash2, RefreshCw, BarChart3, ShieldCheck, Lock, LogOut, Percent, ArrowUpRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface Order {
  id: string; order_number: string; customer_name: string; total: number; status: string; created_at: string;
}
interface Product {
  id: string; name: string; price: number; stock: number; category: string; image_url: string;
}
interface Vendor {
  id: string;
  business_name: string;
  business_description: string;
  created_at: string;
  profile_id?: string;
  owner_name?: string; // Stitched text data
  email?: string;      // Stitched text data
}
interface VendorStats {
  vendor_id: string; vendor_name: string; store_name: string; total_sales: number; admin_commission: number; vendor_net: number;
}

export default function AdminDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'vendors' | 'payouts'>('overview')
  const [loading, setLoading] = useState(true)

  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [vendors, setVendors] = useState<Vendor[]>([])
  const [vendorList, setVendorList] = useState<VendorStats[]>([])

  const [totalSales, setTotalSales] = useState(0)
  const [totalAdminEarnings, setTotalAdminEarnings] = useState(0)
  const [totalOrders, setTotalOrders] = useState(0)
  const [totalProducts, setTotalProducts] = useState(0)
  const [totalVendors, setTotalVendors] = useState(0)

  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isAdminLoggedIn')
    if (isLoggedIn !== 'true') {
      router.push('/admin/login')
    } else {
      fetchAdminData()
    }
  }, [])

  const fetchAdminData = async () => {
    try {
      setLoading(true)
      const { data: ordersData } = await supabase.from('orders').select('*').order('created_at', { ascending: false })
      const { data: productsData } = await supabase.from('products').select('*').order('created_at', { ascending: false })
      
      // ✅ Safe Alag Queries Engine (No complex joins required)
      const { data: rawVendors } = await supabase.from('vendors').select('*').order('created_at', { ascending: false })
      const { data: rawProfiles } = await supabase.from('profiles').select('id, full_name, email')

      const { data: orderItems } = await supabase.from('order_items').select('*')

      if (ordersData) {
        setOrders(ordersData as Order[])
        setTotalOrders(ordersData.length)
        const totalGross = ordersData.reduce((sum, o) => sum + (Number(o.total) || 0), 0)
        setTotalSales(totalGross)
        setTotalAdminEarnings(totalGross * 0.05)
      }

      if (productsData) {
        setProducts(productsData as Product[])
        setTotalProducts(productsData.length)
      }

      // ✅ Stitched Vendors Array Builder
      if (rawVendors) {
        const stitchedVendors = rawVendors.map((v: any) => {
          // Profiles map check logic matching profile_id
          const matchedProfile = rawProfiles?.find(p => p.id === v.profile_id);
          return {
            ...v,
            owner_name: matchedProfile?.full_name || 'Vendor Partner',
            email: matchedProfile?.email || 'N/A'
          }
        })
        setVendors(stitchedVendors)
        setTotalVendors(stitchedVendors.length)
      }

      // --- Split Ledger Calculation Engine ---
      const vendorMap: { [key: string]: VendorStats } = {}
      if (orderItems && rawVendors) {
        orderItems.forEach((item: any) => {
          const vId = item.vendor_id
          if (!vId) return

          const currentVendor = rawVendors.find((v: any) => v.id === vId)
          const matchedProfile = rawProfiles?.find(p => p.id === currentVendor?.profile_id)

          // ✅ Fixed Pricing Logic Check (Handling both total_price, price, or unit_price)
          const itemPrice = Number(item.total_price) || Number(item.price) || Number(item.unit_price) || 0
          const itemQuantity = Number(item.quantity) || 1
          
          const itemTotal = itemPrice * itemQuantity
          const itemAdminCut = itemTotal * 0.05
          const itemNet = itemTotal - itemAdminCut

          if (!vendorMap[vId]) {
            vendorMap[vId] = {
              vendor_id: vId,
              vendor_name: matchedProfile?.full_name || 'Vendor Owner',
              store_name: currentVendor?.business_name || 'Unnamed Store',
              total_sales: 0,
              admin_commission: 0,
              vendor_net: 0
            }
          }
          vendorMap[vId].total_sales += itemTotal
          vendorMap[vId].admin_commission += itemAdminCut
          vendorMap[vId].vendor_net += itemNet
        })
      }
      setVendorList(Object.values(vendorMap))

    } catch (error) {
      console.error('Data collection pipeline error:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAdminDeleteProduct = async (id: string) => {
    if (confirm('Kya aap ba-haiseat ADMIN is product ko delete karna chahte hain?')) {
      await supabase.from('products').delete().eq('id', id)
      fetchAdminData()
    }
  }

  const handleAdminStatusChange = async (orderId: string, newStatus: string) => {
    await supabase.from('orders').update({ status: newStatus }).eq('id', orderId)
    fetchAdminData()
  }

  const handleLogout = () => {
    localStorage.removeItem('isAdminLoggedIn')
    router.push('/admin/login')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-slate-400 gap-3 font-mono text-xs">
        <RefreshCw className="w-6 h-6 text-emerald-400 animate-spin" />
        <span>Loading Marketplace Data...</span>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col justify-between p-5">
        <div className="space-y-6">
          <div className="px-2 py-1 flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-emerald-400" />
            <div>
              <h1 className="text-xl font-black tracking-tight text-white">dukaan.pk</h1>
              <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider">Super Admin Panel</p>
            </div>
          </div>

          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('overview')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'overview' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><BarChart3 className="w-4 h-4" /> Platform Overview</button>
            <button onClick={() => setActiveTab('products')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'products' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><Package className="w-4 h-4" /> Global Products</button>
            <button onClick={() => setActiveTab('orders')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'orders' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><ShoppingBag className="w-4 h-4" /> Global Orders</button>
            <button onClick={() => setActiveTab('vendors')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'vendors' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><Users className="w-4 h-4" /> Active Vendors</button>
            <button onClick={() => setActiveTab('payouts')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${activeTab === 'payouts' ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:bg-slate-900 hover:text-white'}`}><Percent className="w-4 h-4" /> Payout Routing</button>
          </nav>
        </div>

        <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 mt-4 rounded-lg text-sm font-semibold text-red-400 hover:bg-red-500/10 transition-all cursor-pointer">
          <LogOut className="w-4 h-4" /> Logout Admin
        </button>
      </aside>

      {/* Main Content Workspace */}
      <main className="flex-1 p-8 overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-black tracking-tight text-white">
              {activeTab === 'overview' && 'System Control Overview'}
              {activeTab === 'products' && 'All Marketplace Products'}
              {activeTab === 'orders' && 'All Marketplace Orders'}
              {activeTab === 'vendors' && 'Registered Platform Vendors'}
              {activeTab === 'payouts' && 'Ecosystem Vendor Ledger'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">Website ki poori live activity yahan se manage ho rahi hai.</p>
          </div>
          <button onClick={fetchAdminData} className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg border border-slate-700 transition-all"><RefreshCw className="w-3.5 h-3.5" /> Reload Stats</button>
        </div>

        {/* Counter Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-5 mb-8">
          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-black text-white mt-1">Rs. {totalSales.toLocaleString()}</p>
              <span className="text-[10px] font-bold text-emerald-400 block mt-0.5">Cut (5%): Rs. {totalAdminEarnings.toLocaleString()}</span>
            </div>
            <div className="p-3 rounded-lg text-emerald-400 bg-emerald-500/10"><BarChart3 className="w-5 h-5" /></div>
          </div>
          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Orders</p><p className="text-2xl font-black text-white mt-1">{totalOrders}</p></div><div className="p-3 rounded-lg text-blue-400 bg-blue-500/10"><ShoppingBag className="w-5 h-5" /></div></div>
          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Live Products</p><p className="text-2xl font-black text-white mt-1">{totalProducts}</p></div><div className="p-3 rounded-lg text-purple-400 bg-purple-500/10"><Package className="w-5 h-5" /></div></div>
          <div className="bg-slate-950 p-5 border border-slate-800 rounded-xl flex items-center justify-between"><div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Vendors</p><p className="text-2xl font-black text-white mt-1">{totalVendors}</p></div><div className="p-3 rounded-lg text-amber-400 bg-amber-500/10"><Users className="w-5 h-5" /></div></div>
        </div>

        {/* Dynamic Components Layout Mapping */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 font-bold text-white text-sm bg-slate-900/50">Latest Added Products</div>
              <div className="p-2 divide-y divide-slate-900 text-xs">
                {products.slice(0, 5).map(p => (
                  <div key={p.id} className="p-3 flex items-center justify-between hover:bg-slate-900/40">
                    <span className="font-semibold text-slate-200">{p.name}</span>
                    <span className="font-bold font-mono text-emerald-400">Rs. {p.price}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
              <div className="p-4 border-b border-slate-800 font-bold text-white text-sm bg-slate-900/50">Latest Marketplace Orders</div>
              <div className="p-2 divide-y divide-slate-900 text-xs">
                {orders.slice(0, 5).map(o => (
                  <div key={o.id} className="p-3 flex items-center justify-between hover:bg-slate-900/40">
                    <div>
                      <p className="font-bold text-slate-200 font-mono">{o.order_number}</p>
                      <p className="text-[10px] text-slate-500">{o.customer_name}</p>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{o.status}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider"><th className="p-4">Product Info</th><th className="p-4">Category</th><th className="p-4">Stock Status</th><th className="p-4">Price</th><th className="p-4 text-center">System Action</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {products.map(product => (
                  <tr key={product.id} className="hover:bg-slate-900/30">
                    <td className="p-4 flex items-center gap-3 font-semibold text-slate-100">
                      <img src={product.image_url || '/placeholder.png'} className="w-9 h-9 object-cover rounded-lg border border-slate-800 bg-slate-900" />
                      {product.name}
                    </td>
                    <td className="p-4 text-slate-400">{product.category || 'General'}</td>
                    <td className="p-4 font-mono font-bold text-emerald-400">{product.stock || 0} left</td>
                    <td className="p-4 font-mono font-bold text-slate-100">Rs. {Number(product.price).toLocaleString()}</td>
                    <td className="p-4 text-center">
                      <button onClick={() => handleAdminDeleteProduct(product.id)} className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg"><Trash2 className="w-4 h-4 mx-auto" /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider"><th className="p-4">Order Number</th><th className="p-4">Customer</th><th className="p-4">Total Price</th><th className="p-4">Current Status</th><th className="p-4">Override Status</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {orders.map(order => (
                  <tr key={order.id} className="hover:bg-slate-900/30">
                    <td className="p-4 font-mono font-bold text-emerald-400">{order.order_number}</td>
                    <td className="p-4 font-semibold text-slate-200">{order.customer_name}</td>
                    <td className="p-4 font-mono font-bold text-white">Rs. {Number(order.total).toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>{order.status}</span>
                    </td>
                    <td className="p-4">
                      <select value={order.status} onChange={(e) => handleAdminStatusChange(order.id, e.target.value)} className="px-2 py-1 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded outline-none font-semibold cursor-pointer">
                        <option value="received">received</option><option value="shipped">shipped</option><option value="delivered">delivered</option><option value="cancelled">cancelled</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ✅ Robust Active Vendors Table Section */}
        {activeTab === 'vendors' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                  <th className="p-4">Shop / Store Name</th>
                  <th className="p-4">Owner Name</th>
                  <th className="p-4">Email Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-900">
                {vendors.map(vendor => (
                  <tr key={vendor.id} className="hover:bg-slate-900/30">
                    <td className="p-4 font-bold text-white">
                      {vendor.business_name || 'Unnamed Store'}
                    </td>
                    <td className="p-4 font-semibold text-slate-200">
                      {vendor.owner_name}
                    </td>
                    <td className="p-4 font-mono text-slate-400">
                      {vendor.email}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* 🚀 Payout Routing Ledger */}
        {activeTab === 'payouts' && (
          <div className="bg-slate-950 border border-slate-800 rounded-xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 bg-slate-900/40">
              <h3 className="font-bold text-sm text-white">Ecosystem Vendor Ledger & Split-Payout System</h3>
              <p className="text-[11px] text-slate-400 mt-0.5">Automatic 5% Commission engine tracking split values per node vendor account.</p>
            </div>
            {vendorList.length === 0 ? (
              <div className="p-8 text-center text-slate-500 font-medium text-xs">
                Filhal kisi vendor node par sales pipeline zero hai.
              </div>
            ) : (
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-900 text-slate-400 font-bold border-b border-slate-800 uppercase tracking-wider">
                    <th className="p-4">Merchant / Store Identity</th>
                    <th className="p-4">Gross Vol</th>
                    <th className="p-4 text-emerald-400">Admin Cut (5%)</th>
                    <th className="p-4 text-blue-400">Vendor Net Payout (95%)</th>
                    <th className="p-4 text-center">Settlement</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900">
                  {vendorList.map((vendor) => (
                    <tr key={vendor.vendor_id} className="hover:bg-slate-900/30">
                      <td className="p-4">
                        <div className="font-bold text-white">{vendor.store_name}</div>
                        <div className="text-[10px] text-slate-500 mt-0.5">Owner: {vendor.vendor_name}</div>
                      </td>
                      <td className="p-4 font-semibold text-slate-300">Rs. {vendor.total_sales.toLocaleString()}</td>
                      <td className="p-4 font-black text-emerald-400 bg-emerald-500/5">Rs. {vendor.admin_commission.toLocaleString()}</td>
                      <td className="p-4 font-black text-blue-400 bg-blue-500/5">Rs. {vendor.vendor_net.toLocaleString()}</td>
                      <td className="p-4 text-center">
                        <button
                          onClick={() => alert(`Initiating batch clearing sequence of Rs. ${vendor.vendor_net.toLocaleString()} for ${vendor.store_name}`)}
                          className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-[10px] font-bold uppercase rounded tracking-wider transition-all flex items-center gap-1 mx-auto"
                        >
                          Clear Net <ArrowUpRight className="w-3 h-3" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </main>
    </div>
  )
}