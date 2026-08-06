// components/AvatarCropModal.tsx
import React, { useState } from 'react';
import Cropper from 'react-easy-crop';
import { getCroppedImg, type PixelCrop } from '../../../utils/cropImage';

interface Props {
  imageSrc: string;
  onCropComplete: (base64Image: string) => void;
  onCancel: () => void;
}

export const AvatarCropModal: React.FC<Props> = ({ imageSrc, onCropComplete, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<PixelCrop | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleCropComplete = (_: any, croppedPixels: PixelCrop) => {
    setCroppedAreaPixels(croppedPixels);
  };

  const handleSave = async () => {
    if (!croppedAreaPixels) return;

    try {
      setProcessing(true);
      // Crop to 150x150 with 80% JPEG compression (yields small ~20KB-40KB Base64 strings)
      const croppedBase64 = await getCroppedImg(imageSrc, croppedAreaPixels, 150, 0.8);
      onCropComplete(croppedBase64);
    } catch (err) {
      console.error('Failed to crop image', err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={{ position: 'relative', width: '100%', height: '300px', background: '#333' }}>
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            aspect={1} // Square 1:1 ratio
            cropShape="rect" // rect preview
            showGrid={false}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={handleCropComplete}
          />
        </div>

        <div style={{ padding: '15px 0' }}>
          <label style={{ fontSize: '12px' }}>Zoom</label>
          <input
            type="range"
            min={1}
            max={3}
            step={0.1}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            style={{ width: '100%' }}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <button className='link-btn' onClick={onCancel} disabled={processing}>
            Cancel
          </button>
          <button className='link-btn' onClick={handleSave} disabled={processing} style={{ fontWeight: 'bold' }}>
            {processing ? 'Processing...' : 'Save Avatar'}
          </button>
        </div>
      </div>
    </div>
  );
};

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0, left: 0, right: 0, bottom: 0,
  backgroundColor: 'rgba(0,0,0,0.6)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 1000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'oklch(0.25 0.01 264.37)',
  border: '1px solid #2d3748',
  padding: '20px',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '400px',
};