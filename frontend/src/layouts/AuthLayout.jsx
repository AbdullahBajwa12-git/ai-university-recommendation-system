import { Outlet, useLocation } from 'react-router-dom';

const AuthLayout = () => {
  const location = useLocation();

  if (location.pathname === '/login' || location.pathname === '/register') {
    return <Outlet />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-2xl bg-card p-8 shadow-xl">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground">
            AI Uni Advisor
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Precision Admissions & Predictive Analytics
          </p>
        </div>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
