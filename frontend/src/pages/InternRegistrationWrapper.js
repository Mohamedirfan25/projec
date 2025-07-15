import React, { useState } from 'react';
import InternLists from './InternLists';

const InternRegistrationWrapper = ({ onBack }) => {
  const [showAddForm, setShowAddForm] = useState(true);

  const handleFormComplete = () => {
    setShowAddForm(false);
    if (onBack) {
      onBack(); // Return to parent component
    }
  };

  const handleFormCancel = () => {
    setShowAddForm(false);
    if (onBack) {
      onBack(); // Return to parent component
    }
  };

  // Pass the showAddForm state and handlers to InternLists
  return (
    <InternLists 
      showAddForm={showAddForm}
      onFormComplete={handleFormComplete}
      onFormCancel={handleFormCancel}
    />
  );
};

export default InternRegistrationWrapper;