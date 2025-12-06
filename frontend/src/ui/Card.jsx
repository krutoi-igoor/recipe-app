import React from 'react';

const Card = ({ title, actions, children, className = '' }) => {
  return (
    <section className={`card ${className}`.trim()}>
      {(title || actions) && (
        <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          {title && <h3 style={{ margin: 0 }}>{title}</h3>}
          {actions && <div>{actions}</div>}
        </header>
      )}
      <div>{children}</div>
    </section>
  );
};

export default Card;
