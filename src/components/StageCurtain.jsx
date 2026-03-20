import './StageCurtain.css'

/**
 * Full-viewport theater curtains — red velvet panels part when `open`, meet when closed.
 * @param {{ open: boolean }} props
 */
export function StageCurtain({ open }) {
  return (
    <div
      className={`stage-curtain-layer ${open ? 'stage-curtain-layer--open' : ''}`}
      aria-hidden={open}
    >
      <div className="stage-curtain__valance" aria-hidden="true" />
      <div className="stage-curtain__tiebacks" aria-hidden="true">
        <span className="stage-curtain__tassel stage-curtain__tassel--left" />
        <span className="stage-curtain__tassel stage-curtain__tassel--right" />
      </div>
      <div className={`stage-curtain stage-curtain--left ${open ? 'is-open' : ''}`} />
      <div className={`stage-curtain stage-curtain--right ${open ? 'is-open' : ''}`} />
    </div>
  )
}
