import { useState } from 'react'
import './App.css'
import BottomNavigationBar from './components/BottomNavigationBar'
import MiniPlayer from './components/MiniPlayer'
import TopBar from './components/TopBar'
import AudioEngine from './components/AudioEngine'
import ErrorBoundary from './components/ErrorBoundary'
import FullPlayerSheet from './components/FullPlayerSheet'
import HomePage from './pages/HomePage'
import LibraryPage from './pages/LibraryPage'
import BrowsePage from './pages/BrowsePage'
import QuranPage from './pages/QuranPage'

function App() {

  const [activeTab,setActiveTab] = useState("home")

  return (
    <div>
      <TopBar/>

      <ErrorBoundary>
        {activeTab=="home" && <HomePage/>}
        {activeTab=="library" && <LibraryPage/>}
        {activeTab=="browser" && <BrowsePage/>}
        {activeTab=="quran" && <QuranPage/>}
      </ErrorBoundary>

        {activeTab !== "quran" && <MiniPlayer/>}
      <BottomNavigationBar active={activeTab} set={setActiveTab}/>
      <AudioEngine/>
      <FullPlayerSheet/>
    </div>
  )
}

export default App
