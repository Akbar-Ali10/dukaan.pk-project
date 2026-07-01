'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/pagination';
import { ShoppingCart, MessageCircle, ChevronLeft, Star, Heart, Share2, ShieldCheck, Truck, RotateCcw } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useCart } from '@/lib/cart-context';
import Header from '@/components/Header';
import TrustBar from '@/components/TrustBar';
import Link from 'next/link';

type StockStatus = 'in-stock' | 'low-stock' | 'out-of-stock';

interface ProductData {
  id: string;
  name: string;
  price: number;
  originalPrice: number;
  images: string[];
  status: StockStatus;
  stock: number;
  rating: number;
  reviews: number;
  description: string;
  vendor_id: string | null;
}

export default function ProductDetail() {
  const params = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const productId = params.id as string;

  const [product, setProduct] = useState<ProductData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [isFavorited, setIsFavorited] = useState(false);

  useEffect(() => {
    const fetchProduct = async () => {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', productId)
        .single();

      if (error || !data) {
        console.error('Product fetch error:', error);
        setIsLoading(false);
        return;
      }

      const stockStatus: StockStatus =
        data.status === 'out_of_stock'
          ? 'out-of-stock'
          : data.stock <= 4
          ? 'low-stock'
          : 'in-stock';

      setProduct({
        id: data.id,
        name: data.name,
        price: data.price,
        originalPrice: data.compare_price || Math.round(data.price * 1.3),
        images: data.image_url ? [data.image_url] : ['https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=375&fit=crop'],
        status: stockStatus,
        stock: data.stock,
        rating: 4.8,
        reviews: 14,
        description: data.description || 'Premium quality product available with Cash on Delivery all over Pakistan.',
        vendor_id: data.vendor_id || null,
      });
      setIsLoading(false);
    }

    if (productId) fetchProduct();
  }, [productId]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#1D4ED8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 tracking-wide uppercase">Product Load Ho Raha Hai...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-4">
        <div className="text-center max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
          <p className="text-4xl mb-3">😕</p>
          <h2 className="text-lg font-black text-slate-900 mb-1">Product Nahi Mila</h2>
          <button 
            onClick={() => router.back()} 
            className="w-full py-2.5 bg-[#1D4ED8] text-white text-xs font-bold rounded-xl"
          >
            Wapas Jaayein
          </button>
        </div>
      </div>
    );
  }

  const stockStatus = product.status;
  const discount = product.originalPrice > product.price
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
      vendor_id: product.vendor_id,
    }, quantity);
  };

  const handleBuyNow = () => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images[0],
      stock: product.stock,
      vendor_id: product.vendor_id,
    }, quantity);
    router.push('/checkout');
  };

  const incrementQuantity = () => {
    if (stockStatus !== 'out-of-stock') {
      setQuantity((prev) => (prev < product.stock ? prev + 1 : prev));
    }
  };

  const decrementQuantity = () => {
    setQuantity((prev) => (prev > 1 ? prev - 1 : prev));
  };

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent(
      `Assalam-o-Alaikum! Mujhe is product ke baare mein mazeed janna hai:\n\n*Product:* ${product.name}\n*Price:* Rs. ${product.price.toLocaleString()}`
    );
    window.open(`https://wa.me/923001234567?text=${message}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] antialiased text-slate-800 pb-24 md:pb-0 font-sans tracking-normal">
      
      {/* Real Real-Time Header System */}
      <Header />
      <TrustBar />

      {/* Mini Breadcrumb Tracker */}
      <div className="max-w-6xl mx-auto px-4 pt-4 hidden md:block">
        <button 
          onClick={() => router.back()} 
          className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-[#1D4ED8] transition-colors"
        >
          <ChevronLeft size={16} /> Wapas Feed par jaayein
        </button>
      </div>

      {/* Main Grid Content Block */}
      <main className="max-w-6xl mx-auto px-0 md:px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-0 md:gap-8 bg-white md:rounded-2xl border-0 md:border border-slate-100 md:shadow-sm overflow-hidden">
          
          {/* Media Images Stream Showcase */}
          <div className="md:col-span-6 bg-slate-50 relative border-b md:border-b-0 md:border-r border-slate-100 flex flex-col justify-center">
            <Swiper
              modules={[Pagination]}
              pagination={{ clickable: true, dynamicBullets: true }}
              className="w-full"
            >
              {product.images.map((image, index) => (
                <SwiperSlide key={index}>
                  <div className="w-full aspect-square flex items-center justify-center overflow-hidden bg-white">
                    <img 
                      src={image} 
                      alt={product.name} 
                      className="w-full h-full object-contain p-2 max-h-[500px]" 
                    />
                  </div>
                </SwiperSlide>
              ))}
            </Swiper>
            
            {discount > 0 && (
              <span className="absolute top-4 left-4 z-10 bg-red-500 text-white font-extrabold text-[11px] px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
                {discount}% Limited Sale
              </span>
            )}

            <button
              onClick={() => setIsFavorited(!isFavorited)}
              className="absolute top-4 right-4 h-9 w-9 rounded-full bg-white shadow-md flex items-center justify-center z-10 hover:scale-105 active:scale-95 transition-all"
            >
              <Heart size={18} className={isFavorited ? 'fill-red-500 text-red-500' : 'text-slate-400'} />
            </button>
          </div>

          {/* Right Product Operations Panel */}
          <div className="md:col-span-6 p-5 sm:p-6 md:p-8 flex flex-col justify-between space-y-6">
            
            <div className="space-y-4">
              <h1 className="text-xl md:text-2xl font-extrabold text-slate-900 tracking-tight leading-snug">
                {product.name}
              </h1>

              {/* Verified Badges Row */}
              <div className="flex items-center gap-3 flex-wrap">
                <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                  <div className="flex items-center">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={12} className={i < Math.floor(product.rating) ? 'fill-amber-400 text-amber-400' : 'text-slate-200'} />
                    ))}
                  </div>
                  <span className="text-xs font-bold text-amber-800">{product.rating}</span>
                </div>
                
                {stockStatus === 'low-stock' ? (
                  <span className="text-xs font-bold bg-amber-50 border border-amber-200 text-amber-800 px-2.5 py-1 rounded-lg">
                    ⚠️ Only {product.stock} left in stock
                  </span>
                ) : stockStatus === 'in-stock' ? (
                  <span className="text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-700 px-2.5 py-1 rounded-lg">
                    ✓ Available In Stock
                  </span>
                ) : (
                  <span className="text-xs font-bold bg-slate-100 border border-slate-200 text-slate-500 px-2.5 py-1 rounded-lg">
                    Out of Stock
                  </span>
                )}
              </div>

              {/* Price Module Wrapper */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center gap-3">
                <span className="text-2xl font-black text-[#1D4ED8] tracking-tight">Rs. {product.price.toLocaleString()}</span>
                {discount > 0 && (
                  <span className="text-xs font-semibold text-slate-400 line-through">
                    Rs. {product.originalPrice.toLocaleString()}
                  </span>
                )}
              </div>

              {/* Logistic Guarantees Box */}
              <div className="bg-blue-50/60 border border-blue-100 rounded-xl p-3.5 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-blue-900">
                  <ShieldCheck className="w-4 h-4 text-[#1D4ED8]" />
                  <span>💰 Cash on Delivery Available across Pakistan</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[11px] text-blue-800/80 font-medium pl-6">
                  <span className="flex items-center gap-1"><Truck className="w-3.5 h-3.5" /> Fast Delivery</span>
                  <span className="flex items-center gap-1"><RotateCcw className="w-3.5 h-3.5" /> Open Box Check</span>
                </div>
              </div>

              {/* Quantity Interface Stream */}
              <div className="space-y-2 pt-1">
                <span className="text-[11px] font-black uppercase text-slate-400 tracking-wider block">Select Quantity</span>
                <div className="flex items-center gap-3">
                  <div className="flex items-center border border-slate-200 rounded-xl bg-white p-0.5 shadow-sm">
                    <button 
                      onClick={decrementQuantity} 
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg font-bold"
                    >
                      −
                    </button>
                    <span className="w-8 text-center font-mono text-xs font-bold text-slate-800">{quantity}</span>
                    <button 
                      onClick={incrementQuantity} 
                      className="w-8 h-8 flex items-center justify-center text-slate-500 hover:bg-slate-50 rounded-lg font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Desktop Panel Triggers */}
            <div className="space-y-2.5 pt-2 hidden md:block">
              <button 
                onClick={handleBuyNow} 
                disabled={stockStatus === 'out-of-stock'}
                className="w-full py-3.5 bg-[#1D4ED8] hover:bg-blue-700 disabled:bg-slate-200 disabled:text-slate-400 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md transition-all active:scale-[0.99]"
              >
                Instant Buy Now (COD)
              </button>
              <button 
                onClick={handleAddToCart} 
                disabled={stockStatus === 'out-of-stock'}
                className="w-full py-3.5 border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:bg-slate-100 disabled:text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl transition-all"
              >
                Add To Cart Storage
              </button>
            </div>

            {/* Specs & Info Module */}
            <div className="space-y-2 pt-4 border-t border-slate-100">
              <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Product Specifications</h3>
              <p className="text-xs text-slate-600 leading-relaxed font-medium">
                {product.description}
              </p>
            </div>

          </div>
        </div>
      </main>

      {/* Corporate Solid Modern Footer (Fixed Visual Alignment) */}
      <footer className="bg-[#1F2937] text-white mt-16 py-12 border-t-4 border-[#1D4ED8]">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10 text-left">
            <div className="space-y-3">
              <h3 className="text-xl font-black text-white tracking-tight">dukaann.pk</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Pakistan&apos;s fastest growing premium e-commerce network with 100% verified digital vendors and lightning fast Cash on Delivery logistics.
              </p>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3 border-b border-gray-700 pb-1.5">Quick Links</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">About Us</Link></li>
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Contact Support</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3 border-b border-gray-700 pb-1.5">Help Desk</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Track Order FAQ</Link></li>
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Easy Returns</Link></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-xs uppercase tracking-wider text-gray-200 mb-3 border-b border-gray-700 pb-1.5">Legal Docs</h4>
              <ul className="space-y-2 text-xs text-gray-400">
                <li><Link href="#" className="hover:text-[#1D4ED8] block transition-all">Privacy Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-500">
            <p>&copy; 2026 dukaan.pk. All rights reserved.</p>
            <p className="bg-gray-800 px-3 py-1 rounded-md text-gray-400 font-medium">
              ⚡ Optimized for Pakistani 4G Mobile Connections
            </p>
          </div>
        </div>
      </footer>

      {/* 📱 MOBILE FIXED CONVERSION STICKY OVERLAY */}
      <div className="fixed bottom-0 left-0 right-0 md:hidden z-30 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-xl">
        <button 
          onClick={handleWhatsAppClick}
          className="absolute bottom-full right-4 mb-3 bg-emerald-500 text-white rounded-full p-3.5 shadow-xl transition-all active:scale-95 z-40 border border-emerald-400/20"
        >
          <MessageCircle size={22} className="fill-white" />
        </button>
        
        <div className="grid grid-cols-12 gap-2.5">
          <button 
            onClick={handleAddToCart} 
            disabled={stockStatus === 'out-of-stock'}
            className="col-span-5 py-3 border border-slate-200 text-slate-700 disabled:border-slate-100 disabled:text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 bg-white"
          >
            <ShoppingCart size={14} /> Cart
          </button>
          
          <button 
            onClick={handleBuyNow} 
            disabled={stockStatus === 'out-of-stock'}
            className="col-span-7 py-3 bg-[#1D4ED8] hover:bg-blue-700 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-md text-center"
          >
            Buy Now (COD)
          </button>
        </div>
      </div>

    </div>
  );
}