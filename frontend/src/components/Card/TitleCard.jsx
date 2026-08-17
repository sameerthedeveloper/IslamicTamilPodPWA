import React from 'react'

function TitleCard({title,image}) {
  return (
    <div
      className="flex h-60 w-40 shrink-0 flex-col rounded-2xl border border-gray-200 bg-white p-2 shadow-sm">
      <div
        className="flex flex-1 items-center justify-center rounded-xl border border-gray-200 bg-gray-100">
        {image}
      </div>

      <p className="mt-2 truncate px-1 text-sm font-medium text-gray-900">
        {title}
      </p>
    </div>
  )
}

export default TitleCard