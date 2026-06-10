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
  firstName: "Thabiso",
  lastName: "M",
  email: "thabiso@example.com",
  phone: "+27 82 555 0199",
  country: "South Africa",
  bio: "Tech entrepreneur and early-stage investor.",
  avatarUrl: null,
  tier: "Platinum",
};

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { readonly children: ReactNode }): React.JSX.Element {
  const [profile, setProfile] = useState<UserProfile>(defaultProfile);

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
