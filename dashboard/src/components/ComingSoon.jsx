import React from 'react'
import { Clock } from './Icons.jsx'

export default function ComingSoon({
  badge = 'Preparation in Progress',
  icon: Icon,
  title,
  description,
  details = []
}) {
  return (
    <div className="coming-soon-wrapper">
      <div className="coming-soon-card">
        {badge && (
          <div className="coming-soon-badge">
            <Clock size={13} />
            <span>{badge}</span>
          </div>
        )}

        {Icon && (
          <div className="coming-soon-icon-wrap">
            <Icon size={28} />
          </div>
        )}

        <h2 className="coming-soon-title">{title}</h2>

        {description && (
          <p className="coming-soon-description">{description}</p>
        )}

        {details && details.length > 0 && (
          <div className="coming-soon-details-panel">
            <div className="coming-soon-details-heading">Verification Checkpoint</div>
            <ul className="coming-soon-details-list">
              {details.map((item, idx) => (
                <li key={idx} className="coming-soon-details-item">
                  <span className="details-bullet">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
