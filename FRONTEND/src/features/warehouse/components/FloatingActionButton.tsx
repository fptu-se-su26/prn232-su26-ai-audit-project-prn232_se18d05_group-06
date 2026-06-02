const FloatingActionButton = () => (
  <button className="fixed bottom-8 right-8 w-14 h-14 bg-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center glow-active group z-50 hover:scale-105 transition-transform">
    <span className="material-symbols-outlined text-3xl">add</span>
    <span className="absolute right-16 bg-slate-900 text-white px-4 py-2 rounded-2xl text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
      Create Quick Order
    </span>
  </button>
)

export default FloatingActionButton
