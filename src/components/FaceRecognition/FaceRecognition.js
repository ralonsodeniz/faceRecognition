import React from "react";
import FaceBox from "../FaceBox/FaceBox";

const FaceRecognition = ({ imageUrl, box }) => {
  return (
    <div className="flex justify-center ma">
      <div className="absolute mt2">
        <img
          className="b--solid br2 b--gray"
          id="inputImage"
          src={imageUrl}
          alt=""
          width="500px"
          height="auto" // will fit the height to preserve the aspect ratio considering the width
        />
        {box.map((element, elementInex) => {
          return <FaceBox element={element} key={elementInex} />;
        })}
      </div>
    </div>
  );
};

export default FaceRecognition;
