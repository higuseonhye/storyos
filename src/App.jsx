import { useCallback, useState } from 'react'
import { StoryInput } from './components/StoryInput'
import { StoryTimeline } from './components/StoryTimeline'
import './App.css'

export default function App() {
  const [playing, setPlaying] = useState(false)
  const handleRest = useCallback(() => setPlaying(false), [])

  return (
    <div className="app">
      <header className="app__brand">
        <span className="app__name">StoryOS</span>
      </header>

      <StoryInput
        onStart={() => setPlaying(true)}
        disabled={playing}
      />

      <StoryTimeline playing={playing} onRest={handleRest} />
    </div>
  )
}
