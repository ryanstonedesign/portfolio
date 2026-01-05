import './Info.css'

function Info() {
  const experience = [
    { company: 'Shopify', url: 'https://www.shopify.com', role: 'Staff Product Designer', period: 'Jun 2021 – Present' },
    { company: 'Expedia', url: 'https://www.expedia.com', role: 'Senior Product Designer', period: 'Sep 2018 – Jun 2021' },
    { company: 'REI', url: 'https://www.rei.com', role: 'Product Designer', period: 'Jun 2017 – Sep 2018' },
    { company: 'QVC', url: 'https://www.qvc.com', role: 'Product Designer', period: 'Aug 2014 – Jun 2017' },
  ]

  const education = [
    { school: 'Iowa State University', url: 'https://www.iastate.edu/', detail: 'M.S. Human Computer Interaction (6 credits)', year: '2016' },
    { school: 'West Chester University', url: 'https://www.wcupa.edu/', detail: 'B.S. Marketing, Graphic Design', year: '2011 – 2015' },
  ]

  return (
    <div className="info">
      <div className="info__content">
        
        {/* Bio */}
        <section className="info__row">
          <span className="info__label">Bio</span>
          <p className="info__text">
            Product designer with a background in visual design, photography, and print. 
            I've spent the last decade helping companies craft thoughtful digital experiences 
            that balance business goals with user needs. Currently based in Philadelphia.
          </p>
        </section>

        {/* Experience */}
        <section className="info__row">
          <span className="info__label">Experience</span>
          <div className="info__list">
            {experience.map((item) => (
              <div key={item.company} className="info__list-row">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="info__list-item info__link">{item.company}</a>
                <span className="info__list-detail">{item.role}</span>
                <span className="info__list-meta">{item.period}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Education */}
        <section className="info__row">
          <span className="info__label">Education</span>
          <div className="info__list">
            {education.map((item) => (
              <div key={item.school} className="info__list-row">
                <a href={item.url} target="_blank" rel="noopener noreferrer" className="info__list-item info__link">{item.school}</a>
                <span className="info__list-detail">{item.detail}</span>
                <span className="info__list-meta">{item.year}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Socials */}
        <section className="info__row">
          <span className="info__label">Socials</span>
          <div className="info__list">
            <div className="info__list-row">
              <a href="https://www.linkedin.com/in/ryanstonedesign/" target="_blank" rel="noopener noreferrer" className="info__list-item info__link">LinkedIn</a>
            </div>
            <div className="info__list-row">
              <a href="https://x.com/RyanStoneDesign" target="_blank" rel="noopener noreferrer" className="info__list-item info__link">X</a>
            </div>
            <div className="info__list-row">
              <a href="https://unsplash.com/@rstone_design" target="_blank" rel="noopener noreferrer" className="info__list-item info__link">Unsplash</a>
            </div>
          </div>
        </section>

      </div>
    </div>
  )
}

export default Info
