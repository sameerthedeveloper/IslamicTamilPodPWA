import { PlayIcon } from 'lucide-react'
import React from 'react'

function QuranCard({title,subtitle}) {
  return (
     <div className="mt-4 rounded-3xl border border-gray-200 bg-white p-4 shadow-sm">

                    <div className="flex items-center gap-4">



                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-gray-900 text-white">
                            <PlayIcon/>


                        </div>

                        <div>

                            <p className="font-semibold text-gray-900">
                                {title}
                            </p>

                            <p className="text-sm text-gray-500">
                                {subtitle}
                            </p>

                        </div>

                    </div>

                </div>
  )
}

export default QuranCard