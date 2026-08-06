import React from 'react';
import { useLoaderData } from 'react-router-dom';
import type { User } from '../../common/types/users';

export const Profile: React.FC = () => {
  // Data automatically populated by requireAuthLoader
  const user = useLoaderData() as User;

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <p><strong>Email:</strong> {user.email}</p>
      {user.name && <p><strong>Name:</strong> {user.name}</p>}
      <pre>{JSON.stringify(user)}</pre>
    </div>
  );
};