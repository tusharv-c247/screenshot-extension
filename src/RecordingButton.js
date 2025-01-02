import React from "react";

const RecordingButton = ({ onStartRecording }) => {
  return (
    <button
      id="startRecordingButton"
      style={{ width: "100%", padding: "8px", marginTop: "10px" }}
      onClick={onStartRecording}
    >
      Start Recording
    </button>
  );
};

export default RecordingButton;
