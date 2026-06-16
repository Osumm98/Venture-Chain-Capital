"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export interface UserProfile {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  country: string;
  bio: string;
  avatarUrl: string | null;
  tier: string;
}

interface UserContextType {
  profile: UserProfile;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const defaultProfile: UserProfile = {
  firstName: "Member",
  lastName: "",
  email: "",
  phone: "+27 00 000 0000",
  country: "South Africa",
  bio: "",
  avatarUrl: null,
  tier: "Entry",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({
  children,
  initialProfile,
}: {
  readonly children: ReactNode;
  readonly initialProfile?: Partial<UserProfile>;
}): React.JSX.Element {
  const [profile, setProfile] = useState<UserProfile>({
    ...defaultProfile,
    ...initialProfile,
  });

  const updateProfile = (updates: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{ profile, updateProfile }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
