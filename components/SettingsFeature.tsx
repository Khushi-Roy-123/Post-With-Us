import React, { useState, useEffect } from 'react';
import { Tone, Audience } from '../types';

type Platform = 'LinkedIn' | 'Twitter' | 'Instagram' | 'Facebook';

// Removed ConnectedAccount interface

export const SettingsFeature: React.FC = () => {
  const [defaultTone, setDefaultTone] = useState<Tone>('Professional');
  const [defaultAudience, setDefaultAudience] = useState<Audience>('General Public');
  const [userName, setUserName] = useState(''); // Default empty as requested
  const [saved, setSaved] = useState(false);

  // Social Connections State removed

  useEffect(() => {
    const loadedTone = localStorage.getItem('default_tone');
    const loadedAudience = localStorage.getItem('default_audience');
    const loadedName = localStorage.getItem('user_name');

    if (loadedTone) setDefaultTone(loadedTone as Tone);
    if (loadedAudience) setDefaultAudience(loadedAudience as Audience);
    if (loadedName) setUserName(loadedName);
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('default_tone', defaultTone);
    localStorage.setItem('default_audience', defaultAudience);
    localStorage.setItem('user_name', userName);

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  // Social connection handlers removed

  const PlatformIcon = ({ platform }: { platform: Platform }) => {
    switch (platform) {
      case 'LinkedIn': return <svg className="w-6 h-6 text-blue-700" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
      case 'Twitter': return <svg className="w-6 h-6 text-sky-500" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" /></svg>;
      case 'Facebook': return <svg className="w-6 h-6 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" /></svg>;
      case 'Instagram': return <svg className="w-6 h-6 text-pink-600" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>;
      default: return null;
    }
  };

  return (
    <div className="max-w-4xl mx-auto relative">
      <h2 className="text-3xl font-extrabold text-gray-900 mb-2">Settings</h2>
      <p className="text-gray-500 mb-8">Manage your profile, preferences, and platform integrations.</p>

      {/* Integration Modal */}

      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="p-8">
          <form onSubmit={handleSave} className="space-y-8">

            {/* Social Integrations Section */}
            {/* Social Integrations Section Removed */}

            {/* Profile Section */}
            <div className="pt-2">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Profile Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
                  <input
                    type="text"
                    value={userName}
                    onChange={(e) => setUserName(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Current Plan</label>
                  <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-500 cursor-not-allowed flex justify-between items-center">
                    <span className="font-medium">Pro Plan</span>
                    <span className="text-xs font-bold text-green-700 bg-green-100 px-2 py-1 rounded">Active</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Preferences Section */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-4">Generation Defaults</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Tone</label>
                  <select
                    value={defaultTone}
                    onChange={(e) => setDefaultTone(e.target.value as Tone)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="Professional">Professional</option>
                    <option value="Casual">Casual</option>
                    <option value="Witty">Witty</option>
                    <option value="Enthusiastic">Enthusiastic</option>
                    <option value="Formal">Formal</option>
                    <option value="Empathetic">Empathetic</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Default Audience</label>
                  <select
                    value={defaultAudience}
                    onChange={(e) => setDefaultAudience(e.target.value as Audience)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                  >
                    <option value="General Public">General Public</option>
                    <option value="Industry Experts">Industry Experts</option>
                    <option value="Students">Students</option>
                    <option value="Small Business Owners">Small Business Owners</option>
                    <option value="Tech Enthusiasts">Tech Enthusiasts</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="pt-6 flex items-center justify-end border-t border-gray-100">
              {saved && (
                <span className="mr-4 text-green-600 font-bold animate-fade-in flex items-center">
                  <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                  Changes Saved!
                </span>
              )}
              <button
                type="submit"
                className="px-8 py-3 bg-gray-900 text-white font-bold rounded-xl shadow-lg hover:bg-black transition-all hover:-translate-y-0.5"
              >
                Save Preferences
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};