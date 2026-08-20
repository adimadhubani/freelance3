export const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';
export const TOKEN_KEY = 'aeroview_token';
export const USER_KEY = 'aeroview_user';

export const STATUS_COLORS = {
  Active: 'text-successGreen bg-green-50 border-successGreen',
  Inactive: 'text-textMuted bg-gray-50 border-borderLight',
  Completed: 'text-infoBlue bg-blue-50 border-infoBlue',
  'In Progress': 'text-warningOrange bg-orange-50 border-warningOrange',
};

export const MODULES = [
  { id: '360', name: '360° Tour', path: '360-tour' },
  { id: 'video', name: 'Tour Video', path: 'videos' },
  { id: 'image', name: 'Image Product', path: 'images' },
  { id: 'final', name: 'Final Product', path: 'final-product' },
];
