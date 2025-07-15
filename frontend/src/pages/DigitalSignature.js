import React, { useRef, useState } from "react";
import SignatureCanvas from "react-signature-canvas";
import { Button } from "@mui/material";


const DigitalSignature = () => {
  const sigCanvas = useRef(null);
  const [signature, setSignature] = useState(null);
  const [typedSignature, setTypedSignature] = useState("");
  const [uploadedSignature, setUploadedSignature] = useState(null);
  const [mode, setMode] = useState("draw");

  const clearSignature = () => {
    sigCanvas.current.clear();
    setSignature(null);
    setTypedSignature("");
    setUploadedSignature(null);
  };

  const saveSignature = () => {
    const dataURL = sigCanvas.current.toDataURL("image/png");
    setSignature(dataURL);
  };

  const handleTypedSignature = (e) => {
    setTypedSignature(e.target.value);
  };

  const handleUploadSignature = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setUploadedSignature(event.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="flex flex-col items-center p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Digital Signature</h1>
      <div className="border-2 border-gray-400 rounded-md bg-white p-4 flex flex-col items-center">
        <div className="flex space-x-4 mb-4">
          <Button onClick={() => setMode("draw")} className="bg-blue-500 hover:bg-blue-600">
            Draw
          </Button>
          <Button onClick={() => setMode("type")} className="bg-gray-500 hover:bg-gray-600">
            Type
          </Button>
          <Button onClick={() => setMode("upload")} className="bg-green-500 hover:bg-green-600">
            Upload
          </Button>
        </div>
        {mode === "draw" && (
          <SignatureCanvas
            ref={sigCanvas}
            penColor="black"
            canvasProps={{
              width: 500,
              height: 200,
              className: "sigCanvas bg-white border",
            }}
          />
        )}
        {mode === "type" && (
          <input
            type="text"
            placeholder="Type your signature"
            value={typedSignature}
            onChange={handleTypedSignature}
            className="mt-4 p-2 border rounded-md w-full"
          />
        )}
        {mode === "upload" && (
          <input
            type="file"
            accept="image/*"
            onChange={handleUploadSignature}
            className="mt-2"
          />
        )}
        <div className="mt-4 flex space-x-4">
          <Button onClick={clearSignature} className="bg-red-500 hover:bg-red-600">
            Clear
          </Button>
          <Button onClick={saveSignature} className="bg-blue-500 hover:bg-blue-600">
            Save
          </Button>
        </div>
      </div>
      {signature && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Saved Signature:</h2>
          <img src={signature} alt="Saved Signature" className="border mt-2" />
        </div>
      )}
      {typedSignature && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Typed Signature:</h2>
          <p className="border mt-2 p-2 text-lg font-bold">{typedSignature}</p>
        </div>
      )}
      {uploadedSignature && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold">Uploaded Signature:</h2>
          <img src={uploadedSignature} alt="Uploaded Signature" className="border mt-2" />
        </div>
      )}
    </div>
  );
};

export default DigitalSignature;