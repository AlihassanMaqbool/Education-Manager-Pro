
import { Link, useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BookOpen, Clock, Users, Star, CheckCircle, Play, Lock,
  GraduationCap, ArrowLeft, Award, Calendar, Globe,
  User, Check, ChevronDown, ChevronUp
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase, type Courses, type Enrollment, type CourseModule } from '@/lib/supabase';
import { toast } from 'sonner';
import { useEffect, useState, type JSXElementConstructor, type Key, type ReactElement, type ReactNode, type ReactPortal } from 'react';

interface CourseDetailPageProps {
  user: { id: string; email: string; role: 'manager' | 'user'; full_name: string } | null;
}

const CourseDetailPage = ({ user }: CourseDetailPageProps) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [course, setCourse] = useState<Courses | null>(null);
  const [modules, setModules] = useState<CourseModule[]>([]);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showEnrollModal, setShowEnrollModal] = useState(false);
  const [expandedModules, setExpandedModules] = useState<string[]>([]);

  useEffect(() => {
    if (id) {
      fetchCourseData();
    }
  }, [id, user]);

  const fetchCourseData = async () => {
    setLoading(true);
    try {
      // Fetch course
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('*')
        .eq('id', id)
        .single();

      if (courseError) throw courseError;
      setCourse(courseData);

      // Fetch modules
      const { data: modulesData, error: modulesError } = await supabase
        .from('course_modules')
        .select('*')
        .eq('course_id', id)
        .order('order_index');

      if (modulesError) throw modulesError;
      setModules(modulesData || []);

      // Check if user is enrolled
      if (user) {
        const { data: enrollmentData, error: enrollmentError } = await supabase
          .from('enrollments')
          .select('*')
          .eq('student_id', user.id)
          .eq('course_id', id)
          .single();

        if (!enrollmentError) {
          setEnrollment(enrollmentData);
        }
      }
    } catch (error: any) {
      toast.error('Failed to fetch course data');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    if (!user) {
      toast.info('Please sign in to enroll');
      navigate('/login');
      return;
    }

    if (!course) return;

    try {
      const { error } = await supabase.from('enrollments').insert([{
        student_id: user.id,
        course_id: course.id,
        status: 'pending',
        progress: 0,
      }]);

      if (error) throw error;

      toast.success(`Successfully enrolled in ${course.title}!`);
      setShowEnrollModal(false);
      fetchCourseData();
    } catch (error: any) {
      if (error.message.includes('unique constraint')) {
        toast.error('You are already enrolled in this course');
      } else {
        toast.error(error.message || 'Failed to enroll');
      }
    }
  };

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev =>
      prev.includes(moduleId)
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const canAccessModule = (module: CourseModule) => {
    return module.is_free || (enrollment && enrollment.status === 'approved');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-[#7eca4d]/30 border-t-[#7eca4d] rounded-full animate-spin" />
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-[#f8f8f8] flex items-center justify-center">
        <div className="text-center">
          <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-[#1a1a1a] mb-2">Course Not Found</h1>
          <p className="text-[#4a4a4a] mb-4">The course you're looking for doesn't exist.</p>
          <Link to="/courses">
            <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white">
              Browse Courses
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f8f8]">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold text-[#1a1a1a]">EduManager</span>
            </Link>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to={user.role === 'manager' ? '/manager' : '/dashboard'}>
                  <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <Link to="/login">
                  <Button variant="outline" className="border-[#7eca4d] text-[#7eca4d] hover:bg-[#7eca4d] hover:text-white">
                    Sign In
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Back Button */}
      <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <Link to="/courses" className="inline-flex items-center gap-2 text-[#4a4a4a] hover:text-[#7eca4d] transition-colors">
          <ArrowLeft className="w-5 h-5" />
          Back to Courses
        </Link>
      </div>

      {/* Course Header */}
      <section className="bg-gradient-to-br from-[#1a1a1a] to-[#2a2a2a] text-white py-16">
        <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-2">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-3 py-1 bg-white/10 rounded-full text-sm">{course.category}</span>
                  <span className="px-3 py-1 bg-[#7eca4d]/20 text-[#7eca4d] rounded-full text-sm">{course.level}</span>
                </div>
                
                <h1 className="text-4xl md:text-5xl font-bold mb-4">{course.title}</h1>
                <p className="text-xl text-white/80 mb-6">{course.short_description || course.description}</p>
                
                <div className="flex flex-wrap items-center gap-6 text-white/70">
                  <span className="flex items-center gap-2">
                    <Star className="w-5 h-5 text-[#f48c24]" />
                    <span className="text-white font-semibold">{course.rating || '4.5'}</span>
                    <span>({course.rating_count || '128'} reviews)</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Users className="w-5 h-5" />
                    {course.enrolled_students} students
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    {course.duration}
                  </span>
                  <span className="flex items-center gap-2">
                    <Globe className="w-5 h-5" />
                    English
                  </span>
                </div>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 text-[#1a1a1a]"
            >
              <div className="aspect-video bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-20 h-20 text-white/50" />
              </div>
              
              <div className="text-center mb-6">
                <span className="text-4xl font-bold text-[#7eca4d]">${course.price}</span>
              </div>

              {enrollment ? (
                <div className="space-y-4">
                  <div className="p-4 bg-[#7eca4d]/10 rounded-xl">
                    <p className="text-sm text-[#4a4a4a] mb-1">Enrollment Status</p>
                    <p className={`font-semibold ${
                      enrollment.status === 'approved' ? 'text-green-600' :
                      enrollment.status === 'pending' ? 'text-yellow-600' :
                      'text-blue-600'
                    }`}>
                      {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                    </p>
                  </div>
                  {enrollment.status === 'approved' && (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-[#4a4a4a]">Your Progress</span>
                          <span className="font-semibold text-[#7eca4d]">{enrollment.progress}%</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-[#7eca4d] to-[#6ab53a] rounded-full"
                            style={{ width: `${enrollment.progress}%` }}
                          />
                        </div>
                      </div>
                      <Button className="w-full bg-[#7eca4d] hover:bg-[#6ab53a] text-white py-6">
                        <Play className="w-5 h-5 mr-2" />
                        Continue Learning
                      </Button>
                    </>
                  )}
                </div>
              ) : (
                <Button
                  onClick={() => setShowEnrollModal(true)}
                  className="w-full bg-[#7eca4d] hover:bg-[#6ab53a] text-white py-6"
                >
                  Enroll Now
                </Button>
              )}

              <div className="mt-6 space-y-3 text-sm">
                <div className="flex items-center gap-2 text-[#4a4a4a]">
                  <Check className="w-4 h-4 text-[#7eca4d]" />
                  Full lifetime access
                </div>
                <div className="flex items-center gap-2 text-[#4a4a4a]">
                  <Check className="w-4 h-4 text-[#7eca4d]" />
                  Access on mobile and TV
                </div>
                <div className="flex items-center gap-2 text-[#4a4a4a]">
                  <Check className="w-4 h-4 text-[#7eca4d]" />
                  Certificate of completion
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Course Content */}
      <section className="py-12">
        <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-12">
              {/* Description */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Description</h2>
                <p className="text-[#4a4a4a] leading-relaxed">{course.description}</p>
              </motion.div>

              {/* What You'll Learn */}
              {course.learning_outcomes && course.learning_outcomes.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-2xl p-8"
                >
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-6">What you'll learn</h2>
                  <div className="grid md:grid-cols-2 gap-4">
                    {course.learning_outcomes.map((outcome: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
                      <div key={i} className="flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-[#7eca4d] flex-shrink-0 mt-0.5" />
                        <span className="text-[#4a4a4a]">{outcome}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Requirements */}
              {course.requirements && course.requirements.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Requirements</h2>
                  <ul className="space-y-2">
                    {course.requirements.map((req: string | number | bigint | boolean | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | ReactPortal | Promise<string | number | bigint | boolean | ReactPortal | ReactElement<unknown, string | JSXElementConstructor<any>> | Iterable<ReactNode> | null | undefined> | null | undefined, i: Key | null | undefined) => (
                      <li key={i} className="flex items-center gap-2 text-[#4a4a4a]">
                        <div className="w-1.5 h-1.5 bg-[#7eca4d] rounded-full" />
                        {req}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              )}

              {/* Course Content / Modules */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
              >
                <h2 className="text-2xl font-bold text-[#1a1a1a] mb-4">Course Content</h2>
                <div className="bg-white rounded-2xl overflow-hidden">
                  <div className="p-4 bg-gray-50 border-b flex items-center justify-between">
                    <span className="text-[#4a4a4a]">
                      {modules.length} lessons • {course.duration} total
                    </span>
                  </div>
                  
                  {modules.length === 0 ? (
                    <div className="p-8 text-center text-[#4a4a4a]">
                      Course content coming soon!
                    </div>
                  ) : (
                    <div className="divide-y">
                      {modules.map((module, i) => {
                        const canAccess = canAccessModule(module);
                        const isExpanded = expandedModules.includes(module.id);
                        
                        return (
                          <div key={module.id}>
                            <button
                              onClick={() => canAccess && toggleModule(module.id)}
                              className={`w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors ${
                                !canAccess ? 'opacity-60' : ''
                              }`}
                            >
                              <div className="w-8 h-8 bg-[#7eca4d]/10 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-sm font-semibold text-[#7eca4d]">{i + 1}</span>
                              </div>
                              
                              <div className="flex-1 text-left">
                                <p className="font-semibold text-[#1a1a1a]">{module.title}</p>
                                <div className="flex items-center gap-2 text-sm text-[#4a4a4a]">
                                  {module.duration && <span>{module.duration} min</span>}
                                  {module.is_free && <span className="text-[#7eca4d]">• Free Preview</span>}
                                </div>
                              </div>
                              
                              <div className="flex items-center gap-2">
                                {canAccess ? (
                                  <Play className="w-5 h-5 text-[#7eca4d]" />
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                                {canAccess && (
                                  isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </button>
                            
                            {isExpanded && canAccess && (
                              <motion.div
                                initial={{ height: 0 }}
                                animate={{ height: 'auto' }}
                                className="px-4 pb-4 pl-16"
                              >
                                <p className="text-[#4a4a4a] mb-4">{module.description}</p>
                                {module.video_url && (
                                  <Button size="sm" className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white">
                                    <Play className="w-4 h-4 mr-2" />
                                    Watch Video
                                  </Button>
                                )}
                              </motion.div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              {/* Instructor */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl p-6"
              >
                <h3 className="font-bold text-[#1a1a1a] mb-4">Instructor</h3>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-full flex items-center justify-center">
                    <User className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-[#1a1a1a]">Course Instructor</p>
                    <p className="text-sm text-[#4a4a4a]">Expert Educator</p>
                  </div>
                </div>
              </motion.div>

              {/* Tags */}
              {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 }}
                  className="bg-white rounded-2xl p-6"
                >
                  <h3 className="font-bold text-[#1a1a1a] mb-4">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {course.tags.map((tag: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-gray-100 text-[#4a4a4a] rounded-full text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              )}

              {/* Related Info */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6 }}
                className="bg-white rounded-2xl p-6"
              >
                <h3 className="font-bold text-[#1a1a1a] mb-4">Course Info</h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Calendar className="w-5 h-5 text-[#7eca4d]" />
                    <div>
                      <p className="text-sm text-[#4a4a4a]">Last Updated</p>
                      <p className="font-semibold text-[#1a1a1a]">
                        {new Date(course.updated_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Users className="w-5 h-5 text-[#7eca4d]" />
                    <div>
                      <p className="text-sm text-[#4a4a4a]">Max Students</p>
                      <p className="font-semibold text-[#1a1a1a]">{course.max_students}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Award className="w-5 h-5 text-[#7eca4d]" />
                    <div>
                      <p className="text-sm text-[#4a4a4a]">Certificate</p>
                      <p className="font-semibold text-[#1a1a1a]">Yes</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Enroll Modal */}
      <Dialog open={showEnrollModal} onOpenChange={setShowEnrollModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-[#1a1a1a]">Enroll in Course</DialogTitle>
          </DialogHeader>
          <div className="mt-4 space-y-4">
            <p className="text-[#4a4a4a]">
              Are you sure you want to enroll in <strong>{course.title}</strong>?
            </p>
            <div className="bg-gray-50 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-[#4a4a4a]">Course Price</span>
                <span className="font-semibold">${course.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4a4a]">Duration</span>
                <span className="font-semibold">{course.duration}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#4a4a4a]">Lessons</span>
                <span className="font-semibold">{modules.length}</span>
              </div>
            </div>
            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => setShowEnrollModal(false)}
                className="flex-1"
              >
                Cancel
              </Button>
              <Button
                onClick={handleEnroll}
                className="flex-1 bg-[#7eca4d] hover:bg-[#6ab53a] text-white"
              >
                Confirm Enrollment
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CourseDetailPage;
