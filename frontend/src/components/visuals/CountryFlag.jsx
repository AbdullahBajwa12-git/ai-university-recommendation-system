import React from 'react';

export const CountryFlag = ({ countryCode, name, className = "" }) => {
  const svgSrc = `${import.meta.env.BASE_URL}flags/${countryCode.toLowerCase()}.svg`;

  return (
    <img
      src={svgSrc}
      alt={`Flag of ${name}`}
      className={`inline-block object-cover rounded-full ${className}`}
      style={{ aspectRatio: '1/1' }}
    />
  );
};
