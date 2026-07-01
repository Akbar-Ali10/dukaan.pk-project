export default function HeroSection() {
  const categories = [
    { name: 'Electronics', emoji: '📱', color: 'bg-blue-50' },
    { name: 'Fashion', emoji: '👕', color: 'bg-pink-50' },
    { name: 'Home & Living', emoji: '🏠', color: 'bg-green-50' },
    { name: 'Beauty', emoji: '💄', color: 'bg-purple-50' },
    { name: 'Sports', emoji: '⚽', color: 'bg-orange-50' },
    { name: 'Books', emoji: '📚', color: 'bg-yellow-50' },
  ]

  return (
    <section className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Banner */}
      <div className="bg-gradient-to-r from-[#1D4ED8] to-[#1E40AF] rounded-xl overflow-hidden mb-8">
        <div className="px-6 sm:px-8 py-12 sm:py-16 text-white">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Welcome to dukaan.pk
          </h2>
          <p className="text-base sm:text-lg mb-6 opacity-90">
            Discover amazing products with instant Cash on Delivery across Pakistan
          </p>
          <button className="bg-white text-[#1D4ED8] px-6 sm:px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
            Shop Now
          </button>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="mb-8">
        <h3 className="text-xl sm:text-2xl font-bold text-[#1F2937] mb-6">
          Shop by Category
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {categories.map((category) => (
            <button
              key={category.name}
              className={`${category.color} p-4 rounded-lg text-center transition transform hover:scale-105 active:scale-95`}
            >
              <div className="text-3xl mb-2">{category.emoji}</div>
              <p className="text-sm font-semibold text-[#1F2937]">
                {category.name}
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
