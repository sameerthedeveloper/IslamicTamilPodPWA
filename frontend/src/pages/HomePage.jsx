import React from 'react'
import CardLayout from '../components/Card/CardLayout'
import TitleCard from '../components/Card/TitleCard'

function HomePage() {
    return (
        <main className="px-5 pb-52 pt-28">

            <h1 className="text-3xl font-semibold tracking-tight text-gray-900">
                Assalamu Alaikum
            </h1>

            <p className="mt-2 text-gray-500">
                Listen to Tamil Islamic lectures and Quran recitations.
            </p>


            <CardLayout title="Continue Listeninig">
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
            </CardLayout>

            <CardLayout title="Discover">
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/><TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
                <TitleCard title="Ruwaid" image="Ruwaid"/>
            </CardLayout>

            

        </main>
    )
}

export default HomePage