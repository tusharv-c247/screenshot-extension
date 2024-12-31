import React from 'react';

const ScreenshotButton = ({ onCapture }) => (
  <button onClick={onCapture} style={{ width: '100%', padding: '8px', marginBottom: '10px' }}>
    Capture Screenshot
  </button>
);

export default ScreenshotButton;
