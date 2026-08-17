import React from 'react'
import { Book } from 'lucide-react'
import QuranCard from '../components/QuranCards/QuranCard'
function QuranPage() {
  return (
    <main className="px-5 pb-52 pt-28">

                <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                    Quran
                </h1>

                <p className="mt-2 text-gray-500">
                    Listen to Quran recitations.
                </p>



                {/* <div className="sticky top-25 mt-8 rounded-2xl border border-gray-200 bg-white p-4 shadow-xl">

                    <div className="flex items-center gap-4">



                        <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gray-900 text-white">

                            <Book/>

                        </div>



                        <div>

                            <p className="font-semibold text-gray-900">
                                Quran Recitations
                            </p>

                            <p className="text-sm text-gray-500">
                                Listen and reflect
                            </p>

                        </div>

                    </div>

                </div> */}
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>
                <QuranCard title="Al-Fathiha" subtitle="The Begining"/>


            </main>
  )
}

export default QuranPage