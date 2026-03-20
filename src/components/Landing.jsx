import { useEffect, useState } from 'react'
import './Landing.css'

/** ms before primary CTA unlocks — first moments feel still, not demanding */
const CTA_READY_DELAY_MS = 1900

export function Landing({ anticipating, onEnterLive, onEnterDemo }) {
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

  const locked = anticipating || !ctaReady

  return (
    <div className={`landing ${awake ? 'landing--awake' : ''}`}>
      <div className="landing__inner">
        <section className="landing__hero" aria-labelledby="landing-headline">
          <p className="landing__wordmark">StoryOS</p>
          <p className="landing__kicker">
            Not one answer — a portfolio of voices reasoning in parallel, live.
          </p>
          <h1 id="landing-headline" className="landing__headline">
            Think in public.
          </h1>
          <p className="landing__context">
            Strategy, skepticism, and execution — together.
            <br />
            You steer; the panel debates in real time.
          </p>
          <p className="landing__subtext">
            Real models on your stack — or watch the scripted mission unfold.
          </p>
          <div className="landing__ctas">
            <button
              type="button"
              className={`landing__cta ${!ctaReady && !anticipating ? 'landing__cta--waiting' : ''}`}
              onClick={onEnterLive}
              disabled={locked}
            >
              Open live panel
            </button>
            <button
              type="button"
              className={`landing__cta landing__cta--secondary ${!ctaReady && !anticipating ? 'landing__cta--waiting' : ''}`}
              onClick={onEnterDemo}
              disabled={locked}
            >
              Watch scripted demo
            </button>
          </div>
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

        <footer className="landing__footer">
          <p>StoryOS — intelligence as a live panel</p>
        </footer>
      </div>
    </div>
  )
}
