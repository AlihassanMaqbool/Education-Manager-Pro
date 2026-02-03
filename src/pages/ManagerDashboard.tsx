import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, BookOpen, Users, Settings, LogOut, Plus, Search,
  Edit, Trash2, TrendingUp,
  GraduationCap, Bell, ChevronDown,
  BarChart3, Award, MessageSquare, Menu, X, CheckCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, type Courses, type Profile, type Enrollment, type Message } from '@/lib/supabase';
import { toast } from 'sonner';

interface ManagerDashboardProps {
  user: { id: string; email: string; role: 'manager' | 'user'; full_name: string };
}

const ManagerDashboard = ({ user }: ManagerDashboardProps) => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [courses, setCourses] = useState<Courses[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [student, setStudent] = useState<Profile[]>([]);
  const [studentDetails, setStudentDetails] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState(true);
  const [showCourseModal, setShowCourseModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Courses | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Messages state
  const [messages, setMessages] = useState<Message[]>([]);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageForm, setMessageForm] = useState({
    subject: '',
    message: '',
    is_broadcast: false,
    recipient_id: '',
  });

  // Course form state
  const [courseForm, setCourseForm] = useState({
    title: '',
    description: '',
    short_description: '',
    category: '',
    level: 'beginner',
    duration: '',
    price: '',
    max_students: '50',
    status: 'draft',
    requirements: '',
    learning_outcomes: '',
    tags: '',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch courses
      const { data: coursesData, error: coursesError } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (coursesError) throw coursesError;
      setCourses(coursesData || []);

      // Fetch enrollments
      const { data: enrollmentsData, error: enrollmentsError } = await supabase
        .from('enrollments')
        .select('*');

      if (enrollmentsError) throw enrollmentsError;
      setEnrollments(enrollmentsData || []);

      // Fetch students
      const { data: studentsData, error: studentsError } = await supabase
        .from('students')
        .select('*')
        // .eq('role', 'user');

      if (studentsError) throw studentsError;
      setStudent(studentsData || []);

      // Fetch student details from students table
      if (studentsData && studentsData.length > 0) {
        const studentIds = studentsData.map(s => s.id);
        await fetchStudentDetails(studentIds);

        // Ensure all users with role 'user' are in the students table
        const { data: existingStudents } = await supabase
          .from('students')
          .select('id')
          .in('id', studentIds);

        const existingStudentIds = existingStudents?.map(s => s.id) || [];
        const missingStudentIds = studentIds.filter(id => !existingStudentIds.includes(id));

        // Add missing students to students table
        if (missingStudentIds.length > 0) {
          const studentsToInsert = missingStudentIds.map(id => ({ id }));
          await supabase.from('students').insert(studentsToInsert);
          // Refresh student details after adding new students
          await fetchStudentDetails(studentIds);
        }
      }

      // Fetch messages
      const { data: messagesData, error: messagesError } = await supabase
        .from('messages')
        .select('*')
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

  const fetchStudentDetails = async (studentIds: string[]) => {
    if (studentIds.length === 0) return;

    const { data: studentDetailsData } = await supabase
      .from('students')
      .select('*')
      .in('id', studentIds);

    // Create a map of student details
    const detailsMap: Record<string, any> = {};
    studentDetailsData?.forEach(detail => {
      detailsMap[detail.id] = detail;
    });
    setStudentDetails(detailsMap);
  };

  const handleToggleStudentStatus = async (studentId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('students')
        .update({ is_active: !currentStatus })
        .eq('id', studentId);

      if (error) throw error;

      // Refresh student details
      const studentIds = student.map(s => s.id);
      await fetchStudentDetails(studentIds);

      toast.success(`Student ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
    } catch (error: any) {
      toast.error('Failed to update student status');
      console.error(error);
    }
  };

  const handleViewStudent = (_student: Profile) => {
    // TODO: Implement student detail view
    toast.info('Student detail view coming soon');
  };

  const handleEditStudent = (_student: Profile) => {
    // TODO: Implement student edit functionality
    toast.info('Student edit functionality coming soon');
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
    toast.success('Logged out successfully');
  };

  // Message handlers
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const messageData = {
        sender_id: user.id,
        subject: messageForm.subject,
        message: messageForm.message,
        is_broadcast: messageForm.is_broadcast,
        ...(messageForm.is_broadcast ? {} : { recipient_id: messageForm.recipient_id }),
      };

      const { error } = await supabase
        .from('messages')
        .insert(messageData);

      if (error) throw error;

      toast.success(messageForm.is_broadcast ? 'Broadcast message sent to all students!' : 'Message sent successfully!');
      setShowMessageModal(false);
      resetMessageForm();
      fetchData(); // Refresh messages
    } catch (error: any) {
      toast.error(error.message || 'Failed to send message');
    }
  };

  const resetMessageForm = () => {
    setMessageForm({
      subject: '',
      message: '',
      is_broadcast: false,
      recipient_id: '',
    });
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const newCourse = {
        title: courseForm.title,
        description: courseForm.description,
        short_description: courseForm.short_description,
        category: courseForm.category,
        level: courseForm.level,
        duration: courseForm.duration,
        price: parseFloat(courseForm.price) || 0,
        max_students: parseInt(courseForm.max_students) || 50,
        status: courseForm.status as 'active' | 'inactive' | 'draft',
        instructor_id: user.id,
        requirements: courseForm.requirements.split(',').map(r => r.trim()).filter(Boolean),
        learning_outcomes: courseForm.learning_outcomes.split(',').map(o => o.trim()).filter(Boolean),
        tags: courseForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const { error } = await supabase.from('courses').insert([newCourse]);
      if (error) throw error;

      toast.success('Course created successfully!');
      setShowCourseModal(false);
      resetCourseForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to create course');
    }
  };

  const handleUpdateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCourse) return;

    try {
      const updatedCourse = {
        title: courseForm.title,
        description: courseForm.description,
        short_description: courseForm.short_description,
        category: courseForm.category,
        level: courseForm.level,
        duration: courseForm.duration,
        price: parseFloat(courseForm.price) || 0,
        max_students: parseInt(courseForm.max_students) || 50,
        status: courseForm.status as 'active' | 'inactive' | 'draft',
        requirements: courseForm.requirements.split(',').map(r => r.trim()).filter(Boolean),
        learning_outcomes: courseForm.learning_outcomes.split(',').map(o => o.trim()).filter(Boolean),
        tags: courseForm.tags.split(',').map(t => t.trim()).filter(Boolean),
      };

      const { error } = await supabase
        .from('courses')
        .update(updatedCourse)
        .eq('id', editingCourse.id);

      if (error) throw error;

      toast.success('Course updated successfully!');
      setShowCourseModal(false);
      setEditingCourse(null);
      resetCourseForm();
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update course');
    }
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;

      toast.success('Course deleted successfully!');
      fetchData();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete course');
    }
  };

  const openEditModal = (course: Courses) => {
    setEditingCourse(course);
    setCourseForm({
      title: course.title,
      description: course.description,
      short_description: course.short_description || '',
      category: course.category || '',
      level: course.level || 'beginner',
      duration: course.duration || '',
      price: course.price?.toString() || '0',
      max_students: course.max_students?.toString() || '50',
      status: course.status || 'draft',
      requirements: Array.isArray(course.requirements) ? course.requirements.join(', ') : (course.requirements || ''),
      learning_outcomes: Array.isArray(course.learning_outcomes) ? course.learning_outcomes.join(', ') : (course.learning_outcomes || ''),
      tags: Array.isArray(course.tags) ? course.tags.join(', ') : (course.tags || ''),
    });
    setShowCourseModal(true);
  };

  const resetCourseForm = () => {
    setCourseForm({
      title: '',
      description: '',
      short_description: '',
      category: '',
      level: 'beginner',
      duration: '',
      price: '',
      max_students: '50',
      status: 'draft',
      requirements: '',
      learning_outcomes: '',
      tags: '',
    });
  };

  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    course.category?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Stats
  const totalStudents = student.length;
  const totalCourses = courses.length;
  const totalEnrollments = enrollments.length;
  const activeCourses = courses.filter(c => c.status === 'active').length;

  const sidebarItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'courses', label: 'Courses', icon: BookOpen },
    { id: 'students', label: 'Students', icon: Users },
    { id: 'enrollments', label: 'Enrollments', icon: Award },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'messages', label: 'Messages', icon: MessageSquare },
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
                <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-full flex items-center justify-center text-white font-semibold text-sm sm:text-base">
                  {user.full_name?.charAt(0) || 'M'}
                </div>
                <div className="hidden sm:block">
                  <p className="font-semibold text-[#1a1a1a] text-sm sm:text-base">{user.full_name || 'Manager'}</p>
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
                  {/* Stats Cards */}
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                    {[
                      { label: 'Total Students', value: totalStudents, icon: Users, color: 'bg-blue-500' },
                      { label: 'Total Courses', value: totalCourses, icon: BookOpen, color: 'bg-purple-500' },
                      { label: 'Enrollments', value: totalEnrollments, icon: Award, color: 'bg-[#7eca4d]' },
                      { label: 'Active Courses', value: activeCourses, icon: TrendingUp, color: 'bg-orange-500' },
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

                  {/* Recent Activity */}
                  <div className="grid gap-6 lg:grid-cols-2">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Recent Enrollments</h3>
                      <div className="space-y-4">
                        {enrollments.slice(0, 5).map((enrollment, i) => (
                          <div key={enrollment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-[#1a1a1a]">Student ID: {enrollment.student_id.slice(0, 8)}</p>
                                <p className="text-sm text-[#4a4a4a]">Course ID: {enrollment.course_id.slice(0, 8)}</p>
                              </div>
                            </div>
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                              enrollment.status === 'approved' ? 'bg-green-100 text-green-600' :
                              enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                              'bg-gray-100 text-gray-600'
                            }`}>
                              {enrollment.status}
                            </span>
                          </div>
                        ))}
                        {enrollments.length === 0 && (
                          <p className="text-center text-[#4a4a4a] py-8">No enrollments yet</p>
                        )}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Popular Courses</h3>
                      <div className="space-y-4">
                        {courses.slice(0, 5).map((course, i) => (
                          <div key={course.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                                {i + 1}
                              </div>
                              <div>
                                <p className="font-semibold text-[#1a1a1a]">{course.title}</p>
                                <p className="text-sm text-[#4a4a4a]">{course.enrolled_students} students enrolled</p>
                              </div>
                            </div>
                            <span className="text-[#7eca4d] font-semibold">${course.price}</span>
                          </div>
                        ))}
                        {courses.length === 0 && (
                          <p className="text-center text-[#4a4a4a] py-8">No courses yet</p>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {activeTab === 'courses' && (
                <motion.div
                  key="courses"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className="flex flex-col gap-4">
                    <div className="relative">
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search courses..."
                        className="pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all w-full"
                      />
                    </div>
                    <Button
                      onClick={() => {
                        setEditingCourse(null);
                        resetCourseForm();
                        setShowCourseModal(true);
                      }}
                      className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-xl w-full sm:w-auto"
                    >
                      <Plus className="w-5 h-5 mr-2" />
                      Create Course
                    </Button>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Course</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Category</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Price</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Students</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Status</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {filteredCourses.map((course) => (
                            <tr key={course.id} className="hover:bg-gray-50">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-lg flex items-center justify-center">
                                    <BookOpen className="w-5 h-5 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#1a1a1a] text-sm sm:text-base">{course.title}</p>
                                    <p className="text-xs sm:text-sm text-[#4a4a4a]">{course.duration}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">{course.category}</td>
                              <td className="px-4 sm:px-6 py-4 font-semibold text-[#7eca4d] text-sm">${course.price}</td>
                              <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">{course.enrolled_students}/{course.max_students}</td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                  course.status === 'active' ? 'bg-green-100 text-green-600' :
                                  course.status === 'draft' ? 'bg-yellow-100 text-yellow-600' :
                                  'bg-gray-100 text-gray-600'
                                }`}>
                                  {course.status}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-1 sm:gap-2">
                                  <button
                                    onClick={() => openEditModal(course)}
                                    className="p-2 hover:bg-blue-50 rounded-lg text-blue-500 transition-colors"
                                  >
                                    <Edit className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteCourse(course.id)}
                                    className="p-2 hover:bg-red-50 rounded-lg text-red-500 transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    {filteredCourses.length === 0 && (
                      <div className="text-center py-12">
                        <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-[#4a4a4a]">No courses found</p>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}

              {activeTab === 'students' && (
                <motion.div
                  key="students"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Students Statistics */}
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                          <Users className="w-6 h-6 text-blue-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#1a1a1a]">{student.length}</p>
                          <p className="text-[#4a4a4a] text-sm">Total Students</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1 }}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#1a1a1a]">
                            {student.filter(s => studentDetails[s.id]?.is_active !== false).length}
                          </p>
                          <p className="text-[#4a4a4a] text-sm">Active Students</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.2 }}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-purple-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#1a1a1a]">
                            {enrollments.filter(e => e.status === 'approved').length}
                          </p>
                          <p className="text-[#4a4a4a] text-sm">Total Enrollments</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.3 }}
                      className="bg-white rounded-2xl p-6 shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                          <TrendingUp className="w-6 h-6 text-orange-600" />
                        </div>
                        <div>
                          <p className="text-2xl font-bold text-[#1a1a1a]">
                            {student.length > 0 ? Math.round((enrollments.filter(e => e.status === 'approved').length / student.length) * 10) / 10 : 0}
                          </p>
                          <p className="text-[#4a4a4a] text-sm">Avg Enrollments</p>
                        </div>
                      </div>
                    </motion.div>
                  </div>

                  {/* Students Table */}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="bg-white rounded-2xl shadow-sm overflow-hidden"
                  >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[800px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Student</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Email</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Status</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Joined</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Enrollments</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {student.map((students) => {
                          const studentDetail = studentDetails[students.id];
                          const enrollmentCount = enrollments.filter(e => e.student_id === students.id).length;
                          const isActive = studentDetail?.is_active !== false; // Default to true if not set

                          return (
                            <tr key={students.id} className="hover:bg-gray-50">
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                      {students.full_name?.charAt(0) || 'S'}
                                  </div>
                                  <div>
                                    <p className="font-semibold text-[#1a1a1a] text-sm sm:text-base">{students.full_name || 'Unknown'}</p>
                                    <p className="text-xs text-[#4a4a4a]">ID: {students.id.slice(0, 8)}...</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">{students.email}</td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                  isActive
                                    ? 'bg-green-100 text-green-800'
                                    : 'bg-red-100 text-red-800'
                                }`}>
                                  {isActive ? 'Active' : 'Inactive'}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">
                                <div>
                                  <p>{new Date(students.created_at).toLocaleDateString()}</p>
                                  {studentDetail?.enrollment_date && (
                                    <p className="text-xs text-gray-500">
                                      Enrolled: {new Date(studentDetail.enrollment_date).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className="px-3 py-1 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold">
                                  {enrollmentCount} course{enrollmentCount !== 1 ? 's' : ''}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleViewStudent(students)}
                                    className="text-[#7eca4d] hover:text-[#6ab53a] text-sm font-medium"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => handleEditStudent(students)}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                  >
                                    Edit
                                  </button>
                                  <button
                                    onClick={() => handleToggleStudentStatus(students.id, isActive)}
                                    className={`text-sm font-medium ${
                                      isActive
                                        ? 'text-red-600 hover:text-red-800'
                                        : 'text-green-600 hover:text-green-800'
                                    }`}
                                  >
                                    {isActive ? 'Deactivate' : 'Activate'}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  {student.length === 0 && (
                    <div className="text-center py-12">
                      <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-[#4a4a4a]">No students found</p>
                    </div>
                  )}
                  </motion.div>
                </motion.div>
              )}

              {activeTab === 'enrollments' && (
                <motion.div
                  key="enrollments"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-2xl shadow-sm overflow-hidden"
                >
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[700px]">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Student</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Course</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Status</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Progress</th>
                          <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Enrolled Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {enrollments.map((enrollment) => {
                          const students = student.find(s => s.id === enrollment.student_id);
                          const course = courses.find(c => c.id === enrollment.course_id);
                          return (
                            <tr key={enrollment.id} className="hover:bg-gray-50">
                              <td className="px-4 sm:px-6 py-4 font-semibold text-[#1a1a1a] text-sm">
                                {students?.full_name || 'Unknown'}
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">{course?.title || 'Unknown'}</td>
                              <td className="px-4 sm:px-6 py-4">
                                <span className={`px-2 sm:px-3 py-1 rounded-full text-xs font-semibold ${
                                  enrollment.status === 'approved' ? 'bg-green-100 text-green-600' :
                                  enrollment.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                                  enrollment.status === 'rejected' ? 'bg-red-100 text-red-600' :
                                  'bg-blue-100 text-blue-600'
                                }`}>
                                  {enrollment.status}
                                </span>
                              </td>
                              <td className="px-4 sm:px-6 py-4">
                                <div className="flex items-center gap-2">
                                  <div className="w-16 sm:w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#7eca4d] rounded-full"
                                      style={{ width: `${enrollment.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs sm:text-sm text-[#4a4a4a]">{enrollment.progress}%</span>
                                </div>
                              </td>
                              <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">
                                {new Date(enrollment.created_at).toLocaleDateString()}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </motion.div>
              )}

              {activeTab === 'analytics' && (
                <motion.div
                  key="analytics"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-8"
                >
                  <div className="grid md:grid-cols-2 gap-8">
                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Enrollment Trends</h3>
                      <div className="h-64 flex items-end justify-around">
                        {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((height, i) => (
                          <div
                            key={i}
                            className="w-8 bg-gradient-to-t from-[#7eca4d] to-[#6ab53a] rounded-t-lg"
                            style={{ height: `${height}%` }}
                          />
                        ))}
                      </div>
                      <div className="flex justify-around mt-4 text-sm text-[#4a4a4a]">
                        {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map(m => (
                          <span key={m}>{m}</span>
                        ))}
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl p-6 shadow-sm">
                      <h3 className="text-lg font-bold text-[#1a1a1a] mb-4">Course Categories</h3>
                      <div className="space-y-4">
                        {['Technology', 'Business', 'Design', 'Marketing', 'Other'].map((cat, i) => {
                          const count = courses.filter(c => c.category?.toLowerCase().includes(cat.toLowerCase())).length;
                          const percentage = courses.length > 0 ? (count / courses.length) * 100 : 0;
                          return (
                            <div key={cat}>
                              <div className="flex justify-between mb-1">
                                <span className="text-sm text-[#4a4a4a]">{cat}</span>
                                <span className="text-sm font-semibold text-[#1a1a1a]">{count}</span>
                              </div>
                              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div
                                  className="h-full rounded-full"
                                  style={{ 
                                    width: `${percentage}%`,
                                    backgroundColor: ['#7eca4d', '#3b82f6', '#8b5cf6', '#f48c24', '#6b7280'][i]
                                  }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
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
                  <div className="flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <h2 className="text-xl font-bold text-[#1a1a1a]">Messages</h2>
                      <Button
                        onClick={() => {
                          resetMessageForm();
                          setShowMessageModal(true);
                        }}
                        className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-xl"
                      >
                        <MessageSquare className="w-5 h-5 mr-2" />
                        Send Message
                      </Button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[800px]">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Subject</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Recipient</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Type</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Sent Date</th>
                            <th className="px-4 sm:px-6 py-4 text-left text-sm font-semibold text-[#4a4a4a]">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                          {messages.map((message) => {
                            const recipient = message.is_broadcast
                              ? { full_name: 'All Students', email: 'broadcast' }
                              : student.find(s => s.id === message.recipient_id);

                            return (
                              <tr key={message.id} className="hover:bg-gray-50">
                                <td className="px-4 sm:px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center">
                                      <MessageSquare className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                      <p className="font-semibold text-[#1a1a1a] text-sm sm:text-base">{message.subject}</p>
                                      <p className="text-xs sm:text-sm text-[#4a4a4a] line-clamp-1">{message.message}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">
                                  {recipient?.full_name || 'Unknown'}
                                  {recipient?.email && recipient.email !== 'broadcast' && (
                                    <p className="text-xs text-gray-500">{recipient.email}</p>
                                  )}
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                                    message.is_broadcast
                                      ? 'bg-purple-100 text-purple-600'
                                      : 'bg-blue-100 text-blue-600'
                                  }`}>
                                    {message.is_broadcast ? 'Broadcast' : 'Individual'}
                                  </span>
                                </td>
                                <td className="px-4 sm:px-6 py-4 text-[#4a4a4a] text-sm">
                                  {new Date(message.created_at).toLocaleDateString()}
                                </td>
                                <td className="px-4 sm:px-6 py-4">
                                  <span className="px-3 py-1 bg-green-100 text-green-600 rounded-full text-sm font-semibold">
                                    Sent
                                  </span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {messages.length === 0 && (
                      <div className="text-center py-12">
                        <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <p className="text-[#4a4a4a]">No messages sent yet</p>
                        <p className="text-sm text-gray-500 mt-2">Send your first message to students</p>
                      </div>
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
                  className="bg-white rounded-2xl p-12 shadow-sm text-center"
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

      {/* Course Modal */}
      <Dialog open={showCourseModal} onOpenChange={setShowCourseModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
              {editingCourse ? 'Edit Course' : 'Create New Course'}
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={editingCourse ? handleUpdateCourse : handleCreateCourse} className="space-y-6 mt-4">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Course Title *</label>
                <input
                  type="text"
                  value={courseForm.title}
                  onChange={(e) => setCourseForm({ ...courseForm, title: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                  placeholder="e.g., Introduction to Web Development"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Category</label>
                <input
                  type="text"
                  value={courseForm.category}
                  onChange={(e) => setCourseForm({ ...courseForm, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                  placeholder="e.g., Technology"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Description *</label>
              <textarea
                value={courseForm.description}
                onChange={(e) => setCourseForm({ ...courseForm, description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all resize-none"
                rows={3}
                placeholder="Detailed course description"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Short Description</label>
              <input
                type="text"
                value={courseForm.short_description}
                onChange={(e) => setCourseForm({ ...courseForm, short_description: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                placeholder="Brief summary (100 chars max)"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Level</label>
                <select
                  value={courseForm.level}
                  onChange={(e) => setCourseForm({ ...courseForm, level: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all bg-white"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Duration</label>
                <input
                  type="text"
                  value={courseForm.duration}
                  onChange={(e) => setCourseForm({ ...courseForm, duration: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                  placeholder="e.g., 8 weeks"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Status</label>
                <select
                  value={courseForm.status}
                  onChange={(e) => setCourseForm({ ...courseForm, status: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all bg-white"
                >
                  <option value="draft">Draft</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Price ($)</label>
                <input
                  type="number"
                  value={courseForm.price}
                  onChange={(e) => setCourseForm({ ...courseForm, price: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Max Students</label>
                <input
                  type="number"
                  value={courseForm.max_students}
                  onChange={(e) => setCourseForm({ ...courseForm, max_students: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                  placeholder="50"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Requirements (comma-separated)</label>
              <input
                type="text"
                value={courseForm.requirements}
                onChange={(e) => setCourseForm({ ...courseForm, requirements: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                placeholder="e.g., Basic computer skills, Internet connection"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Learning Outcomes (comma-separated)</label>
              <input
                type="text"
                value={courseForm.learning_outcomes}
                onChange={(e) => setCourseForm({ ...courseForm, learning_outcomes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                placeholder="e.g., Build websites, Learn JavaScript, Deploy applications"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Tags (comma-separated)</label>
              <input
                type="text"
                value={courseForm.tags}
                onChange={(e) => setCourseForm({ ...courseForm, tags: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                placeholder="e.g., web development, javascript, programming"
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowCourseModal(false);
                  setEditingCourse(null);
                  resetCourseForm();
                }}
                className="flex-1 rounded-xl py-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-xl py-6"
              >
                {editingCourse ? 'Update Course' : 'Create Course'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Message Modal */}
      <Dialog open={showMessageModal} onOpenChange={setShowMessageModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#1a1a1a]">
              Send Message
            </DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSendMessage} className="space-y-6 mt-4">
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Message Type</label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="messageType"
                    checked={!messageForm.is_broadcast}
                    onChange={() => setMessageForm({ ...messageForm, is_broadcast: false })}
                    className="text-[#7eca4d] focus:ring-[#7eca4d]"
                  />
                  <span className="text-sm">Individual Student</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="radio"
                    name="messageType"
                    checked={messageForm.is_broadcast}
                    onChange={() => setMessageForm({ ...messageForm, is_broadcast: true })}
                    className="text-[#7eca4d] focus:ring-[#7eca4d]"
                  />
                  <span className="text-sm">Broadcast to All Students</span>
                </label>
              </div>
            </div>

            {!messageForm.is_broadcast && (
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Select Student *</label>
                <select
                  value={messageForm.recipient_id}
                  onChange={(e) => setMessageForm({ ...messageForm, recipient_id: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all bg-white"
                  required={!messageForm.is_broadcast}
                >
                  <option value="">Choose a student...</option>
                  {student.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.full_name || s.email}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Subject *</label>
              <input
                type="text"
                value={messageForm.subject}
                onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
                placeholder="Message subject"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Message *</label>
              <textarea
                value={messageForm.message}
                onChange={(e) => setMessageForm({ ...messageForm, message: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all resize-none"
                rows={6}
                placeholder="Type your message here..."
                required
              />
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowMessageModal(false);
                  resetMessageForm();
                }}
                className="flex-1 rounded-xl py-6"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-xl py-6"
              >
                Send Message
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManagerDashboard;
