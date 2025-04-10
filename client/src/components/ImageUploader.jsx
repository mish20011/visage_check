import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { CloudArrowUpIcon, PencilSquareIcon, XMarkIcon } from '@heroicons/react/24/outline';
import ReactCrop from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

function ImageUploader({ onFileChange, onUpload }) {
  const [preview, setPreview] = useState(null);
  const [crop, setCrop] = useState({ aspect: 1 }); // Initial crop state (square)
  const [croppedImage, setCroppedImage] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const { getRootProps, getInputProps } = useDropzone({
    onDrop: (acceptedFiles) => {
      const file = acceptedFiles[0];
      onFileChange(file);
      setPreview(URL.createObjectURL(file));
      setCroppedImage(null); // Reset cropped image on new upload
      setIsCropping(false);
    },
    accept: 'image/*',
    maxFiles: 1,
  });

  const handleRemove = () => {
    console.log('Remove button clicked');
    setPreview(null);
    console.log('preview state:', preview); // Log after setting
    setCroppedImage(null);
    setCrop({ aspect: 1 });
    setIsCropping(false);
    onFileChange(null);
    console.log('preview state after all updates:', preview); // Log again after all updates
  };

  const handleCropClick = () => {
    setIsCropping(true);
  };

  const onCropChange = (newCrop) => {
    setCrop(newCrop);
  };

  const onCropComplete = useCallback((newCrop) => {
    setCrop(newCrop);
  }, [setCrop]);

  const generateCroppedImage = useCallback(async () => {
    if (preview && crop?.width && crop?.height) {
      const image = new Image();
      image.src = preview;
      image.onload = async () => {
        const canvas = document.createElement('canvas');
        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        const canvasWidth = Math.round(crop.width / (image.width / image.naturalWidth));
        const canvasHeight = Math.round(crop.height / (image.height / image.naturalHeight));
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        const ctx = canvas.getContext('2d');

        ctx.drawImage(
          image,
          Math.round(crop.x / (image.width / image.naturalWidth)),
          Math.round(crop.y / (image.height / image.naturalHeight)),
          Math.round(crop.width / (image.width / image.naturalWidth)),
          Math.round(crop.height / (image.height / image.naturalHeight)),
          0,
          0,
          canvasWidth,
          canvasHeight
        );

        const croppedDataURL = canvas.toDataURL('image/png');
        setCroppedImage(croppedDataURL);
        setPreview(croppedDataURL);
        setIsCropping(false);

        // Create a new File object from the cropped data URL
        const base64Data = croppedDataURL.split(',')[1];
        const byteString = atob(base64Data);
        const mimeString = croppedDataURL.split(',')[0].split(':')[1].split(';')[0];
        const ab = new ArrayBuffer(byteString.length);
        const ia = new Uint8Array(ab);
        for (let i = 0; i < byteString.length; i++) {
          ia[i] = byteString.charCodeAt(i);
        }
        const croppedFile = new File([ab], 'cropped_image.png', { type: mimeString });
        onFileChange(croppedFile);
      };
    }
  }, [preview, crop, setCroppedImage, setPreview, onFileChange]);

  return (
    <div className="relative">
      <div
        {...(isCropping ? {} : getRootProps())} // Conditionally apply dropzone props
        className={`relative border-2 border-dashed rounded-md p-6 cursor-pointer transition duration-300 ease-in-out ${
          isCropping
            ? 'border-blue-500 bg-blue-900 bg-opacity-50 cursor-default' // No upload cursor
            : preview
            ? 'border-gray-600 bg-gray-800 bg-opacity-50'
            : 'border-gray-600 hover:border-blue-500 bg-gray-800 bg-opacity-50'
        } flex items-center justify-center overflow-hidden`} // Added overflow-hidden
      >
        <input {...getInputProps()} disabled={isCropping} /> {/* Disable input during cropping */}
        {preview && !isCropping ? (
          <img src={preview} alt="Preview" className="max-h-48 object-contain rounded-md" />
        ) : preview && isCropping ? (
          <ReactCrop
            crop={crop}
            onChange={onCropChange}
            onComplete={onCropComplete}
            aspect={1}
            style={{ maxWidth: '100%', maxHeight: '100%' }}
          >
            <img src={preview} alt="Crop" style={{ maxWidth: '100%', maxHeight: '100%' }} />
          </ReactCrop>
        ) : (
          <div className="flex flex-col items-center justify-center text-center text-gray-400">
            <CloudArrowUpIcon className="w-12 h-12 mb-2" />
            <p className="text-lg">Drop Image Here</p>
            <p className="text-sm">- or -</p>
            <p className="text-lg">Click to Upload</p>
          </div>
        )}
      </div>

      {preview && (
        <div className="absolute top-2 right-2 flex space-x-2">
          {!isCropping ? (
            <button onClick={handleCropClick} className="bg-gray-700 hover:bg-gray-600 text-gray-300 p-1 rounded-full focus:outline-none">
              <PencilSquareIcon className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={generateCroppedImage} className="bg-blue-700 hover:bg-blue-600 text-gray-300 p-1 rounded-full focus:outline-none">
              <span>Apply Crop</span>
            </button>
          )}
          <button onClick={handleRemove} className="bg-red-700 hover:bg-red-600 text-gray-300 p-1 rounded-full focus:outline-none">
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}

export default ImageUploader;