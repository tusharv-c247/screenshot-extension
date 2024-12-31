# Screenshot Tool Chrome Extension

## 📸 Screenshot Tool

Screenshot Tool is a simple Chrome extension that allows you to capture screenshots of your current webpage, preview them, and download them directly from the browser. Built with React, this tool provides an intuitive interface to take and save screenshots instantly.

## 🚀 Features

- **Capture Screenshots**: Quickly capture the visible part of any webpage.
- **Preview Before Saving**: See a preview of the screenshot before saving it.
- **Download Screenshot**: Save the screenshot as a PNG file with one click.

## 🛠️ Installation

1. **Clone the Repository**:
    ```bash
    git clone https://github.com/Fatumayattani/screen_extension.git
    cd screen_extension
    ```

2. **Install Dependencies**:
    Install the necessary dependencies for the React app:
    ```bash
    npm install
    ```

3. **Build the Project**:
    ```bash
    npm run build
    ```

4. **Load the Extension in Chrome**:
   - Open **Chrome** and go to `chrome://extensions/`.
   - Enable **Developer Mode** (toggle in the top-right corner).
   - Click **Load unpacked** and select the `build` folder from your project.

5. The Screenshot Tool extension is now installed and ready to use!

## 📖 Usage

1. Click on the Screenshot Tool icon in the Chrome toolbar.
2. In the popup window, click the **Capture Screenshot** button.
3. A preview of the screenshot will appear.
4. Click **Download Screenshot** to save the image to your computer.

## 📂 Project Structure

```
screenshot-tool-extension
├── public
│   ├── manifest.json        # Chrome extension manifest file
│   └── index.html           # HTML for the popup window
└── src
    ├── App.js               # Main app component with screenshot functionality
    ├── ScreenshotButton.js   # Button component to trigger screenshot capture
    └── index.js             # Entry point for React app
```

## 🖥️ Development

To make changes or improvements to the Screenshot Tool:

1. **Start the Development Server**:
    ```bash
    npm start
    ```

   This will start the React app in development mode

2. **Rebuild and Reload in Chrome**:
   After making changes, rebuild the extension using `npm run build`. Then, reload the extension in `chrome://extensions/` by clicking **Reload** under the Screenshot Tool.

## 📜 Manifest File

The `manifest.json` file defines the extension's settings, permissions, and default popup window. Here is a sample configuration used in this project:

```json
{
  "manifest_version": 3,
  "name": "Screenshot Tool",
  "version": "1.0",
  "description": "Take screenshots of your current webpage",
  "permissions": ["activeTab", "scripting"],
  "action": {
    "default_popup": "index.html",
    "default_title": "Screenshot Tool"
  }
}
```

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](https://github.com/Fatumayattani/screen_extension/issues) if you'd like to contribute.

1. Fork the project
2. Create your feature branch: `git checkout -b feature/AmazingFeature`
3. Commit your changes: `git commit -m 'Add some AmazingFeature'`
4. Push to the branch: `git push origin feature/AmazingFeature`
5. Open a pull request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## ✨ Acknowledgments

- Thanks to the [React](https://reactjs.org/) team for providing an awesome JavaScript library.
- Inspired by various open-source screenshot tools for creating a simple and effective solution.

---

Happy capturing! 🖼️

