import React, { useState } from 'react';
import { useLoaderData } from 'react-router-dom';
import type { User } from '../../common/types/users';
import { converFileToBase64 } from '../../common/utils/fileUtils';
import { UserStore } from '../../store';

export const Profile: React.FC = () => {
  // Data automatically populated by requireAuthLoader
  const initialUser = useLoaderData() as User
  const [currentUser, setCurrentUser] = useState<User>(initialUser)
  const [uploading, setUploading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const handleFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setErrorMsg('Image size must be smaller than 2MB')
      return;
    }

    try {
      setUploading(true);
      setErrorMsg(null);

      const base64String = await converFileToBase64(file)
      const success = await UserStore.updateAvatar(currentUser.id, base64String)

      if (success) {
        setCurrentUser((prev) => ({
          ...prev,
          avatar: base64String
        }))
      }
      else {
        setErrorMsg('Failed to update avatar.');
      }
    }
    catch (err) {
      setErrorMsg('Error reading image file.');
    }
    finally {
      setUploading(false);
    }
  }

  return (
    <div className="profile-container" style={{ maxWidth: '400px', margin: '0 auto' }}>
      <h1>User Profile</h1>

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <img
          src={currentUser.avatar || 'https://via.placeholder.com/150'}
          alt="User Avatar"
          style={{ width: '150px', height: '150px', borderRadius: '50%', objectFit: 'cover' }}
        />
        <div style={{ marginTop: '10px' }}>
          <label htmlFor="avatar-upload" style={{ cursor: 'pointer', textDecoration: 'underline' }}>
            {uploading ? 'Uploading...' : 'Change Avatar'}
          </label>
          <input
            id="avatar-upload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            disabled={uploading}
            style={{ display: 'none' }}
          />
        </div>
        {errorMsg && <p style={{ color: 'red', fontSize: '14px' }}>{errorMsg}</p>}
      </div>

      <p><strong>Email:</strong> {currentUser.email}</p>
      {currentUser.username && <p><strong>Username:</strong> {currentUser.username}</p>}
    </div>
  );
};