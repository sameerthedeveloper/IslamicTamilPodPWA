import React from 'react'
import { Search } from 'lucide-react'

function BrowsePage() {
    return (
        <main className="px-5 pb-52 pt-28">

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Browse
            </h1>

            <p className="mt-2 text-gray-500">
                Explore Islamic content by category.
            </p>

            <div className="inset-x-2 border rounded-full p-3 my-4 bg-white border-gray-200 shadow flex justify-between items-center px-4">
                <input type="text" className="w-full outline-none ring-0 focus:outline-none focus:ring-0" placeholder="Search..." />
                <i className="fa-solid fa-magnifying-glass"></i>
                <Search/>

            </div>

            <div className="mt-8">

                <h2 className="text-lg font-semibold text-gray-900">
                    Browser By
                </h2>

                <div className="mt-4 grid grid-cols-2 gap-4">



                    <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">

                        <i className="fa-solid fa-microphone text-xl"></i>

                        <p className="mt-3 font-medium">
                            Bayans
                        </p>

                    </div>



                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <i className="fa-solid fa-book-quran text-xl"></i>

                        <p className="mt-3 font-medium">
                            Quran
                        </p>

                    </div>



                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <i className="fa-solid fa-graduation-cap text-xl"></i>

                        <p className="mt-3 font-medium">
                            Education
                        </p>

                    </div>



                    <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">

                        <i className="fa-solid fa-users text-xl"></i>

                        <p className="mt-3 font-medium">
                            Speakers
                        </p>

                    </div>

                </div>

            </div>


        </main>
    )
}

export default BrowsePage