import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Award, Settings, LogOut, Search,
  Clock, TrendingUp, GraduationCap, Bell, ChevronDown,
  Play, CheckCircle, Lock, ArrowRight, Users, Menu, X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, type Courses, type Enrollment, type CourseModule, type Message } from '@/lib/supabase';
import { toast } from 'sonner';

interface UserDashboardProps {
  user: { id: string; email: string; role: 'manager' | 'user'; full_name: string };
}

const UserDashboard = ({ user }: UserDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<Courses[]>([]);
  const [myEnrollments, setMyEnrollments] = useState<Enrollment[]>([]);
  const [courseModules, setCourseModules] = useState<Record<string, CourseModule[]>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<Courses | null>(null);
  const [showCourseDetail, setShowCourseDetail] = useState(false);
  const [showEnrollConfirm, setShowEnrollConfirm] = useState(false);
  const [enrollingCourse, setEnrollingCourse] = useState<Courses | null>(null);
  const [notifications] = useState(2);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch all active courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch user's enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*')
        .eq('student_id', user.id);

      if (enrollmentsError) throw enrollmentsError;
      setMyEnrollments(enrollmentsData || []);

      // Fetch modules for enrolled courses
      const enrolledCourseIds = enrollmentsData?.map(e => e.course_id) || [];
      if (enrolledCourseIds.length > 0) {
        const { data: modulesData, error: modulesError } = await supabase
          .from('course_modules')
          .select('*')
          .in('course_id', enrolledCourseIds)
          .order('order_index');

        if (modulesError) throw modulesError;
        
        // Group modules by course
        const modulesByCourse: Record<string, CourseModule[]> = {};
        modulesData?.forEach(module => {
          if (!modulesByCourse[module.course_id]) {
            modulesByCourse[module.course_id] = [];
          }
          modulesByCourse[module.course_id].push(module);
        });
        setCourseModules(modulesByCourse);
      }

      // Fetch user's messages (individual messages and broadcast messages)
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
        .or(`recipient_id.eq.${user.id},is_broadcast.eq.true`)
        .order('created_at', { ascending: false });

      if (messagesError) throw messagesError;
      setMessages(messagesData || []);
    } catch (error: any) {
      toast.error('Failed to fetch data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  const handleMarkMessageAsRead = async (messageId: string) => {
    try {
      const { error } = await supabase
        .from('messages')
        .update({ read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('recipient_id', user.id); // Only allow marking own messages as read

      if (error) throw error;

      // Update local state
      setMessages(prev => prev.map(msg =>
        msg.id === messageId ? { ...msg, read_at: new Date().toISOString() } : msg
      ));
    } catch (error: any) {
      toast.error('Failed to mark message as read');
      console.error(error);
    }
  };

  const handleEnroll = async (course: Course) => {
    try {
      const { error } = await supabase.from('enrollments').insert([{
        student_id: user.id,
        course_id: course.id,
        status: 'pending',
        progress: 0,
      }]);

      if (error) throw error;

      toast.success(`Successfully enrolled in ${course.title}!`);
      setShowEnrollConfirm(false);
      setEnrollingCourse(null);
      fetchData();
    } catch (error: any) {
      if (error.message.includes('unique constraint')) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error(error.message || 'Failed to enroll');
      }
    }
  };

  const isEnrolled = (courseId: string) => {
    return myEnrollments.some(e => e.course_id === courseId);
  };

  const getEnrollmentStatus = (courseId: string) => {
    const enrollment = myEnrollments.find(e => e.course_id === courseId);
    return enrollment?.status;
  };

  const getEnrollmentProgress = (courseId: string) => {
    const enrollment = myEnrollments.find(e => e.course_id === courseId);
    return enrollment?.progress || 0;
  };

  const openCourseDetail = (course: Course) => {
    setSelectedCourse(course);
    setShowCourseDetail(true);
  };

  const confirmEnroll = (course: Course) => {
    setEnrollingCourse(course);
    setShowEnrollConfirm(true);
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (Array.isArray(course.tags) && course.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const myCourses = courses.filter(course => isEnrolled(course.id));
  const availableCourses = courses.filter(course => !isEnrolled(course.id));

  // Stats
  const enrolledCount = myEnrollments.length;
  const completedCount = myEnrollments.filter(e => e.status === 'completed').length;
  const inProgressCount = myEnrollments.filter(e => e.status === 'approved' && e.progress > 0 && e.progress < 100).length;
  const averageProgress = myEnrollments.length > 0
    ? Math.round(myEnrollments.reduce((acc, e) => acc + e.progress, 0) / myEnrollments.length)
    : 0;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'my-courses', label: 'My Courses', icon: BookOpen },
    { id: 'browse', label: 'Browse Courses', icon: Search },
    { id: 'messages', label: 'Messages', icon: Bell },
    { id: 'certificates', label: 'Certificates', icon: Award },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#f8f8f8] flex">
      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <motion.aside
        initial={{ x: -280 }}
        animate={{ x: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-72 bg-white shadow-lg fixed h-full z-50 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold text-[#1a1a1a]">EduManager</span>
          </Link>
        </div>

        <nav className="px-4 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                activeTab === item.id
                  ? 'bg-[#7eca4d] text-white'
                  : 'text-[#4a4a4a] hover:bg-gray-100'
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 left-0 right-0 p-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Logout</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <div className="flex-1 lg:ml-72">
        {/* Header */}
        <header className="bg-white shadow-sm sticky top-0 z-20">
          <div className="flex items-center justify-between px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
              >
                {isMobileMenuOpen ? (
                  <X className="w-6 h-6 text-[#4a4a4a]" />
                ) : (
                  <Menu className="w-6 h-6 text-[#4a4a4a]" />
                )}
              </button>
              <h1 className="text-xl sm:text-2xl font-bold text-[#1a1a1a] capitalize">
                {activeTab.replace('-', ' ')}
              </h1>
            </div>

            <div className="flex items-center gap-4 sm:gap-6">
              <button className="relative">
                <Bell className="w-5 h-5 sm:w-6 sm:h-6 text-[#4a4a4a]" />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {notifications}
                  </span>
                )}
              </button>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  {user.full_name?.charAt(0) || 'U'}
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-[#1a1a1a] text-sm sm:text-base">{user.full_name || 'Student'}</p>
                  <p className="text-xs sm:text-sm text-[#4a4a4a]">{user.email}</p>
                </div>
                <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-[#4a4a4a]" />
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-[#7eca4d]/30 border-t-[#7eca4d] rounded-full animate-spin" />
            </div>
          ) : (
            <AnimatePresence mode="wait">
              {activeTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  {/* Welcome Banner */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="bg-gradient-to-r from-[#7eca4d] to-[#6ab53a] rounded-2xl p-8 text-white"
                  >
                    <h2 className="text-3xl font-bold mb-2">Welcome back, {user.full_name?.split(' ')[0] || 'Student'}! 👋</h2>
                    <p className="text-white/90">Continue your learning journey. You have {enrolledCount} active courses.</p>
                  </motion.div>

                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: 'Enrolled Courses', value: enrolledCount, icon: BookOpen, color: 'bg-blue-500' },
                      { label: 'In Progress', value: inProgressCount, icon: Clock, color: 'bg-yellow-500' },
                      { label: 'Completed', value: completedCount, icon: CheckCircle, color: 'bg-green-500' },
                      { label: 'Avg Progress', value: `${averageProgress}%`, icon: TrendingUp, color: 'bg-purple-500' },
                    ].map((stat, i) => (
                      <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="bg-white rounded-2xl p-6 shadow-sm"
                      >
                        <div className={`w-12 h-12 ${stat.color} rounded-xl flex items-center justify-center mb-4`}>
                          <stat.icon className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-[#4a4a4a] text-sm">{stat.label}</p>
                        <p className="text-3xl font-bold text-[#1a1a1a]">{stat.value}</p>
                      </motion.div>
                    ))}
                  </div>

                  {/* Continue Learning */}
                  {myCourses.length > 0 && (
                    <div>
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-4">Continue Learning</h3>
                      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {myCourses.slice(0, 3).map((course, i) => {
                          const progress = getEnrollmentProgress(course.id);
                          const modules = courseModules[course.id] || [];
                          return (
                            <motion.div
                              key={course.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              transition={{ delay: i * 0.1 }}
                              className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-lg transition-shadow cursor-pointer"
                              onClick={() => openCourseDetail(course)}
                            >
                              <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center">
                                  <BookOpen className="w-6 h-6 text-white" />
                                </div>
                                <span className="px-3 py-1 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-xs font-semibold">
                                  {course.level}
                                </span>
                              </div>
                              <h4 className="font-bold text-[#1a1a1a] mb-2">{course.title}</h4>
                              <p className="text-sm text-[#4a4a4a] mb-4 line-clamp-2">{course.short_description || course.description}</p>
                              
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#4a4a4a]">Progress</span>
                                  <span className="font-semibold text-[#7eca4d]">{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#7eca4d] to-[#6ab53a] rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <p className="text-xs text-[#4a4a4a]">{modules.length} lessons</p>
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Recommended Courses */}
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-bold text-[#1a1a1a]">Recommended for You</h3>
                      <button
                        onClick={() => setActiveTab('browse')}
                        className="text-[#7eca4d] font-semibold hover:underline flex items-center gap-1"
                      >
                        View All <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {availableCourses.slice(0, 3).map((course, i) => (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                        >
                          <div className="h-40 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                            <BookOpen className="w-16 h-16 text-white/50" />
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{course.category}</span>
                              <span className="px-2 py-1 bg-[#7eca4d]/10 text-[#7eca4d] rounded text-xs">{course.level}</span>
                            </div>
                            <h4 className="font-bold text-[#1a1a1a] mb-2">{course.title}</h4>
                            <p className="text-sm text-[#4a4a4a] mb-4 line-clamp-2">{course.short_description || course.description}</p>
                            <div className="flex items-center justify-between">
                              <span className="text-lg font-bold text-[#7eca4d]">${course.price}</span>
                              <Button
                                onClick={() => confirmEnroll(course)}
                                size="sm"
                                className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white"
                              >
                                Enroll Now
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'my-courses' && (
                <motion.div
                  key="my-courses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {myCourses.length === 0 ? (
                    <div className="bg-white rounded-2xl p-12 text-center">
                      <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No courses yet</h3>
                      <p className="text-[#4a4a4a] mb-4">Start your learning journey by enrolling in a course</p>
                      <Button
                        onClick={() => setActiveTab('browse')}
                        className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white"
                      >
                        Browse Courses
                      </Button>
                    </div>
                  ) : (
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {myCourses.map((course, i) => {
                        const progress = getEnrollmentProgress(course.id);
                        const enrollment = myEnrollments.find(e => e.course_id === course.id);
                        const modules = courseModules[course.id] || [];
                        return (
                          <motion.div
                            key={course.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                          >
                            <div className="h-48 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] flex items-center justify-center relative">
                              <BookOpen className="w-20 h-20 text-white/30" />
                              <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  enrollment?.status === 'approved' ? 'bg-green-500 text-white' :
                                  enrollment?.status === 'pending' ? 'bg-yellow-500 text-white' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  {enrollment?.status}
                                </span>
                              </div>
                            </div>
                            <div className="p-6">
                              <h4 className="font-bold text-[#1a1a1a] mb-2 text-lg">{course.title}</h4>
                              <p className="text-sm text-[#4a4a4a] mb-4 line-clamp-2">{course.short_description || course.description}</p>
                              
                              <div className="space-y-3">
                                <div className="flex justify-between text-sm">
                                  <span className="text-[#4a4a4a]">Progress</span>
                                  <span className="font-semibold text-[#7eca4d]">{progress}%</span>
                                </div>
                                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                  <div
                                    className="h-full bg-gradient-to-r from-[#7eca4d] to-[#6ab53a] rounded-full transition-all"
                                    style={{ width: `${progress}%` }}
                                  />
                                </div>
                                <div className="flex items-center justify-between text-sm text-[#4a4a4a]">
                                  <span>{modules.length} lessons</span>
                                  <span>{course.duration}</span>
                                </div>
                              </div>

                              <Button
                                onClick={() => openCourseDetail(course)}
                                className="w-full mt-4 bg-[#7eca4d] hover:bg-[#6ab53a] text-white"
                              >
                                {progress > 0 ? 'Continue Learning' : 'Start Course'}
                              </Button>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'browse' && (
                <motion.div
                  key="browse"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search courses by title, category, or tags..."
                      className="w-full pl-12 pr-4 py-4 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                    />
                  </div>

                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredCourses.map((course, i) => {
                      const enrolled = isEnrolled(course.id);
                      const status = getEnrollmentStatus(course.id);
                      return (
                        <motion.div
                          key={course.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow"
                        >
                          <div className="h-48 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative">
                            <BookOpen className="w-20 h-20 text-white/30" />
                            {enrolled && (
                              <div className="absolute top-4 right-4">
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                  status === 'approved' ? 'bg-green-500 text-white' :
                                  status === 'pending' ? 'bg-yellow-500 text-white' :
                                  'bg-blue-500 text-white'
                                }`}>
                                  {status === 'approved' ? 'Enrolled' : status}
                                </span>
                              </div>
                            )}
                          </div>
                          <div className="p-6">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">{course.category}</span>
                              <span className="px-2 py-1 bg-[#7eca4d]/10 text-[#7eca4d] rounded text-xs">{course.level}</span>
                            </div>
                            <h4 className="font-bold text-[#1a1a1a] mb-2 text-lg">{course.title}</h4>
                            <p className="text-sm text-[#4a4a4a] mb-4 line-clamp-2">{course.short_description || course.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm text-[#4a4a4a] mb-4">
                              <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {course.duration}
                              </span>
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {course.enrolled_students}/{course.max_students}
                              </span>
                            </div>

                            <div className="flex items-center justify-between">
                              <span className="text-xl font-bold text-[#7eca4d]">${course.price}</span>
                              {enrolled ? (
                                <Button
                                  onClick={() => openCourseDetail(course)}
                                  variant="outline"
                                  className="border-[#7eca4d] text-[#7eca4d] hover:bg-[#7eca4d] hover:text-white"
                                >
                                  View Course
                                </Button>
                              ) : (
                                <Button
                                  onClick={() => confirmEnroll(course)}
                                  className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white"
                                >
                                  Enroll Now
                                </Button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>

                  {filteredCourses.length === 0 && (
                    <div className="bg-white rounded-2xl p-12 text-center">
                      <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No courses found</h3>
                      <p className="text-[#4a4a4a]">Try adjusting your search query</p>
                    </div>
                  )}
                </motion.div>
              )}

              {activeTab === 'certificates' && (
                <motion.div
                  key="certificates"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-12 text-center"
                >
                  <Award className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Certificates</h3>
                  <p className="text-[#4a4a4a]">Complete courses to earn certificates!</p>
                </motion.div>
              )}

              {activeTab === 'messages' && (
                <motion.div
                  key="messages"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h2 className="text-xl font-bold text-[#1a1a1a]">Messages</h2>
                    <div className="text-sm text-[#4a4a4a]">
                      {messages.filter(m => !m.read_at).length} unread
                    </div>
                  </div>

                  <div className="space-y-4">
                    {messages.length === 0 ? (
                      <div className="bg-white rounded-2xl p-12 text-center">
                        <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">No messages yet</h3>
                        <p className="text-[#4a4a4a]">Messages from your instructors will appear here</p>
                      </div>
                    ) : (
                      messages.map((message, i) => (
                        <motion.div
                          key={message.id}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.05 }}
                          className={`bg-white rounded-2xl p-6 shadow-sm border-l-4 ${
                            !message.read_at ? 'border-l-[#7eca4d]' : 'border-l-gray-200'
                          }`}
                        >
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex-1">
                              <h4 className="font-bold text-[#1a1a1a] mb-1">{message.subject}</h4>
                              <p className="text-sm text-[#4a4a4a] mb-2">
                                From: {message.is_broadcast ? 'EduManager Team' : 'Your Instructor'} • {new Date(message.created_at).toLocaleDateString()}
                              </p>
                              {!message.read_at && (
                                <span className="inline-block px-2 py-1 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-xs font-semibold mb-2">
                                  New
                                </span>
                              )}
                            </div>
                            {!message.read_at && (
                              <Button
                                onClick={() => handleMarkMessageAsRead(message.id)}
                                size="sm"
                                variant="outline"
                                className="border-[#7eca4d] text-[#7eca4d] hover:bg-[#7eca4d] hover:text-white"
                              >
                                Mark as Read
                              </Button>
                            )}
                          </div>
                          <p className="text-[#4a4a4a] leading-relaxed">{message.message}</p>
                        </motion.div>
                      ))
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl p-12 text-center"
                >
                  <Settings className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#1a1a1a] mb-2">Settings</h3>
                  <p className="text-[#4a4a4a]">Settings feature coming soon!</p>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </main>
      </div>

      {/* Course Detail Modal */}
      <Dialog open={showCourseDetail} onOpenChange={setShowCourseDetail}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {selectedCourse && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">{selectedCourse.title}</DialogTitle>
              </DialogHeader>

              <div className="mt-4 space-y-6">
                <div className="h-64 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center">
                  <BookOpen className="w-24 h-24 text-white/30" />
                </div>

                <div className="flex flex-wrap gap-2">
                  <span className="px-3 py-1 bg-gray-100 text-gray-600 rounded-full text-sm">{selectedCourse.category}</span>
                  <span className="px-3 py-1 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm">{selectedCourse.level}</span>
                  <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-sm">{selectedCourse.duration}</span>
                </div>

                <div>
                  <h4 className="font-bold text-[#1a1a1a] mb-2">About this course</h4>
                  <p className="text-[#4a4a4a]">{selectedCourse.description}</p>
                </div>

                {selectedCourse.requirements && selectedCourse.requirements.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] mb-2">Requirements</h4>
                    <ul className="space-y-2">
                      {selectedCourse.requirements.map((req, i) => (
                        <li key={i} className="flex items-center gap-2 text-[#4a4a4a]">
                          <CheckCircle className="w-4 h-4 text-[#7eca4d]" />
                          {req}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedCourse.learning_outcomes && selectedCourse.learning_outcomes.length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] mb-2">What you'll learn</h4>
                    <ul className="space-y-2">
                      {selectedCourse.learning_outcomes.map((outcome, i) => (
                        <li key={i} className="flex items-center gap-2 text-[#4a4a4a]">
                          <CheckCircle className="w-4 h-4 text-[#7eca4d]" />
                          {outcome}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Course Modules */}
                {courseModules[selectedCourse.id] && courseModules[selectedCourse.id].length > 0 && (
                  <div>
                    <h4 className="font-bold text-[#1a1a1a] mb-2">Course Content</h4>
                    <div className="space-y-2">
                      {courseModules[selectedCourse.id].map((module, i) => (
                        <div key={module.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <div className="w-8 h-8 bg-[#7eca4d]/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-semibold text-[#7eca4d]">{i + 1}</span>
                          </div>
                          <div className="flex-1">
                            <p className="font-semibold text-[#1a1a1a]">{module.title}</p>
                            {module.duration && (
                              <p className="text-sm text-[#4a4a4a]">{module.duration} min</p>
                            )}
                          </div>
                          {module.is_free || isEnrolled(selectedCourse.id) ? (
                            <Play className="w-5 h-5 text-[#7eca4d]" />
                          ) : (
                            <Lock className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t">
                  <div>
                    <p className="text-sm text-[#4a4a4a]">Price</p>
                    <p className="text-3xl font-bold text-[#7eca4d]">${selectedCourse.price}</p>
                  </div>
                  {isEnrolled(selectedCourse.id) ? (
                    <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white px-8">
                      <Play className="w-5 h-5 mr-2" />
                      Start Learning
                    </Button>
                  ) : (
                    <Button
                      onClick={() => {
                        setShowCourseDetail(false);
                        confirmEnroll(selectedCourse);
                      }}
                      className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white px-8"
                    >
                      Enroll Now
                    </Button>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Enroll Confirmation Modal */}
      <Dialog open={showEnrollConfirm} onOpenChange={setShowEnrollConfirm}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a1a1a]">Confirm Enrollment</DialogTitle>
          </DialogHeader>
          {enrollingCourse && (
            <div className="mt-4 space-y-4">
              <p className="text-[#4a4a4a]">
                Are you sure you want to enroll in <strong>{enrollingCourse.title}</strong>?
              </p>
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex justify-between mb-2">
                  <span className="text-[#4a4a4a]">Course Price</span>
                  <span className="font-semibold">${enrollingCourse.price}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#4a4a4a]">Duration</span>
                  <span className="font-semibold">{enrollingCourse.duration}</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  onClick={() => setShowEnrollConfirm(false)}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => handleEnroll(enrollingCourse)}
                  className="flex-1 bg-[#7eca4d] hover:bg-[#6ab53a] text-white"
                >
                  Confirm Enrollment
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserDashboard;
