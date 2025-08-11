import React, { useState } from 'react';
import { Shield, Users, User, Heart, Eye, EyeOff, ArrowLeft } from 'lucide-react';

interface FamilyRegistrationProps {
  onBack: () => void;
  onSuccess: () => void;
}

const FamilyRegistration: React.FC<FamilyRegistrationProps> = ({ onBack, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    family_name: '',
    password: '',
    confirmPassword: '',
    admin_name: '',
    admin_relationship: '',
    admin_has_children: false,
    admin_password: '',
    admin_confirm_password: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    family: false,
    admin: false
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const relationships = [
    'Parent', 'Mother', 'Father', 'Child', 'Son', 'Daughter',
    'Sibling', 'Brother', 'Sister', 'Grandparent', 'Grandchild',
    'Spouse', 'Partner', 'Uncle', 'Aunt', 'Cousin', 'Other'
  ];

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.family_name.trim()) {
      setError('Family name is required');
      return false;
    }
    if (formData.password.length < 6) {
      setError('Family password must be at least 6 characters');
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    return true;
  };

  const validateStep2 = () => {
    if (!formData.admin_name.trim()) {
      setError('Your name is required');
      return false;
    }
    if (!formData.admin_relationship) {
      setError('Please select your relationship');
      return false;
    }
    if (formData.admin_password.length < 6 || !/\d/.test(formData.admin_password)) {
      setError('Your password must be at least 6 characters with at least one number');
      return false;
    }
    if (formData.admin_password !== formData.admin_confirm_password) {
      setError('Personal passwords do not match');
      return false;
    }
    return true;
  };

  const handleStep1Continue = () => {
    if (validateStep1()) {
      setStep(2);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep2()) return;

    setLoading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:3001/api/families/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          family_name: formData.family_name,
          password: formData.password,
          admin_name: formData.admin_name,
          admin_relationship: formData.admin_relationship,
          admin_has_children: formData.admin_has_children,
          admin_password: formData.admin_password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
        <div className="flex items-center mb-6">
          <button
            onClick={step === 1 ? onBack : () => setStep(1)}
            className="flex items-center text-gray-600 hover:text-gray-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-2" />
            Back
          </button>
        </div>

        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {step === 1 ? 'Create Family Account' : 'Set Up Your Profile'}
          </h1>
          <p className="text-gray-600">
            {step === 1 ? 'Step 1 of 2: Family Setup' : 'Step 2 of 2: Admin Profile'}
          </p>
        </div>

        {step === 1 ? (
          <div className="space-y-6">
            <div>
              <label htmlFor="family_name" className="block text-sm font-medium text-gray-700 mb-2">
                Family Name
              </label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="family_name"
                  value={formData.family_name}
                  onChange={(e) => handleInputChange('family_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="e.g., Smith Family"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Family Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPasswords.family ? 'text' : 'password'}
                  id="password"
                  value={formData.password}
                  onChange={(e) => handleInputChange('password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Create family password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, family: !prev.family }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.family ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Family Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPasswords.family ? 'text' : 'password'}
                  id="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm family password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={handleStep1Continue}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              Continue to Profile Setup
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="admin_name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  id="admin_name"
                  value={formData.admin_name}
                  onChange={(e) => handleInputChange('admin_name', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your full name"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="admin_relationship" className="block text-sm font-medium text-gray-700 mb-2">
                Your Relationship to Family
              </label>
              <div className="relative">
                <Heart className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <select
                  id="admin_relationship"
                  value={formData.admin_relationship}
                  onChange={(e) => handleInputChange('admin_relationship', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors appearance-none"
                  required
                >
                  <option value="">Select relationship</option>
                  {relationships.map(rel => (
                    <option key={rel} value={rel}>{rel}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.admin_has_children}
                  onChange={(e) => handleInputChange('admin_has_children', e.target.checked)}
                  className="rounded border-gray-300 text-blue-600 shadow-sm focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-700">I have children</span>
              </label>
            </div>

            <div>
              <label htmlFor="admin_password" className="block text-sm font-medium text-gray-700 mb-2">
                Your Personal Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPasswords.admin ? 'text' : 'password'}
                  id="admin_password"
                  value={formData.admin_password}
                  onChange={(e) => handleInputChange('admin_password', e.target.value)}
                  className="w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Your personal password (6+ chars, 1+ number)"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPasswords(prev => ({ ...prev, admin: !prev.admin }))}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {showPasswords.admin ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Minimum 6 characters with at least one number</p>
            </div>

            <div>
              <label htmlFor="admin_confirm_password" className="block text-sm font-medium text-gray-700 mb-2">
                Confirm Personal Password
              </label>
              <div className="relative">
                <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type={showPasswords.admin ? 'text' : 'password'}
                  id="admin_confirm_password"
                  value={formData.admin_confirm_password}
                  onChange={(e) => handleInputChange('admin_confirm_password', e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                  placeholder="Confirm your password"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
            >
              {loading ? 'Creating Family...' : 'Create Family Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default FamilyRegistration;