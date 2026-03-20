import './Landing.css'

export function Landing({ exiting, onEnterStory }) {
  return (
    <div className={`landing ${exiting ? 'landing--out' : ''}`}>
      <div className="landing__inner">
        <section className="landing__hero" aria-labelledby="landing-headline">
          <p className="landing__wordmark">StoryOS</p>
          <p className="landing__kicker">
            Not another answer — a window into how it gets there.
          </p>
          <h1 id="landing-headline" className="landing__headline">
            Watch AI think.
          </h1>
          <p className="landing__subtext">
            This demo is a single story: you stay still and watch a mission unfold —
            thought by thought, beat by beat. No prompts. Just attention.
          </p>
          <button
            type="button"
            className="landing__cta"
            onClick={onEnterStory}
            disabled={exiting}
          >
            Begin watching
          </button>
        </section>

        <section className="landing__block" aria-label="The problem">
          <p className="landing__body">
            Most AI shows you the finish line.
            <br />
            You rarely see the path it ran.
          </p>
        </section>

        <section className="landing__block" aria-label="The solution">
          <p className="landing__body landing__body--lead">
            Here, the path is the point.
          </p>
          <p className="landing__body">
            Research surfaces.
            <br />
            Tension shows.
            <br />
            A decision lands.
          </p>
        </section>

        <section className="landing__demo" aria-label="Demo">
          <button
            type="button"
            className="landing__demo-btn"
            onClick={onEnterStory}
            disabled={exiting}
          >
            Enter the demo
          </button>
        </section>

        <footer className="landing__footer">
          <p>StoryOS — intelligence, told as a story</p>
        </footer>
      </div>
    </div>
  )
}
