import { useState } from 'react'
import './App.css'
import BottomNavigationBar from './components/BottomNavigationBar'
import MiniPlayer from './components/MiniPlayer'
import TopBar from './components/TopBar'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import BrowsePage from './pages/BrowsePage'
import QuranPage from './pages/QuranPage'

function App() {

  const [activeTab,setActiveTab] = useState("home")

  return (
    <div>
      <TopBar/>

        {activeTab=="home" && <HomePage/>}
        {activeTab=="library" && <LibraryPage/>}
        {activeTab=="browser" && <BrowsePage/>}
        {activeTab=="quran" && <QuranPage/>}

        {activeTab !== "quran" && <MiniPlayer/>}
      <BottomNavigationBar active={activeTab} set={setActiveTab}/>
    </div>
  )
}

export default App
