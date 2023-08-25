import React, { createContext, useState } from 'react';

// Create the UserContext
export const UserContext = createContext();

// Create a UserProvider component
export const UserProvider = ({ children }) => {
  // Define the user state
  const [user, setUser] = useState({
    username: '',
    email: '',
    // Add other user information as needed
  });

  // Define functions to update the user information
  const updateUser = (newUser) => {
    setUser(newUser);
  };

  // Provide the user data and update function to child components
  return (
    <UserContext.Provider value={{ user, updateUser }}>
      {children}
    </UserContext.Provider>
  );
};