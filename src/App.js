import React, { useState } from 'react';
import ScreenshotButton from './ScreenshotButton';
import FullPageScreenshotButton from './FullPageScreenshotButton';


const App = () => {
  const [screenshot, setScreenshot] = useState(null);

  const captureScreenshot = () => {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (image) => {
      setScreenshot(image);
    });
  };

  // Helper function to get the page dimensions
function getPageDimensions() {
  return {
    width: document.documentElement.scrollWidth,
    height: document.documentElement.scrollHeight,
    viewportHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
  };
}

// Helper function to load an image
const loadImage = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });


  const captureFullPageScreenshot = async () => {
    try {
      // Get the active tab
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  
      // Inject a script to get page dimensions
      const [{ result: pageDimensions }] = await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: getPageDimensions,
      });
  
      if (!pageDimensions) {
        console.error('Failed to retrieve page dimensions.');
        return;
      }
  
      const { width, height, viewportHeight, devicePixelRatio } = pageDimensions;
  
      // Create a canvas to combine screenshots
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;
  
      let currentY = 0;
      const scrollDelay = 500; // Increased delay between scrolls to ensure page rendering
  
      while (currentY < height) {
        // Scroll the page to the current position
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (y) => window.scrollTo(0, y),
          args: [currentY],
        });
  
        // Wait for the page to render
        await new Promise((resolve) => setTimeout(resolve, scrollDelay));
  
        // Capture the visible portion
        const image = await new Promise((resolve) =>
          chrome.tabs.captureVisibleTab(null, { format: 'png' }, resolve)
        );
  
        const img = await loadImage(image);
  
        // Draw the captured screenshot onto the canvas
        context.drawImage(
          img,
          0,
          0,
          canvas.width,
          viewportHeight * devicePixelRatio,
          0,
          currentY * devicePixelRatio,
          canvas.width,
          viewportHeight * devicePixelRatio
        );
  
        currentY += viewportHeight;
      }
  
      // Generate a full-page screenshot from the canvas
      const fullScreenshot = canvas.toDataURL('image/png');
      setScreenshot(fullScreenshot);
    } catch (error) {
      console.error('Error capturing full-page screenshot:', error);
    }
  };

  const downloadScreenshot = () => {
    const link = document.createElement('a');
    link.href = screenshot;
    link.download = 'screenshot.png';
    link.click();
  };

  return (
    <div style={{ padding: '20px', width: '300px' }}>
      <h2>Screenshot Tool</h2>
      <ScreenshotButton onCapture={captureScreenshot} />
      <FullPageScreenshotButton onCapture={captureFullPageScreenshot} />
    
      {screenshot && (
        <div>
          <img
            src={screenshot}
            alt="Screenshot Preview"
            style={{ width: '100%', margin: '10px 0' }}
          />
          <button onClick={downloadScreenshot} style={{ width: '100%', padding: '8px' }}>
            Download Screenshot
          </button>
        </div>
      )}
    </div>
  );
};

export default App;
