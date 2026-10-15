
import { useState } from "react";
import Cropper from "react-easy-crop";

function ImageCropper({ image, onCropComplete, onCancel }) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const handleCropComplete = (croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleCropButton = () => {
    if (!croppedAreaPixels) return;

    onCropComplete(croppedAreaPixels);
  };

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-[90%] max-w-2xl">

        <h2 className="text-xl font-bold text-[#384358] mb-4">
          Crop Product Image
        </h2>

        <div className="relative w-full h-[400px] bg-black">
          <Cropper
            image={image}
            crop={crop}
            zoom={zoom}
            aspect={4 / 3}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div className="mt-5">
          <label className="block font-medium mb-2">
            Zoom
          </label>

          <input
            type="range"
            min="1"
            max="3"
            step="0.1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-full"
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">

          <button
            type="button"
            onClick={onCancel}
            className="px-5 py-2 rounded-lg border"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCropButton}
            className="px-5 py-2 rounded-lg bg-[#b51a2b] text-white"
          >
            Crop Image
          </button>

        </div>
      </div>
    </div>
  );
}

export default ImageCropper;

