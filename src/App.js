import React, { useState } from "react";
import ScreenshotButton from "./ScreenshotButton";
import FullPageScreenshotButton from "./FullPageScreenshotButton";

const App = () => {
  const [screenshot, setScreenshot] = useState(null);
  const [progress, setProgress] = useState(0); // Track the progress
  const [isCapturing, setIsCapturing] = useState(false);
  const [activeTab, setActiveTab] = useState('capture'); // State to control active tab
  const captureScreenshot = () => {
    chrome.tabs.captureVisibleTab(null, { format: "png" }, (image) => {
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
      setIsCapturing(true); // Show progress bar
      // Get the active tab
      const [tab] = await chrome.tabs.query({
        active: true,
        currentWindow: true,
      });

      // Inject a script to hide fixed/sticky elements and capture the page dimensions
      const [{ result: pageDimensions }] = await chrome.scripting.executeScript(
        {
          target: { tabId: tab.id },
          func: () => {
            // Select all elements with position: fixed or position: sticky
            const elementsToHide = document.querySelectorAll(
              '[style*="position: fixed"], [style*="position: sticky"], .fixed, .sticky, .floating'
            );

            // Store the visibility style to restore later
            const elementsVisibility = [];
            elementsToHide.forEach((el) => {
              elementsVisibility.push({
                element: el,
                visibility: el.style.visibility,
                display: el.style.display,
              });
              el.style.visibility = "hidden"; // Hide the elements
            });

            // Return the page dimensions and the visibility data
            return {
              width: document.documentElement.scrollWidth,
              height: document.documentElement.scrollHeight,
              viewportHeight: window.innerHeight,
              devicePixelRatio: window.devicePixelRatio,
              elementsVisibility, // To restore the visibility of hidden elements later
            };
          },
        }
      );

      if (!pageDimensions) {
        console.error("Failed to retrieve page dimensions.");
        return;
      }

      const {
        width,
        height,
        viewportHeight,
        devicePixelRatio,
        elementsVisibility,
      } = pageDimensions;

      // Create a canvas to combine screenshots
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = width * devicePixelRatio;
      canvas.height = height * devicePixelRatio;

      let currentY = 0;
      const scrollDelay = 500; // Increased delay between scrolls to ensure page rendering

      // Function to check and remove any added class dynamically
      const removeAnyAddedClass = async () => {
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: () => {
            // Use MutationObserver to detect class changes
            const observer = new MutationObserver((mutationsList) => {
              for (const mutation of mutationsList) {
                if (
                  mutation.type === "attributes" &&
                  mutation.attributeName === "class"
                ) {
                  const addedNode = mutation.target;
                  if (addedNode.classList.length > 0) {
                    // If a class was added to any element, remove all classes dynamically
                    addedNode.className = ""; // Clear all classes
                  }
                }
              }
            });

            // Observe the entire body or html for class changes
            observer.observe(document.body, {
              attributes: true,
              subtree: true,
              attributeFilter: ["class"], // Only observe class changes
            });

            // Stop the observer after a delay (so it doesn't run forever)
            setTimeout(() => observer.disconnect(), 1000); // Disconnect after 1 second
          },
        });
      };

      while (currentY < height) {
        // Scroll the page to the current position
        await chrome.scripting.executeScript({
          target: { tabId: tab.id },
          func: (y) => window.scrollTo(0, y),
          args: [currentY],
        });

        // Wait for the page to render and check for any dynamic class additions
        await new Promise((resolve) => setTimeout(resolve, scrollDelay));

        // Remove any dynamically added classes
        await removeAnyAddedClass();

        // Capture the visible portion
        const image = await new Promise((resolve) =>
          chrome.tabs.captureVisibleTab(null, { format: "png" }, resolve)
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

        // Calculate the progress percentage
        const progressPercentage = (currentY / height) * 100;
        setProgress(progressPercentage); // Update the progress bar
      }

      // Generate a full-page screenshot from the canvas
      const fullScreenshot = canvas.toDataURL("image/png");
      setScreenshot(fullScreenshot);

      // Restore the visibility of fixed/sticky elements
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: (elementsVisibility) => {
          elementsVisibility.forEach(({ element, visibility, display }) => {
            element.style.visibility = visibility; // Restore the original visibility style
            element.style.display = display; // Restore the original display style
          });
        },
        args: [elementsVisibility], // Pass visibility data
      });

      // Allow class additions again by resetting the state
      await chrome.scripting.executeScript({
        target: { tabId: tab.id },
        func: () => {
          // Re-enable adding classes to elements by re-attaching the MutationObserver
          const observer = new MutationObserver(() => {});

          // Observe the entire body or html for class changes again
          observer.observe(document.body, {
            attributes: true,
            subtree: true,
            attributeFilter: ["class"],
          });

          // This observer will allow class modifications again
        },
      });

      setIsCapturing(false); // Hide progress bar once screenshot is completed
      setProgress(0); // Reset progress in case of error
    } catch (error) {
      console.error("Error capturing full-page screenshot:", error);
      setIsCapturing(false); // Hide progress bar in case of error
      setProgress(0); // Reset progress in case of error
    }
  };

  const downloadScreenshot = () => {
    const link = document.createElement("a");
    link.href = screenshot;
    link.download = "screenshot.png";
    link.click();
  };

  const startRecording = () => {
    chrome.runtime.sendMessage({ name: 'startRecording' });
  };
  
  document.addEventListener('DOMContentLoaded', () => {
    document.getElementById('startRecordingButton').addEventListener('click', startRecording);
  });
  

  return (
    <div style={{ padding: "20px", width: "300px" }}>
      <h2>Screenshot Tool</h2>
      <ScreenshotButton onCapture={captureScreenshot} />
      <FullPageScreenshotButton onCapture={captureFullPageScreenshot} />
      <button
        id="startRecordingButton"
        style={{ width: "100%", padding: "8px", marginTop: "10px" }}
      >
        Start Recording
      </button>

      {screenshot && (
        <div>
          <img
            src={screenshot}
            alt="Screenshot Preview"
            style={{ width: "100%", margin: "10px 0" }}
          />
          <button
            onClick={downloadScreenshot}
            style={{ width: "100%", padding: "8px" }}
          >
            Download Screenshot
          </button>
        </div>
      )}

      {isCapturing && (
        <div
          style={{
            width: "100%",
            height: "20px",
            backgroundColor: "#f3f3f3",
            borderRadius: "10px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              height: "100%",
              width: `${progress}%`,
              backgroundColor: "#4caf50",
              borderRadius: "10px",
              transition: "width 0.3s ease-in-out",
            }}
          />
          <span
            style={{
              position: "absolute",
              left: "50%",
              transform: "translateX(-50%)",
              color: "#fff",
              fontWeight: "bold",
              fontSize: "14px",
            }}
          >
            {Math.round(progress)}%
          </span>
        </div>
      )}
    </div>
  );
};

export default App;
