import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert } from 'lucide-react';

const Unauthorized = () => (
  <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6 text-center">
    <div className="h-16 w-16 rounded-2xl bg-red-50 dark:bg-red-900/20 flex items-center justify-center mb-6">
      <ShieldAlert className="h-8 w-8 text-red-500" />
    </div>
    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Access denied</h1>
    <p className="text-gray-500 mt-2 max-w-md">
      You don't have permission to view this page. If you think this is a mistake, contact your administrator.
    </p>
    <Link
      to="/"
      className="mt-8 inline-flex items-center justify-center rounded-xl bg-primary text-primary-foreground font-semibold h-11 px-6 hover:bg-primary/90 transition-colors"
    >
      Back to Dashboard
    </Link>
  </div>
);

export default Unauthorized;
