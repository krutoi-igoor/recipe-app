import React from 'react';

const Input = ({ label, hint, ...props }) => (
  <label style={{ display: 'grid', gap: '0.25rem', fontWeight: 600 }}>
    <span>{label}</span>
    <input {...props} />
    {hint && <small style={{ color: '#5c6475' }}>{hint}</small>}
  </label>
);

export default Input;
