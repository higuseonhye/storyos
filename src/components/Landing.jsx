import './Landing.css'

export function Landing({ exiting, onEnterStory }) {
  return (
    <div className={`landing ${exiting ? 'landing--out' : ''}`}>
      <div className="landing__inner">
        <section className="landing__hero" aria-labelledby="landing-headline">
          <p className="landing__wordmark">StoryOS</p>
          <h1 id="landing-headline" className="landing__headline">
            Watch AI think.
          </h1>
          <p className="landing__subtext">
            StoryOS turns AI work into a story you can follow — step by step,
            decision by decision.
          </p>
          <button
            type="button"
            className="landing__cta"
            onClick={onEnterStory}
            disabled={exiting}
          >
            Start a mission
          </button>
        </section>

        <section className="landing__block" aria-label="The problem">
          <p className="landing__body">
            AI gives answers.
            <br />
            But you don’t know how it got there.
          </p>
        </section>

        <section className="landing__block" aria-label="The solution">
          <p className="landing__body landing__body--lead">
            StoryOS reveals the thinking.
          </p>
          <p className="landing__body">
            Research unfolds.
            <br />
            Conflicts emerge.
            <br />
            Decisions become visible.
          </p>
        </section>

        <section className="landing__demo" aria-label="Demo">
          <button
            type="button"
            className="landing__demo-btn"
            onClick={onEnterStory}
            disabled={exiting}
          >
            Try the demo
          </button>
        </section>

        <footer className="landing__footer">
          <p>StoryOS — AI, as a story</p>
        </footer>
      </div>
    </div>
  )
}
