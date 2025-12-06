import React from 'react';

const Section = ({ title, kicker, actions, children, className = '' }) => (
  <div className={`section ${className}`.trim()}>
    {(title || actions || kicker) && (
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
        <div>
          {kicker && <div className="chip" style={{ marginBottom: '0.35rem' }}>{kicker}</div>}
          {title && <h2 style={{ margin: 0 }}>{title}</h2>}
        </div>
        {actions && <div>{actions}</div>}
      </div>
    )}
    {children}
  </div>
);

export default Section;
