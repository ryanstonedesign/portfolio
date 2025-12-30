import './Info.css'

function Info() {
  const experience = [
    { company: 'Shopify', role: 'Staff Product Designer', period: 'Jun 2021 – Present' },
    { company: 'Expedia', role: 'Senior Product Designer', period: 'Sep 2018 – Jun 2021' },
    { company: 'REI', role: 'Product Designer', period: 'Jun 2017 – Sep 2018' },
    { company: 'QVC', role: 'Product Designer', period: 'Aug 2014 – Jun 2017' },
  ]

  const education = [
    { school: 'Iowa State University', detail: 'Human Computer Interaction', year: '2016' },
    { school: 'West Chester University', detail: 'B.S. Marketing, Graphic Design', year: '2011 – 2015' },
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
                <span className="info__list-item">{item.company}</span>
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
                <span className="info__list-item">{item.school}</span>
                <span className="info__list-detail">{item.detail}</span>
                <span className="info__list-meta">{item.year}</span>
              </div>
            ))}
          </div>
        </section>

      </div>
    </div>
  )
}

export default Info
