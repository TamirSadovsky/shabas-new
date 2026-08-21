import { useState } from 'react';
import './PrimaryButton.css';
import done from '../../assets/done.svg';
import gmar from '../../assets/gmar_icon.svg';

function PrimaryButton({
  width = null,
  height = null,
  text,
  backgroundColor = null,
  textColor = null,
  fontSize = null,
  onClick = () => {},
  // NEW: style for the OUTER wrapper (the layout container)
  wrapperStyle = {},
  className = '',
  wrapperClassName = '',
}) {
  const style = {
    width,
    height,
    backgroundColor,
    color: textColor,
    fontSize,
  };

  return (
    <div
      className={`primary_button_wrapper ${wrapperClassName}`}
      style={wrapperStyle}
      onClick={onClick}
    >
      <div className={`primary_button ${className}`} style={style}>
        {text}
      </div>
    </div>
  );
}

export default PrimaryButton;
