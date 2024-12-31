import React from 'react';

const FullPageScreenshotButton = ({ onCapture }) => {
  return (
    <button onClick={onCapture} style={{ width: '100%', padding: '8px' }}>
    Capture Full Page Screenshot
  </button>
  );
};

export default FullPageScreenshotButton;
