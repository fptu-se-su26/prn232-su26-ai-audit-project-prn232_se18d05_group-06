import React from 'react';

interface UserProfileWidgetProps {
  avatarOnly?: boolean;
}

const UserProfileWidget: React.FC<UserProfileWidgetProps> = ({ avatarOnly = false }) => {
  const userName = 'Admin User';
  const userRole = 'Administrator';
  const userInitial = userName.charAt(0).toUpperCase();

  if (avatarOnly) {
    return (
      <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-variant/50 rounded-full p-2 transition-colors">
        <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
          {userInitial}
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3 cursor-pointer hover:bg-surface-variant/50 rounded-full p-2 transition-colors">
      <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-bold text-lg">
        {userInitial}
      </div>
      <div className="text-right">
        <p className="text-sm font-bold text-on-surface">{userName}</p>
        <p className="text-xs text-on-surface-variant">{userRole}</p>
      </div>
    </div>
  );
};

export default UserProfileWidget;
