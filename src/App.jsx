import { useState } from 'react'
import { StoryInput } from './components/StoryInput'
import { StoryTimeline } from './components/StoryTimeline'
import './App.css'

function App() {
  const [isRunning, setIsRunning] = useState(false)
  const [hasCompleted, setHasCompleted] = useState(false)

  const handleStart = () => {
    setIsRunning(true)
    setHasCompleted(false)
  }

  const handleComplete = () => {
    setIsRunning(false)
    setHasCompleted(true)
  }

  return (
    <div className="app">
      <header className="app__header">
        <h1 className="app__title">StoryOS</h1>
        <p className="app__tagline">Mission Control</p>
      </header>

      <main className="app__main">
        <StoryInput onStart={handleStart} isRunning={isRunning} />
        <StoryTimeline isRunning={isRunning} onComplete={handleComplete} />
      </main>

      {hasCompleted && (
        <div className="app__complete">
          <span className="app__complete-text">Mission complete</span>
        </div>
      )}
    </div>
  )
}

export default App
