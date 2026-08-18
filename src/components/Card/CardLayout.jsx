
function CardLayout({children,title}) {
  return (
    <div className="mt-8">

                    <h2 className="text-xl font-semibold text-gray-900">
                        {title}
                    </h2>

                    <div className="mt-4 flex gap-4 overflow-x-auto scrollbar-hide pb-2">



                    {children}

                    </div>

                </div>
  )
}

export default CardLayout