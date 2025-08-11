import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import FamilyLogin from './components/Auth/FamilyLogin';
import FamilyRegistration from './components/Auth/FamilyRegistration';
import PersonalLogin from './components/Auth/PersonalLogin';
import ProfileCreation from './components/Auth/ProfileCreation';
import FamilyDashboard from './components/Dashboard/FamilyDashboard';

type AuthFlow = 'family-login' | 'family-register' | 'personal-login' | 'profile-create';

const AppContent: React.FC = () => {
  const [authFlow, setAuthFlow] = useState<AuthFlow>('family-login');
  const { family, user } = useAuth();

  // If user is fully logged in, show dashboard
  if (family && user) {
    return <FamilyDashboard />;
  }

  // If family is selected but no user, show personal login
  if (family && !user) {
    return (
      <PersonalLogin
        onBack={() => setAuthFlow('family-login')}
        onCreateProfile={() => setAuthFlow('profile-create')}
      />
    );
  }

  // Show appropriate auth flow
  switch (authFlow) {
    case 'family-register':
      return (
        <FamilyRegistration
          onBack={() => setAuthFlow('family-login')}
          onSuccess={() => setAuthFlow('family-login')}
        />
      );
    case 'profile-create':
      return (
        <ProfileCreation
          onBack={() => setAuthFlow('personal-login')}
          onSuccess={() => setAuthFlow('personal-login')}
        />
      );
    case 'family-login':
    default:
      return (
        <FamilyLogin
          onCreateFamily={() => setAuthFlow('family-register')}
        />
      );
  }
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;