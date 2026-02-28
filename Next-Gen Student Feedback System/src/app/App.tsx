import React, { useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { AuthView } from './components/AuthView';
import { DashboardLayout } from './components/DashboardLayout';
import { StudentDashboard } from './components/dashboard/StudentDashboard';
import { FacultyDashboard } from './components/dashboard/FacultyDashboard';
import { AdminPanel } from './components/dashboard/AdminPanel';
import { LandingPage } from './components/LandingPage';
import { seedDatabase, getUserRole, getAllUsers, updateUserLogin } from './utils/storage';
import { Toaster } from 'sonner';
import { Role } from './types';
import { Loader2 } from 'lucide-react';

// Protected Route Component
const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode; requiredRole?: Role }) => {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      
      if (session?.user) {
        // Get user role from metadata first (fastest), then fallback to storage
        let userRole = session.user.user_metadata?.role;
        
        if (!userRole) {
          userRole = await getUserRole(session.user.id);
        }
        
        // If still no role found, check by email in all users
        if (!userRole) {
          const allUsers = await getAllUsers();
          const user = allUsers.find(u => u.email === session.user.email);
          userRole = user?.role || null;
        }
        
        setRole(userRole);
      }
      
      setLoading(false);
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        // Update user login status when they come online
        updateUserLogin(session.user.id).catch(console.error);
        
        // Get role with fallbacks
        let userRole = session.user.user_metadata?.role;
        if (!userRole) {
          getUserRole(session.user.id).then(setRole).catch(() => {
            // Final fallback: check all users by email
            getAllUsers().then(users => {
              const user = users.find(u => u.email === session.user.email);
              setRole(user?.role || null);
            }).catch(console.error);
          });
        } else {
          setRole(userRole);
        }
      } else {
        setRole(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A6AD8]" />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/" replace />;
  }

  // Allow access if user is authenticated and has any valid role
  // Only restrict if specific role is required and user doesn't have it
  if (requiredRole && role !== requiredRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-bold text-[#2E2E4D] mb-2">Access Denied</h2>
          <p className="text-[#6B6B8A]">You don't have permission to access this page.</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default function App() {
  const [session, setSession] = useState<any>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [loading, setLoading] = useState(true);
  const [showLanding, setShowLanding] = useState(true);

  useEffect(() => {
    // Initialize
    seedDatabase();

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user);
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session?.user) {
        fetchRole(session.user);
      } else {
        setRole(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchRole = async (user: any) => {
    // 1. Check metadata (fastest)
    if (user.user_metadata?.role) {
      setRole(user.user_metadata.role);
      setLoading(false);
      return;
    }
    
    // 2. Check KV Store (fallback)
    const r = await getUserRole(user.id);
    setRole(r || 'student'); // Default to student
    setLoading(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setShowLanding(true); // Show landing page again on logout
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F9FD] flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A6AD8]" />
      </div>
    );
  }

  // Show landing page before login
  if (!session && showLanding) {
    return (
      <>
        <LandingPage onGetStarted={() => setShowLanding(false)} />
        <Toaster position="top-center" />
      </>
    );
  }

  if (!session) {
    return (
      <>
        <AuthView />
        <Toaster position="top-center" />
      </>
    );
  }

  // Dashboard Router based on Role
  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/landing" element={<LandingPage onGetStarted={() => setShowLanding(false)} />} />
        
        <Route element={<DashboardLayout role={role || 'student'} onLogout={handleLogout} />}>
          <Route path="/dashboard" element={
            <ProtectedRoute requiredRole={role || 'student'}>
              {role === 'student' ? <StudentDashboard /> :
               role === 'faculty' ? <FacultyDashboard /> :
               <AdminPanel />}
            </ProtectedRoute>
          } />
          
          <Route path="/admin/*" element={
            <ProtectedRoute requiredRole="admin">
              <AdminPanel />
            </ProtectedRoute>
          } />
          
          <Route path="/faculty/*" element={
            <ProtectedRoute requiredRole="faculty">
              <FacultyDashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/student/*" element={
            <ProtectedRoute requiredRole="student">
              <StudentDashboard />
            </ProtectedRoute>
          } />
        </Route>
        
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
