// Profile.tsx
import React, { useRef, useState } from 'react';
import { useLoaderData, useRevalidator } from 'react-router-dom';
import type { User } from '../../common/types/users';
import { UserStore } from '../../store/userStore';
import { AvatarCropModal } from '../../common/components/ui/avatarCropModal/AvatarCropModal';
import { Card } from '../../common/components/ui/cards/Card';
import { ImageCardItem } from '../../common/components/ui/cards/ImageCardItem';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCircleArrowUp } from '@fortawesome/free-solid-svg-icons';

export const Profile: React.FC = () => {
  const initialUser = useLoaderData() as User;
  const revalidator = useRevalidator(); // 2. Initialize revalidator
  const [currentUser, setCurrentUser] = useState<User>(initialUser);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleButtonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault(); // Prevents form submission if inside a <form>
    fileInputRef.current?.click();
  };

  return (
    <div className="layout">
      <div className="container full-width">
        <div>
          <Card
            header={<h2><strong>{currentUser.username || currentUser.email || 'user'}</strong></h2>}
            content={
              <ImageCardItem
                image={currentUser.avatar || 'https://via.placeholder.com/150'}
                aside={<div style={{ marginTop: '10px' }}>
                  <button
                    className="link-btn"
                    type="button"
                    onClick={handleButtonClick} // Empty handler so it acts purely as a trigger for the label
                    disabled={revalidator.state === 'loading'}
                  >
                    {revalidator.state === 'loading' ? 'Saving...' : 'Change Avatar'}
                    <FontAwesomeIcon icon={faCircleArrowUp} />
                  </button>
                  <input
                    id="avatar-upload"
                    type="file"
                    ref={fileInputRef}
                    accept="image/*"
                    onChange={handleFileSelect}
                    style={{ display: 'none' }}
                  />
                </div>}
                main={<p><strong>Email:</strong> {currentUser.email}</p>}
                options={{ imageShape: "square" }}
              />
            }
          />

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
      </div>
    </div>
  );
};