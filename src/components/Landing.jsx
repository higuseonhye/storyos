import { useEffect, useState } from 'react'
import './Landing.css'

/** ms before CTAs unlock — first moments feel still, not demanding */
const CTA_READY_DELAY_MS = 1900

export function Landing({ exiting, anticipating, onEnterStory }) {
  const [awake, setAwake] = useState(false)
  const [ctaReady, setCtaReady] = useState(false)

  useEffect(() => {
    const wake = window.setTimeout(() => setAwake(true), 100)
    const cta = window.setTimeout(() => setCtaReady(true), CTA_READY_DELAY_MS)
    return () => {
      clearTimeout(wake)
      clearTimeout(cta)
    }
  }, [])

  const locked = exiting || anticipating || !ctaReady

  return (
    <div
      className={`landing ${exiting ? 'landing--out' : ''} ${awake ? 'landing--awake' : ''}`}
    >
      <div className="landing__inner">
        <section className="landing__hero" aria-labelledby="landing-headline">
          <p className="landing__wordmark">StoryOS</p>
          <p className="landing__kicker">
            Not a chat thread — one judgment, unfolding as a live reasoning line.
          </p>
          <h1 id="landing-headline" className="landing__headline">
            Watch AI think.
          </h1>
          <p className="landing__subtext">
            One short mission plays out in order: research, tension, judgment, a
            closing line. You don’t type. You watch — like following a thought as
            it forms.
          </p>
          <button
            type="button"
            className={`landing__cta ${!ctaReady && !exiting && !anticipating ? 'landing__cta--waiting' : ''}`}
            onClick={onEnterStory}
            disabled={locked}
          >
            Start a mission
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
            className={`landing__demo-btn ${!ctaReady && !exiting && !anticipating ? 'landing__demo-btn--waiting' : ''}`}
            onClick={onEnterStory}
            disabled={locked}
          >
            Try the demo
          </button>
        </section>

        <footer className="landing__footer">
          <p>StoryOS — intelligence, told as a story</p>
        </footer>
      </div>
    </div>
  )
}
