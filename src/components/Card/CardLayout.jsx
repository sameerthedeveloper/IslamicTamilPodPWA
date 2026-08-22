function CardLayout({ children, title }) {
  return (
    <div className="mt-8">

      <div className="flex items-center gap-2.5">
        <span className="h-4 w-1 rounded-full" style={{ background: 'var(--accent)' }} />
        <h2 className="font-display text-xl font-semibold text-gray-900">
          {title}
        </h2>
      </div>

      <div
        className="mt-4 flex gap-4 overflow-x-auto overflow-y-hidden scrollbar-hide pb-2"
        style={{ touchAction: 'pan-x', overscrollBehaviorX: 'contain' }}>

        {children}

      </div>

    </div>
  )
}

export default CardLayout
