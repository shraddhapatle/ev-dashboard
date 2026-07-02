import React from 'react'

export default function Icon({ name, className = '', fill = 0, size = 20, style = {} }) {
  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={{ fontVariationSettings: `'FILL' ${fill}`, fontSize: size, ...style }}
    >
      {name}
    </span>
  )
}
