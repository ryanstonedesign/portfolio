import './YearIndicator.css'

const START_YEAR = 2026
const END_YEAR = 2009
const YEARS = Array.from({ length: START_YEAR - END_YEAR + 1 }, (_, i) => START_YEAR - i)
const ROW_HEIGHT = 22
const DIGIT_HEIGHT = 22

// Ticker: a single digit wheel that rolls between 0-9
function DigitWheel({ digit }) {
  return (
    <div className="year-indicator__ticker-slot">
      <div
        className="year-indicator__ticker-wheel"
        style={{ transform: `translateY(-${digit * DIGIT_HEIGHT}px)` }}
      >
        {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9].map(d => (
          <div key={d} className="year-indicator__ticker-digit">{d}</div>
        ))}
      </div>
    </div>
  )
}

function YearIndicator({ activeYear, isVisible, variant = 'ticker' }) {
  const activeYearNum = parseInt(activeYear)
  const activeIndex = YEARS.indexOf(activeYearNum)
  const totalYears = YEARS.length

  const activeRowEnterDelay = activeIndex >= 0 ? (totalYears - 1 - activeIndex) * 18 : 200
  const activeRowExitDelay = activeIndex >= 0 ? activeIndex * 18 : 200

  // Ticker: split year into individual digits
  const yearDigits = String(activeYearNum).split('').map(Number)

  // Fixed: prefix (first 3 digits)
  const prefix = String(activeYearNum).slice(0, 3)

  // Y position for active row
  const activeY = activeIndex >= 0 ? activeIndex * ROW_HEIGHT : 0

  return (
    <div className={`year-indicator ${isVisible ? 'year-indicator--visible' : ''}`}>
      <div className="year-indicator__content">
        {/* Year text - either fixed prefix or ticker */}
        {variant === 'fixed' ? (
          <div
            className="year-indicator__year-slide"
            style={{
              '--enter-delay': `${activeRowEnterDelay}ms`,
              '--exit-delay': `${activeRowExitDelay}ms`,
            }}
          >
            <div
              className="year-indicator__prefix"
              style={{ transform: `translateY(${activeY}px)` }}
            >
              {prefix}
            </div>
          </div>
        ) : (
          <div
            className="year-indicator__year-slide"
            style={{
              '--enter-delay': `${activeRowEnterDelay}ms`,
              '--exit-delay': `${activeRowExitDelay}ms`,
            }}
          >
            <div
              className="year-indicator__ticker"
              style={{ transform: `translateY(${activeY}px)` }}
            >
              {yearDigits.map((d, i) => (
                <DigitWheel key={i} digit={d} />
              ))}
            </div>
          </div>
        )}

        {/* Year rows: lines (+ fixed 4th digit in fixed variant) */}
        {YEARS.map((year, index) => {
          const isActive = year === activeYearNum
          const lastDigit = String(year).slice(-1)
          const enterDelay = (totalYears - 1 - index) * 18
          const exitDelay = index * 18

          return (
            <div
              key={year}
              className="year-indicator__row"
              style={{
                '--enter-delay': `${enterDelay}ms`,
                '--exit-delay': `${exitDelay}ms`,
              }}
            >
              {variant === 'fixed' && (
                <span className={`year-indicator__digit ${isActive ? 'year-indicator__digit--visible' : ''}`}>
                  {lastDigit}
                </span>
              )}
              <span className={`year-indicator__line ${isActive ? 'year-indicator__line--active' : ''}`} />
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default YearIndicator
