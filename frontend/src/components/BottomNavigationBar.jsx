import React from 'react'
import { Home, Search, Book, Bookmark } from 'lucide-react'

function BottomNavigationBar({ active, set }) {
    const tabs = [
        { id: 'home', label: 'Home', icon: Home },
        { id: 'library', label: 'Library', icon: Bookmark },
        { id: 'browser', label: 'Discover', icon: Search },
        { id: 'quran', label: 'Quran', icon: Book }
    ]

    return (
        <nav className="fixed inset-x-3 bottom-3 z-50 rounded-full border border-gray-200 bg-white/95 p-1.5 shadow-xl backdrop-blur-sm">
            <div className="grid grid-cols-4 gap-1">
                {tabs.map((tab) => {
                    const isActive = active === tab.id
                    const Icon = tab.icon

                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => set(tab.id)}
                            className={`flex py-4 flex-col items-center justify-center gap-1 rounded-full px-2 transition-all duration-200 ${
                                isActive
                                    ? 'bg-gray-900 text-white shadow-sm'
                                    : 'text-gray-500 hover:bg-gray-100 hover:text-gray-950'
                            }`}
                        >
                            <Icon size={17} strokeWidth={3} />
                            <span className="text-[11px] font-medium leading-none">
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )


}

export default BottomNavigationBar