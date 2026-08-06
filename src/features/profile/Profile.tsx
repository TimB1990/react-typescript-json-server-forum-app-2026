// Profile.tsx
import React, { useState } from 'react';
import { redirect, useLoaderData, useRevalidator } from 'react-router-dom';
import type { User } from '../../common/types/users';
import { UserStore } from '../../store/userStore';
import { AvatarCropModal } from '../../common/components/ui/avatarCropModal/AvatarCropModal';

export const Profile: React.FC = () => {
  const initialUser = useLoaderData() as User;
  const revalidator = useRevalidator(); // 2. Initialize revalidator
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Create a temporary object URL to load into the cropper
    const tempUrl = URL.createObjectURL(file);
    setSelectedImageSrc(tempUrl);
    e.target.value = ''; // Reset input
  };

  const handleCropSave = async (croppedBase64: string) => {
    // Clean up temporary object URL
    if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
    setSelectedImageSrc(null);

    // Save compressed & cropped Base64 via UserStore
    const success = await UserStore.updateAvatar(currentUser.id, croppedBase64);
    if (success) {
      setCurrentUser((prev) => ({ ...prev, avatar: croppedBase64 }));
      revalidator.revalidate();
    }
  };

  return (
    <div className="profile-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>User Profile</h1>

      <div style={{ textAlign: 'center', marginBottom: '20px' }}>
        <img
          src={currentUser.avatar || 'https://via.placeholder.com/150'}
          alt="User Avatar"
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />

        <div style={{ marginTop: '10px' }}>
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
            Change Avatar
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            style={{ display: 'none' }}
          />
        </div>
      </div>

      <p><strong>Email:</strong> {currentUser.email}</p>

      {/* Render Crop Modal when an image is selected */}
      {selectedImageSrc && (
        <AvatarCropModal
          imageSrc={selectedImageSrc}
          onCropComplete={handleCropSave}
          onCancel={() => {
            if (selectedImageSrc) URL.revokeObjectURL(selectedImageSrc);
            setSelectedImageSrc(null);
          }}
        />
      )}
    </div>
  );
};