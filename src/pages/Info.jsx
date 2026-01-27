import './Info.css'

function Info() {
  const experience = [
    { company: 'Shopify', url: 'https://www.shopify.com', role: 'Staff Product Designer', period: 'Jun 2021 – Present' },
    { company: 'Expedia', url: 'https://www.expedia.com', role: 'Senior Product Designer', period: 'Sep 2018 – Jun 2021' },
    { company: 'REI', url: 'https://www.rei.com', role: 'Product Designer', period: 'Jun 2017 – Sep 2018' },
    { company: 'QVC', url: 'https://www.qvc.com', role: 'Product Designer', period: 'Aug 2014 – Jun 2017' },
  ]

  const sideHustles = [
    { name: 'StuffLog iOS app', url: 'https://apps.apple.com/us/app/stufflog-track-your-things/id6751174453', role: 'Founder', period: 'Sep 2025 – Present' },
    { name: 'Noodles Figma plugin', url: 'https://www.figma.com/community/plugin/1509719253635653417/noodles', role: 'Founder', period: 'May 2025 – Present' },
    { name: 'Stone Patch Company', url: 'https://stone-patch-company.myshopify.com/', role: 'Founder', period: 'Dec 2019 – Dec 2021' },
    { name: 'Design Standup podcast', url: 'https://www.youtube.com/@designstandup3670/videos', role: 'Founder', period: 'Jan 2019 – Apr 2019' },
  ]

  const education = [
    { school: 'Iowa State University', url: 'https://www.iastate.edu/', detail: 'M.S. Human Computer Interaction (6 credits)', year: '2016' },
    { school: 'West Chester University', url: 'https://www.wcupa.edu/', detail: 'B.S. Marketing, Graphic Design', year: '2011 – 2015' },
  ]

  return (
    <div className="info">
      <div className="info__content">
        
        {/* Bio */}
        <section className="info__row" style={{ '--row-index': 0 }}>
          <span className="info__label"><span>Bio</span></span>
          <p className="info__text">
            <span>Software designer and vibe-coder specializing in highly-interactive prototypes across a variety of platforms. I work in code, Figma, Origami – whatever gets the job done. I love learning new tools to speed up my workflow, and using design to rally stakeholders around a vision that solves real user and business needs. Working remotely from the Greater Philadelphia area.</span>
          </p>
        </section>

        {/* Experience */}
        <section className="info__row" style={{ '--row-index': 1 }}>
          <span className="info__label"><span>Experience</span></span>
          <div className="info__list">
            {experience.map((item, index) => (
              <div key={item.company} className="info__list-row" style={{ '--item-index': index }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="info__list-item info__link"><span>{item.company}</span></a>
                <span className="info__list-detail"><span>{item.role}</span></span>
                <span className="info__list-meta"><span>{item.period}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* Side Hustles */}
        <section className="info__row" style={{ '--row-index': 2 }}>
          <span className="info__label"><span>Side hustles</span></span>
          <div className="info__list">
            {sideHustles.map((item, index) => (
              <div key={item.name} className="info__list-row" style={{ '--item-index': index }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="info__list-item info__link"><span>{item.name}</span></a>
                <span className="info__list-detail"><span>{item.role}</span></span>
                <span className="info__list-meta"><span>{item.period}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="info__row" style={{ '--row-index': 3 }}>
          <span className="info__label"><span>Education</span></span>
          <div className="info__list">
            {education.map((item, index) => (
              <div key={item.school} className="info__list-row" style={{ '--item-index': index }}>
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="info__list-item info__link"><span>{item.school}</span></a>
                <span className="info__list-detail"><span>{item.detail}</span></span>
                <span className="info__list-meta"><span>{item.year}</span></span>
              </div>
            ))}
          </div>
        </section>

        {/* Socials */}
        <section className="info__row" style={{ '--row-index': 4 }}>
          <span className="info__label"><span>Socials</span></span>
          <div className="info__list">
            <div className="info__list-row" style={{ '--item-index': 0 }}>
              <a href="https://www.linkedin.com/in/ryanstonedesign/" target="_blank" rel="noopener noreferrer" className="info__list-item info__link"><span>LinkedIn</span></a>
            </div>
            <div className="info__list-row" style={{ '--item-index': 1 }}>
              <a href="https://x.com/RyanStoneDesign" target="_blank" rel="noopener noreferrer" className="info__list-item info__link"><span>X</span></a>
            </div>
            <div className="info__list-row" style={{ '--item-index': 2 }}>
              <a href="https://unsplash.com/@rstone_design" target="_blank" rel="noopener noreferrer" className="info__list-item info__link"><span>Unsplash</span></a>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Info
