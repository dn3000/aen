import { useState } from 'react'
import { ChevronDown } from 'lucide-react'

export default function FarmerAsk({ items = [] }) {
  const [openIndex, setOpenIndex] = useState(null)

  function toggle(i) {
    setOpenIndex(openIndex === i ? null : i)
  }

  if (!items.length) return null

  return (
    <div className="divide-y divide-cream-dark rounded-xl border border-cream-dark overflow-hidden">
      {items.map((item, i) => (
        <div key={i} className="bg-white">
          <button
            onClick={() => toggle(i)}
            className="w-full flex items-center justify-between px-5 py-4 text-left text-sm font-medium text-gray-800 hover:bg-cream transition-colors cursor-pointer"
          >
            <span>{item.question}</span>
            <ChevronDown
              size={18}
              className={`text-green-primary shrink-0 transition-transform duration-200 ${
                openIndex === i ? 'rotate-180' : ''
              }`}
            />
          </button>
          {openIndex === i && (
            <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed">
              {item.answer}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
