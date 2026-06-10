"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { Camera, Upload, User, Mail, Phone, Globe, FileText, CheckCircle2 } from "lucide-react";
import { useUser, type UserProfile } from "@/components/user-provider";

export function ProfileForm(): React.JSX.Element {
  const { profile, updateProfile } = useUser();
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Local Form State initialized from global profile
  const [formData, setFormData] = useState<UserProfile>(profile);

  // Sync if global profile changes (e.g. from elsewhere)
  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Create a local object URL to preview the image immediately
      const url = URL.createObjectURL(file);
      setFormData((prev) => ({ ...prev, avatarUrl: url }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccess(false);

    // Simulate API save
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Update global context
    updateProfile(formData);
    
    setIsSaving(false);
    setSaveSuccess(true);
    
    setTimeout(() => {
      setSaveSuccess(false);
    }, 3000);
  };

  return (
    <div className="glass rounded-2xl p-6 md:p-8">
      <form onSubmit={handleSubmit}>
        
        {/* Profile Image Section */}
        <div className="flex flex-col sm:flex-row items-center gap-6 mb-10 pb-8 border-b border-[var(--color-border-dim)]">
          <div className="relative group">
            <div className="w-24 h-24 rounded-full overflow-hidden bg-[var(--color-surface-2)] border-2 border-[var(--color-border-subtle)] relative flex items-center justify-center">
              {formData.avatarUrl ? (
                <Image
                  src={formData.avatarUrl}
                  alt="Profile Picture"
                  fill
                  className="object-cover"
                />
              ) : (
                <User className="w-10 h-10 text-[var(--color-text-tertiary)]" />
              )}
              {/* Hover Overlay */}
              <div 
                className="absolute inset-0 bg-black/50 backdrop-blur-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center cursor-pointer"
                onClick={() => fileInputRef.current?.click()}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click();
                }}
                role="button"
                tabIndex={0}
              >
                <Camera className="w-6 h-6 text-white mb-1" />
                <span className="text-[10px] text-white font-medium uppercase tracking-wider">Change</span>
              </div>
            </div>
            
            {/* Hidden file input */}
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/png, image/jpeg, image/webp" 
              onChange={handleImageUpload} 
            />
          </div>

          <div className="text-center sm:text-left">
            <h2 className="text-lg font-bold font-[family-name:var(--font-heading)] text-[var(--color-text-primary)]">
              Profile Picture
            </h2>
            <p className="text-sm text-[var(--color-text-tertiary)] mt-1 mb-3">
              Upload a high-resolution image. JPG, PNG or WEBP (Max 5MB).
            </p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-border-subtle)] text-sm font-medium hover:bg-[var(--color-surface-2)] transition-colors duration-200 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              Upload Image
            </button>
          </div>
        </div>

        {/* Form Fields Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6 mb-8">
          {/* First Name */}
          <div className="space-y-2">
            <label htmlFor="firstName" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              First Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Last Name */}
          <div className="space-y-2">
            <label htmlFor="lastName" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Last Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <User className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Mail className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <label htmlFor="phone" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Phone Number
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Phone className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200"
              />
            </div>
          </div>

          {/* Country */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="country" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Country of Residence
            </label>
            <div className="relative max-w-md">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Globe className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <input
                id="country"
                name="country"
                type="text"
                value={formData.country}
                onChange={handleChange}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200"
              />
            </div>
          </div>

          {/* Bio */}
          <div className="space-y-2 md:col-span-2">
            <label htmlFor="bio" className="text-xs font-semibold uppercase tracking-wider text-[var(--color-text-secondary)]">
              Short Bio
            </label>
            <div className="relative">
              <div className="absolute top-3 left-0 pl-4 pointer-events-none">
                <FileText className="w-4 h-4 text-[var(--color-text-tertiary)]" />
              </div>
              <textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="w-full bg-[var(--color-surface-1)] border border-[var(--color-border-subtle)] text-[var(--color-text-primary)] rounded-xl pl-11 pr-4 py-3 text-sm focus:outline-none focus:border-[var(--color-vcc-green)] focus:ring-1 focus:ring-[var(--color-vcc-green)] transition-all duration-200 resize-none"
              />
            </div>
          </div>
        </div>

        {/* Submit Section */}
        <div className="flex items-center justify-end gap-4 pt-6 border-t border-[var(--color-border-dim)]">
          {saveSuccess && (
            <div className="flex items-center gap-2 text-green-500 text-sm font-medium animate-in fade-in slide-in-from-right-4 duration-300">
              <CheckCircle2 className="w-4 h-4" />
              Profile updated
            </div>
          )}
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-[var(--color-vcc-green)] text-white font-bold text-sm hover:bg-green-400 focus:ring-4 focus:ring-green-500/20 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </button>
        </div>

      </form>
    </div>
  );
}
