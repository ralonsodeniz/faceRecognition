import React from "react";
import "./FaceBox.css";

const FaceBox = ({ element }) => {
  return (
    <div
      className="bounding-box"
      style={{
        top: element.topRow,
        left: element.leftCol,
        right: element.rightCol,
        bottom: element.bottomRow
      }}
    />
  );
};

export default FaceBox;
