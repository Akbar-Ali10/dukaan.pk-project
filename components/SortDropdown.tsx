'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

interface SortDropdownProps {
  sortOption: string
  onSortChange: (option: string) => void
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
]

export function SortDropdown({ sortOption, onSortChange }: SortDropdownProps) {
  const [isOpen, setIsOpen] = useState(false)

  const currentLabel =
    SORT_OPTIONS.find((opt) => opt.value === sortOption)?.label || 'Sort By'

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-[#1D4ED8] focus:ring-offset-2 min-h-11 min-w-max"
      >
        {currentLabel}
        <ChevronDown
          size={18}
          className={`text-gray-600 transition-transform ${isOpen ? 'rotate-180' : ''}`}
        />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-56 bg-white border border-gray-300 rounded-lg shadow-lg z-50 overflow-hidden">
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => {
                onSortChange(option.value)
                setIsOpen(false)
              }}
              className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors min-h-11 ${
                sortOption === option.value
                  ? 'bg-[#1D4ED8] text-white'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
