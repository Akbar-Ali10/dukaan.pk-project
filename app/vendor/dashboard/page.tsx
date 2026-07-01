'use client'

import { useEffect, useState } from 'react'
import { LayoutDashboard, ShoppingBag, LogOut, Clock, Package, Plus, Trash2, Edit3, X, Layers, Upload, ImageIcon, Wallet, ArrowUpRight, Bell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
export const dynamic = 'force-dynamic';

interface Order {
  id: string
  order_number: string
  customer_name: string
  customer_phone: string
  total: number
  status: string
  created_at: string
  payment_method: string
}

interface Product {
  id: string
  name: string
  description: string
  price: number
  compare_at_price: number | null
  stock: number
  category: string
  status: string
  image_url: string
  brand: string
  weight: number | null
  weight_unit: string
  sizes: string[]
  colors: string[]
  variants: string[]
  vendor_id: string
}

export default function VendorDashboard() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'dashboard' | 'products' | 'orders'>('products')

  const [orders, setOrders] = useState<Order[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [realDbVendorId, setRealDbVendorId] = useState<string | null>(null)

  // Stats & Wallet Real-time Metrics
  const [totalOrders, setTotalOrders] = useState(0)
  const [pendingApprovals, setPendingApprovals] = useState(0)
  const [totalSales, setTotalSales] = useState(0)
  const [netEarnings, setNetEarnings] = useState(0) // 5% marketplace fee cut
  const [totalProducts, setTotalProducts] = useState(0)
  const [showNotification, setShowNotification] = useState(false)

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<Product | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)

  const [newProduct, setNewProduct] = useState({
    name: '', description: '', price: '', compare_at_price: '',
    stock: '', category: '', brand: '', weight: '',
    weight_unit: 'g', sizes: '', colors: '', variants: ''
  })
  const [formSubmitting, setFormSubmitting] = useState(false)

  useEffect(() => {
    checkUserAndFetch()
  }, [])

  // 🔥 Real-time Subscription Hook Setup
  useEffect(() => {
    if (!realDbVendorId) return

    // Listen to new orders incoming via order_items mapping
    const orderItemsSubscription = supabase
      .channel('vendor-live-orders')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'order_items', filter: `vendor_id=eq.${realDbVendorId}` },
        async (payload) => {
          // Play sound or alert vendor instantly
          setShowNotification(true)
          setTimeout(() => setShowNotification(false), 6000)

          // Re-trigger global dashboard data sync silently
          await fetchDashboardData(realDbVendorId)
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(orderItemsSubscription)
    }
  }, [realDbVendorId])

  const checkUserAndFetch = async () => {
    try {
      setLoading(true)
      const { data: { user }, error: userError } = await supabase.auth.getUser()

      if (userError || !user) {
        router.push('/vendor/login')
        return
      }

      const { data: vendorRow, error: vendorFetchError } = await supabase
        .from('vendors')
        .select('id')
        .eq('profile_id', user.id)
        .single()

      if (vendorFetchError || !vendorRow) {
        console.error('Vendor mapping error:', vendorFetchError)
        alert('Vendor profile database mein nahi mili.')
        return
      }

      setRealDbVendorId(vendorRow.id)
      await fetchDashboardData(vendorRow.id)
    } catch (error) {
      console.error('Session configuration error:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchDashboardData = async (vendorId: string) => {
    try {
      // 1. Fetch Products
      const { data: productsData, error: pError } = await supabase
        .from('products')
        .select('*')
        .eq('vendor_id', vendorId)
        .order('created_at', { ascending: false })

      if (!pError && productsData) {
        setProducts(productsData as Product[])
        setTotalProducts(productsData.length)
      }

      // 2. Fetch Orders via relational join mapping
      const { data: orderItemsData, error: oiError } = await supabase
        .from('order_items')
        .select(`
          order_id,
          vendor_id,
          orders (
            id,
            order_number,
            customer_name,
            customer_phone,
            total,
            status,
            created_at,
            payment_method
          )
        `)
        .eq('vendor_id', vendorId)

      if (oiError) {
        console.error("Order Items Query Error: ", oiError)
        return
      }

      if (orderItemsData) {
        const uniqueOrdersMap = new Map<string, Order>()

        orderItemsData.forEach((item: any) => {
          if (item.orders) {
            uniqueOrdersMap.set(item.orders.id, item.orders as Order)
          }
        })

        const uniqueOrders = Array.from(uniqueOrdersMap.values())
        uniqueOrders.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())

        setOrders(uniqueOrders)
        setTotalOrders(uniqueOrders.length)

        // Dynamic Counts
        const pending = uniqueOrders.filter(o => o.status === 'received' || o.status === 'pending').length
        setPendingApprovals(pending)

        // Wallet Calculations (Flat 5% platform deduction for dukaan.pk)
        const salesSum = uniqueOrders.reduce((sum, o) => o.status !== 'cancelled' ? sum + (Number(o.total) || 0) : sum, 0)
        setTotalSales(salesSum)
        setNetEarnings(salesSum * 0.95) // Vendor gets 95% of total sales revenue
      }
    } catch (error) {
      console.error('Data pull failure:', error)
    }
  }

  // 🔥 Smart Status Manager with Automated Stock Deductions
  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      // 1. Update order status mapping
      const { error: statusError } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (statusError) throw statusError;

      // 2. Agar status 'Confirmed' ho jaye, to stock deduct karein
      if (newStatus === 'Confirmed') {
        // Pehle order ke items fetch karein
        const { data: items, error: itemsError } = await supabase
          .from('order_items')
          .select('product_id, quantity')
          .eq('order_id', orderId);

        if (itemsError) throw itemsError;

        if (items && items.length > 0) {
          for (const item of items) {
            // Har product ka current stock fetch karein
            const { data: product, error: prodError } = await supabase
              .from('products')
              .select('stock')
              .eq('id', item.product_id)
              .single();

            if (prodError) throw prodError;

            const currentStock = product?.stock || 0;
            const newStock = Math.max(0, currentStock - item.quantity);

            // Stock update karein
            const { error: updateProdError } = await supabase
              .from('products')
              .update({ stock: newStock })
              .eq('id', item.product_id);

            if (updateProdError) throw updateProdError;
          }
        }
      }

      // Refresh data after successful update
      if (typeof fetchDashboardData === 'function') {
        // Agar aap ka dashboard data state refresh karne ka function upar majood hai
        // to yahan us ko call kar lein taake UI automatic update ho jaye.
        // fetchDashboardData(); 
      }

      alert(`Order status updated to ${newStatus} successfully!`);
    } catch (error) {
      console.error('Order status update error:', error);
      alert('Order status update karne mein masala aya hai.');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0])
    }
  }

  const openEditModal = (product: Product) => {
    setEditingProduct(product)
    setNewProduct({
      name: product.name,
      description: product.description || '',
      price: product.price.toString(),
      compare_at_price: product.compare_at_price ? product.compare_at_price.toString() : '',
      stock: product.stock.toString(),
      category: product.category || '',
      brand: product.brand || '',
      weight: product.weight ? product.weight.toString() : '',
      weight_unit: product.weight_unit || 'g',
      sizes: product.sizes ? product.sizes.join(', ') : '',
      colors: product.colors ? product.colors.join(', ') : '',
      variants: product.variants ? product.variants.join(', ') : ''
    })
    setIsModalOpen(true)
  }

  const handleAddProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newProduct.name || !newProduct.price || !newProduct.stock || !realDbVendorId) {
      alert('Required parameters are missing.')
      return
    }

    try {
      setFormSubmitting(true)
      let finalImageUrl = editingProduct ? editingProduct.image_url : '/placeholder.png'

      if (selectedFile) {
        setUploadingImage(true)
        const fileExt = selectedFile.name.split('.').pop()
        const fileName = `${Math.random()}-${Date.now()}.${fileExt}`
        const filePath = `products/${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, selectedFile)

        if (uploadError) throw uploadError

        const { data: publicUrlData } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        finalImageUrl = publicUrlData.publicUrl
        setUploadingImage(false)
      }

      const sizeArray = newProduct.sizes ? newProduct.sizes.split(',').map(s => s.trim()).filter(Boolean) : []
      const colorArray = newProduct.colors ? newProduct.colors.split(',').map(c => c.trim()).filter(Boolean) : []
      const variantArray = newProduct.variants ? newProduct.variants.split(',').map(v => v.trim()).filter(Boolean) : []
      const generatedSlug = newProduct.name.toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').trim() + '-' + Date.now()

      const productPayload = {
        name: newProduct.name,
        description: newProduct.description || 'No description provided.',
        price: Number(newProduct.price),
        compare_price: newProduct.compare_at_price ? Number(newProduct.compare_at_price) : null,
        stock: Number(newProduct.stock),
        category: newProduct.category || 'General',
        brand: newProduct.brand || 'No Brand',
        weight: newProduct.weight ? Number(newProduct.weight) : null,
        weight_unit: newProduct.weight ? newProduct.weight_unit : 'g',
        image_url: finalImageUrl,
        sizes: sizeArray,
        colors: colorArray,
        variants: variantArray,
        status: 'active'
      }

      if (editingProduct) {
        const { error } = await supabase.from('products').update(productPayload).eq('id', editingProduct.id)
        if (error) throw error
      } else {
        const { error } = await supabase.from('products').insert([{ ...productPayload, slug: generatedSlug, vendor_id: realDbVendorId }])
        if (error) throw error
      }

      setIsModalOpen(false)
      setEditingProduct(null)
      setSelectedFile(null)
      setNewProduct({
        name: '', description: '', price: '', compare_at_price: '',
        stock: '', category: '', brand: '', weight: '',
        weight_unit: 'g', sizes: '', colors: '', variants: ''
      })

      if (realDbVendorId) await fetchDashboardData(realDbVendorId)
    } catch (err: any) {
      alert(`Error context: ${err.message}`)
    } finally {
      setFormSubmitting(false)
      setUploadingImage(false)
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Kya aap is product ko delete karna chahte hain?')) {
      try {
        const { error } = await supabase.from('products').delete().eq('id', id)
        if (error) throw error
        if (realDbVendorId) await fetchDashboardData(realDbVendorId)
      } catch (err) {
        alert('Product handling delete failure.')
      }
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex font-sans antialiased text-slate-800">

      {/* 🔥 Real-Time Toast Alert Bar */}
      {showNotification && (
        <div className="fixed top-5 right-5 z-50 bg-emerald-600 text-white font-bold px-5 py-3 rounded-xl shadow-2xl flex items-center gap-3 border border-emerald-500 animate-bounce">
          <Bell className="w-5 h-5 text-white animate-spin" />
          <span>Aho! Naya Order received ho gaya hai (Realtime)!</span>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col justify-between p-5 shadow-sm">
        <div className="space-y-7">
          <div>
            <h1 className="text-2xl font-black tracking-tight text-blue-600">dukaan.pk</h1>
            <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Vendor Management Console</span>
          </div>
          <nav className="space-y-1.5">
            <button onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'dashboard' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <LayoutDashboard className="w-4.5 h-4.5" /> Overview Summary
            </button>
            <button onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'products' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <Package className="w-4.5 h-4.5" /> Product Manager
            </button>
            <button onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-bold text-sm tracking-wide transition-all ${activeTab === 'orders' ? 'bg-blue-50 text-blue-600' : 'text-slate-600 hover:bg-slate-50'}`}>
              <ShoppingBag className="w-4.5 h-4.5" /> Live Orders
            </button>
          </nav>
        </div>
        <button onClick={async () => { await supabase.auth.signOut(); router.push('/vendor/login'); }}
          className="flex items-center gap-3 px-3.5 py-2.5 text-rose-600 hover:bg-rose-50 rounded-xl font-bold text-sm transition-all">
          <LogOut className="w-4.5 h-4.5" /> Terminate Session
        </button>
      </aside>

      {/* Main Container */}
      <main className="flex-1 p-6 md:p-8 max-w-7xl mx-auto w-full overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">
              {activeTab === 'products' ? 'Product Catalog' : activeTab === 'orders' ? 'Orders Processing' : 'Business Insights'}
            </h1>
            <p className="text-xs text-slate-500 mt-1">Live infrastructure connected to secure database protocols.</p>
          </div>
          <div className="flex items-center gap-3">
            {activeTab === 'products' && (
              <button onClick={() => { setEditingProduct(null); setIsModalOpen(true); }}
                className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-sm shadow-blue-200">
                <Plus className="w-4 h-4" /> Add New Item
              </button>
            )}
          </div>
        </div>

        {/* Dynamic Financial Wallet & Info Summary Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Gross Pipeline</p><p className="text-2xl font-black text-slate-900 mt-1">{loading ? '...' : totalOrders} Orders</p></div>
            <div className="p-3 rounded-xl text-blue-600 bg-blue-50"><ShoppingBag className="w-5 h-5" /></div>
          </div>
          <div className="bg-white p-6 border border-slate-200 rounded-2xl flex items-center justify-between shadow-sm">
            <div><p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Action Required</p><p className="text-2xl font-black text-amber-600 mt-1">{loading ? '...' : pendingApprovals} Pending</p></div>
            <div className="p-3 rounded-xl text-amber-600 bg-amber-50"><Clock className="w-5 h-5" /></div>
          </div>

          {/* 🔥 Wallet Integration Section UI */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 p-6 rounded-2xl flex flex-col justify-between shadow-md text-white sm:col-span-2 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              <Wallet className="w-32 h-32 text-white" />
            </div>
            <div className="flex items-center justify-between z-10">
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Net Earnings (95%)</p>
                <p className="text-3xl font-black tracking-tight text-emerald-400 mt-1">Rs. {loading ? '...' : netEarnings.toLocaleString()}</p>
              </div>
              <div className="p-2.5 bg-white/10 rounded-xl text-white"><Wallet className="w-5 h-5" /></div>
            </div>
            <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 z-10">
              <span>Gross Sales: Rs. {totalSales.toLocaleString()}</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                5% Platform Cut Appled <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="py-20 text-center font-bold text-slate-400 text-sm tracking-wider animate-pulse">⚡ LOADING ENGINES & POOLING REAL-TIME SOCKETS...</div>
        ) : (
          <>
            {/* Orders Component Section */}
            {(activeTab === 'dashboard' || activeTab === 'orders') && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-base">Incoming Channels & Lifecycle Routing</div>
                {orders.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">No synchronized client transactional orders identified.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-bold tracking-wider uppercase border-b border-slate-100">
                          <th className="p-4">Order Ref</th>
                          <th className="p-4">Customer Route</th>
                          <th className="p-4">Total Price</th>
                          <th className="p-4">Workflow Engine Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium">
                        {orders.map(order => (
                          <tr key={order.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-mono text-xs font-bold text-blue-600">{order.order_number}</td>
                            <td className="p-4">
                              <div className="font-bold text-slate-900">{order.customer_name}</div>
                              <div className="text-xs text-slate-400 font-mono mt-0.5">{order.customer_phone}</div>
                            </td>
                            <td className="p-4 font-black text-slate-900">Rs. {Number(order.total).toLocaleString()}</td>
                            <td className="p-4">
                              <select value={order.status}
                                onChange={(e) => handleStatusChange(order.id, e.target.value)}
                                className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${order.status === 'received' ? 'bg-amber-50 text-amber-700 border-amber-200' :
                                    order.status === 'confirmed' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                      order.status === 'delivered' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-slate-50 text-slate-700'
                                  }`}>
                                <option value="received">received</option>
                                <option value="confirmed">confirmed (De-stock Item)</option>
                                <option value="dispatched">dispatched</option>
                                <option value="delivered">delivered</option>
                                <option value="cancelled">cancelled</option>
                              </select>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* Catalog Grid/Table Block */}
            {activeTab === 'products' && (
              <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
                <div className="p-5 border-b border-slate-100 font-bold text-slate-900 text-base">Active Registered SKU Catalog</div>
                {products.length === 0 ? (
                  <div className="p-12 text-center text-slate-400 text-sm">Inventory directory empty. Boot first node item to begin.</div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-slate-50/70 text-slate-500 text-[11px] font-bold tracking-wider uppercase border-b border-slate-100">
                          <th className="p-4">Sku Details</th>
                          <th className="p-4">Brand Node</th>
                          <th className="p-4">Stock Availability</th>
                          <th className="p-4">Unit Pricing</th>
                          <th className="p-4 text-center">Operation Control</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm font-medium">
                        {products.map(product => (
                          <tr key={product.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 flex items-center gap-3 font-bold text-slate-900">
                              <img src={product.image_url || '/placeholder.png'}
                                className="w-11 h-11 object-cover rounded-xl border border-slate-200 shadow-inner" alt={product.name} />
                              <div>
                                <span className="block">{product.name}</span>
                                <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded mt-1 inline-block">{product.category}</span>
                              </div>
                            </td>
                            <td className="p-4 text-slate-500 font-semibold">{product.brand || 'Generic Node'}</td>
                            <td className="p-4">
                              <span className={`font-mono text-xs font-bold px-2 py-1 rounded-md ${product.stock <= 5 ? 'bg-rose-50 text-rose-600 border border-rose-100' : 'bg-slate-100 text-slate-700'}`}>
                                {product.stock} units left
                              </span>
                            </td>
                            <td className="p-4 font-black text-slate-900">Rs. {Number(product.price).toLocaleString()}</td>
                            <td className="p-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                <button onClick={() => openEditModal(product)}
                                  className="p-2 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all">
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDeleteProduct(product.id)}
                                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-all">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* Add / Edit Product Modal Architecture */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden border border-slate-100">
            <div className="p-5 border-b flex items-center justify-between bg-slate-50/50">
              <h3 className="font-bold text-slate-900 text-base">
                {editingProduct ? 'Modify Virtual Asset Parameters' : 'Register New Inventory Asset'}
              </h3>
              <button onClick={() => { setIsModalOpen(false); setEditingProduct(null); }} className="p-1.5 text-slate-400 hover:bg-slate-200/70 rounded-xl transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddProductSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Product Title *</label>
                <input type="text" required placeholder="e.g. Premium Cotton Kurta"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium" />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Description</label>
                <textarea rows={3} placeholder="Product ke baare mein tafseel se likhein..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-medium resize-none" />
              </div>

              {/* Upload Drop Area */}
              <div className="p-4 border-2 border-dashed border-slate-200 rounded-xl bg-slate-50/50 flex flex-col items-center justify-center relative hover:bg-slate-50 transition-all cursor-pointer">
                <input type="file" accept="image/*" onChange={handleFileChange} className="absolute inset-0 opacity-0 cursor-pointer w-full h-full" />
                <div className="text-center pointer-events-none">
                  {selectedFile ? (
                    <div className="flex flex-col items-center gap-1 text-blue-600 font-bold text-xs">
                      <ImageIcon className="w-6 h-6 mb-1" />
                      <span>{selectedFile.name}</span>
                    </div>
                  ) : editingProduct ? (
                    <div className="flex flex-col items-center gap-1 text-slate-500 text-xs font-semibold">
                      <img src={editingProduct.image_url} className="w-14 h-14 object-cover rounded-xl border mb-1" />
                      <span>Click to swap asset image</span>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-6 h-6 mx-auto text-slate-400 mb-1" />
                      <p className="text-xs font-bold text-slate-600">Select Item Graphic Asset</p>
                    </>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Retail Price *</label>
                  <input type="number" required placeholder="PKR"
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Cut Price</label>
                  <input type="number" placeholder="PKR"
                    value={newProduct.compare_at_price}
                    onChange={(e) => setNewProduct({ ...newProduct, compare_at_price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Initial Stock *</label>
                  <input type="number" required placeholder="Units"
                    value={newProduct.stock}
                    onChange={(e) => setNewProduct({ ...newProduct, stock: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-mono" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Category Node</label>
                  <input type="text" placeholder="Apparel"
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">Brand Node</label>
                  <input type="text" placeholder="Self Brand"
                    value={newProduct.brand}
                    onChange={(e) => setNewProduct({ ...newProduct, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none font-medium" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 bg-blue-50/50 p-3.5 rounded-xl border border-blue-100/50">
                <div className="col-span-2">
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1">Logistics Net Weight</label>
                  <input type="number" placeholder="Value"
                    value={newProduct.weight}
                    onChange={(e) => setNewProduct({ ...newProduct, weight: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white font-mono" />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase tracking-wider text-blue-900 mb-1">Scale Unit</label>
                  <select value={newProduct.weight_unit}
                    onChange={(e) => setNewProduct({ ...newProduct, weight_unit: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm outline-none bg-white font-bold">
                    <option value="g">g</option>
                    <option value="kg">kg</option>
                    <option value="ml">ml</option>
                    <option value="ltr">Ltr</option>
                  </select>
                </div>
              </div>

              <div className="space-y-3 p-3.5 bg-slate-50 rounded-xl border border-slate-200/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-slate-400" /> Matrix Configuration Attributes (Comma Separated)
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Sizes</label>
                    <input type="text" placeholder="S, M" value={newProduct.sizes}
                      onChange={(e) => setNewProduct({ ...newProduct, sizes: e.target.value })}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Colors</label>
                    <input type="text" placeholder="Black" value={newProduct.colors}
                      onChange={(e) => setNewProduct({ ...newProduct, colors: e.target.value })}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white font-medium" />
                  </div>
                  <div>
                    <label className="block text-[9px] font-bold text-slate-400 mb-0.5">Variants</label>
                    <input type="text" placeholder="Pack of 2" value={newProduct.variants}
                      onChange={(e) => setNewProduct({ ...newProduct, variants: e.target.value })}
                      className="w-full px-2.5 py-2 border border-slate-200 rounded-lg text-xs outline-none bg-white font-medium" />
                  </div>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t sticky bottom-0 bg-white">
                <button type="button" onClick={() => { setIsModalOpen(false); setEditingProduct(null); }}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-bold uppercase tracking-wider rounded-xl hover:bg-slate-50 transition-colors">
                  Cancel
                </button>
                <button type="submit" disabled={formSubmitting || uploadingImage}
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold uppercase tracking-wider rounded-xl transition-all disabled:opacity-50">
                  {formSubmitting ? 'Syncing Schema...' : editingProduct ? 'Commit Modification' : 'Deploy To Production'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}