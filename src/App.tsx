  // import { useState, useEffect } from 'react';
  // import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
  // import { supabase } from './lib/supabase';
  // import { Toaster } from '@/components/ui/sonner';

  // // Pages
  // import LandingPage from './pages/LandingPage';
  // import LoginPage from './pages/LoginPage';
  // import RegisterPage from './pages/RegisterPage';
  // import ManagerDashboard from './pages/ManagerDashboard';
  // import UserDashboard from './pages/UserDashboard';
  // import CoursesPage from './pages/CoursesPage';
  // import CourseDetailPage from './pages/CourseDetailPage';

  // // Types
  // interface User {
  //   id: string;
  //   email: string;
  //   role: 'manager' | 'user';
  //   full_name: string;
  // }

  // function App() {
  //   const [user, setUser] = useState<User | null>(null);
  //   const [loading, setLoading] = useState(true);

  //   useEffect(() => {
  //     // Check for existing session
  //     supabase.auth.getSession().then(({ data: { session } }) => {
  //       if (session?.user) {
  //         fetchUserProfile(session.user.id);
  //       } else {
  //         setLoading(false);
  //       }
  //     });

  //     // Listen for auth changes
  //     const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
  //       if (session?.user) {
  //         fetchUserProfile(session.user.id);
  //       } else {
  //         setUser(null);
  //         setLoading(false);
  //       }
  //     });

  //     return () => subscription.unsubscribe();
  //   }, []);

  // const fetchUserProfile = async (_id: string) => {
  //   const {
  //     data: { user },
  //   } = await supabase.auth.getUser();

  //   if (!user) return;

  //   const { data, error } = await supabase
  //     .from('profiles')
  //     .select('*')
  //     .eq('id', user.id)
  //     .limit(1);

  //   if (error) {
  //     console.error('Profile fetch error:', error);
  //     return;
  //   }

  //   if (!data || data.length === 0) {
  //     console.warn('Profile not created yet');
  //     return;
  //   }
  //   useEffect(() => {
  //     // setLoading(false);
  //     setProfile(data[0]);
  //   }, []);

  // };


  //   if (loading) {
  //     return (
  //       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f8f8] to-white">
  //         <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7eca4d]"></div>
  //       </div>
  //     );
  //   }

  //   return (
  //     <Router>
  //       <Toaster position="top-right" />
  //       <Routes>
  //         <Route path="/" element={<LandingPage user={user} />} />
  //         <Route path="/login" element={!user ? <LoginPage /> : <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} />} />
  //         <Route path="/register" element={!user ? <RegisterPage /> : <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} />} />
  //         <Route path="/manager" element={user?.role === 'manager' ? <ManagerDashboard user={user} /> : <Navigate to="/login" />} />
  //         <Route path="/dashboard" element={user?.role === 'user' ? <UserDashboard user={user} /> : <Navigate to="/login" />} />
  //         <Route path="/courses" element={<CoursesPage user={user} />} />
  //         <Route path="/courses/:id" element={<CourseDetailPage user={user} />} />
  //       </Routes>
  //     </Router>
  //   );
  // }

  // export default App;
  // function setProfile(_arg0: any) {
  //   throw new Error('Function not implemented.');
  // }

import { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { supabase } from './lib/supabase';
import { Toaster } from '@/components/ui/sonner';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ManagerDashboard from './pages/ManagerDashboard';
import UserDashboard from './pages/UserDashboard';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';

// Types
interface User {
  id: string;
  email: string;
  role: 'manager' | 'user';
  full_name: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserProfile = async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error) {
      console.error('Profile fetch error:', error);
      setLoading(false);
      return;
    }

    if (!data) {
      console.warn('Profile not created yet');
      setLoading(false);
      return;
    }

    setUser(data);
    setLoading(false);
  };

  useEffect(() => {
    // Initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchUserProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    // Auth listener
    const { data: { subscription } } =
      supabase.auth.onAuthStateChange((_event, session) => {
        if (session?.user) {
          fetchUserProfile(session.user.id);
        } else {
          setUser(null);
          setLoading(false);
        }
      });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#f8f8f8] to-white">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-[#7eca4d]"></div>
      </div>
    );
  }

  return (
    <Router>
      <Toaster position="top-right" />
      <Routes>
        <Route path="/" element={<LandingPage user={user} />} />

        <Route
          path="/login"
          element={
            !user ? (
              <LoginPage />
            ) : (
              <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} />
            )
          }
        />

        <Route
          path="/register"
          element={
            !user ? (
              <RegisterPage />
            ) : (
              <Navigate to={user.role === 'manager' ? '/manager' : '/dashboard'} />
            )
          }
        />

        <Route
          path="/manager"
          element={
            user?.role === 'manager'
              ? <ManagerDashboard user={user} />
              : <Navigate to="/login" />
          }
        />

        <Route
          path="/dashboard"
          element={
            user?.role === 'user'
              ? <UserDashboard user={user} />
              : <Navigate to="/login" />
          }
        />

        <Route path="/courses" element={<CoursesPage user={user} />} />
        <Route path="/courses/:id" element={<CourseDetailPage user={user} />} />
      </Routes>
    </Router>
  );
}

export default App;
