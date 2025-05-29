'use client';

import React, { useState, useEffect } from 'react';
import { auth, db } from '@/app/lib/firebase';
import { onAuthStateChanged, User } from 'firebase/auth';
import { doc, getDoc, updateDoc, serverTimestamp, collection, query, where, getDocs } from 'firebase/firestore';
import MobileNumberInput from '@/components/PhoneInput';// Import the MobileNumberInput component

interface UserData {
  uid?: string;
  userID?: string;
  name?: string;
  email?: string;
  phone?: string;
  photoURL?: string;
  provider?: string;
  createdAt?: any;
  updatedAt?: any;
}

const Profile = () => {
  const [user, setUser] = useState<User | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: ''
  });
  const [updateMessage, setUpdateMessage] = useState('');
  const [phoneError, setPhoneError] = useState(false); // State for phone number validation

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      setUser(currentUser);
      if (currentUser) {
        try {
          const usersRef = collection(db, 'users');
          const q = query(usersRef, where('uid', '==', currentUser.uid));
          const querySnapshot = await getDocs(q);
          
          if (!querySnapshot.empty) {
            const doc = querySnapshot.docs[0];
            const data = doc.data() as UserData;
            setUserData(data);
            setFormData({
              name: data.name || '',
              email: data.email || '',
              phone: data.phone || ''
            });
          } else {
            const userDocRef = doc(db, 'users', currentUser.uid);
            const userDoc = await getDoc(userDocRef);
            
            if (userDoc.exists()) {
              const data = userDoc.data() as UserData;
              setUserData(data);
              setFormData({
                name: data.name || '',
                email: data.email || '',
                phone: data.phone || ''
              });
            } else {
              setUserData(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handle phone number change from MobileNumberInput
  const handlePhoneChange = (value: string) => {
    setFormData((prev) => ({ ...prev, phone: value }));
    setPhoneError(false); // Reset error when phone changes
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    // Basic phone validation (you can enhance this)
    if (formData.phone && formData.phone.length < 10) {
      setPhoneError(true);
      setUpdateMessage('Please enter a valid phone number');
      return;
    }
    
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      let userDocRef;
      if (!querySnapshot.empty) {
        userDocRef = doc(db, 'users', querySnapshot.docs[0].id);
      } else {
        userDocRef = doc(db, 'users', user.uid);
      }
      
      await updateDoc(userDocRef, {
        ...formData,
        uid: user.uid,
        updatedAt: serverTimestamp()
      });
      
      setUserData((prev) => ({ ...prev, ...formData }));
      setEditing(false);
      setUpdateMessage('Profile updated successfully');
      setTimeout(() => setUpdateMessage(''), 3000);
    } catch (err) {
      console.error('Update failed:', err);
      setUpdateMessage('Update failed. Please try again.');
    }
  };

  if (loading) return (
    <div className="flex justify-center items-center h-screen">
      <div>Loading...</div>
    </div>
  );
  
  if (!user) return (
    <div className="flex justify-center items-center h-screen">
      <div>Please sign in to view your profile</div>
    </div>
  );

  return (
    <div className="container mx-auto mt-20 px-4 py-8 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Your Profile</h1>
      
      {userData ? (
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {userData.userID && (
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500 mb-1">User ID</div>
                <div className="font-medium">{userData.userID}</div>
              </div>
            )}
            
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">Name</div>
              <div className="font-medium">{userData.name || 'Not set'}</div>
            </div>
            
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">Email</div>
              <div className="font-medium">{userData.email || 'Not set'}</div>
            </div>
            
            <div className="p-4 border rounded">
              <div className="text-sm text-gray-500 mb-1">Phone</div>
              <div className="font-medium">{userData.phone || 'Not set'}</div>
            </div>
            
            {userData.provider && (
              <div className="p-4 border rounded">
                <div className="text-sm text-gray-500 mb-1">Provider</div>
                <div className="font-medium">{userData.provider}</div>
              </div>
            )}
          </div>
          
          <div className="flex justify-center">
            <button
              onClick={() => setEditing(!editing)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              {editing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md p-6 text-center">
          <div>No user data found</div>
        </div>
      )}

      {editing && (
        <form onSubmit={handleUpdate} className="mt-6 bg-white rounded-lg shadow-md p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="w-full border rounded p-2 focus:ring-blue-500 focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1" htmlFor="phone">Phone</label>
              <MobileNumberInput
                value={formData.phone}
                onChange={handlePhoneChange}
                error={phoneError}
              />
            </div>

            <div className="flex justify-center">
              <button 
                type="submit" 
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </form>
      )}

      {updateMessage && (
        <div className={`mt-4 p-3 rounded text-center ${updateMessage.includes('failed') ? 'bg-red-100 text-red-700' : 'bg-green-100 text-green-700'}`}>
          {updateMessage}
        </div>
      )}
    </div>
  );
};

export default Profile;