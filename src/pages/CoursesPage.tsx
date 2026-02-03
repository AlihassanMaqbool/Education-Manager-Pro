import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, BookOpen, Clock, Users, Star, Filter, ChevronDown,
  GraduationCap, ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase, type Courses } from '@/lib/supabase';
import { toast } from 'sonner';

interface CoursesPageProps {
  user: { id: string; email: string; role: 'manager' | 'user'; full_name: string } | null;
}

const CoursesPage = ({ user }: CoursesPageProps) => {
  const [courses, setCourses] = useState<Courses[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  const categories = ['all', 'Technology', 'Business', 'Design', 'Marketing', 'Health', 'Other'];
  const levels = ['all', 'beginner', 'intermediate', 'advanced'];

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Process the data to ensure tags are arrays
      const processedData = (data || []).map(course => ({
        ...course,
        tags: course.tags ? (Array.isArray(course.tags) ? course.tags : JSON.parse(course.tags)) : []
      }));

      setCourses(processedData);
    } catch (error: any) {
      toast.error('Failed to fetch courses');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = courses.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesCategory = selectedCategory === 'all' || course.category?.toLowerCase() === selectedCategory.toLowerCase();
    const matchesLevel = selectedLevel === 'all' || course.level === selectedLevel;

    return matchesSearch && matchesCategory && matchesLevel;
  });

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

            <nav className="hidden md:flex items-center gap-8">
              <Link to="/" className="text-[#4a4a4a] hover:text-[#7eca4d] transition-colors">Home</Link>
              <Link to="/courses" className="text-[#7eca4d] font-semibold">Courses</Link>
              <Link to="/#about" className="text-[#4a4a4a] hover:text-[#7eca4d] transition-colors">About</Link>
              <Link to="/#pricing" className="text-[#4a4a4a] hover:text-[#7eca4d] transition-colors">Pricing</Link>
            </nav>

            <div className="flex items-center gap-4">
              {user ? (
                <Link to={user.role === 'manager' ? '/manager' : '/dashboard'}>
                  <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/login" className="hidden sm:block text-[#4a4a4a] hover:text-[#7eca4d]">
                    Sign In
                  </Link>
                  <Link to="/register">
                    <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full">
                      Get Started
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] py-16">
        <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold text-white mb-4"
          >
            Explore Our Courses
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-white/90 max-w-2xl mx-auto"
          >
            Discover a world of knowledge with our expertly crafted courses
          </motion.p>
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-8 bg-white shadow-sm">
        <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses..."
                className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all"
              />
            </div>

            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-6 py-3 border border-gray-200 rounded-xl hover:border-[#7eca4d] transition-colors"
            >
              <Filter className="w-5 h-5" />
              <span>Filters</span>
              <ChevronDown className={`w-4 h-4 transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 pt-4 border-t grid md:grid-cols-2 gap-4"
            >
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Category</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all bg-white"
                >
                  {categories.map(cat => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Level</label>
                <select
                  value={selectedLevel}
                  onChange={(e) => setSelectedLevel(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all bg-white"
                >
                  {levels.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </motion.div>
          )}
        </div>
      </section>

      {/* Courses Grid */}
      <section className="py-12">
        <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-[#7eca4d]/30 border-t-[#7eca4d] rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <div className="mb-6 flex items-center justify-between">
                <p className="text-[#4a4a4a]">
                  Showing <span className="font-semibold text-[#1a1a1a]">{filteredCourses.length}</span> courses
                </p>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredCourses.map((course, i) => (
                  <motion.div
                    key={course.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
                  >
                    <div className="h-56 bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center relative overflow-hidden">
                      <BookOpen className="w-24 h-24 text-white/30" />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 bg-white/90 text-[#1a1a1a] rounded-full text-xs font-semibold">
                          {course.category}
                        </span>
                      </div>
                      <div className="absolute top-4 right-4">
                        <span className="px-3 py-1 bg-[#7eca4d]/90 text-white rounded-full text-xs font-semibold">
                          {course.level}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-[#1a1a1a] mb-2 line-clamp-1">{course.title}</h3>
                      <p className="text-[#4a4a4a] mb-4 line-clamp-2">{course.short_description || course.description}</p>

                      <div className="flex items-center gap-4 text-sm text-[#4a4a4a] mb-4">
                        <span className="flex items-center gap-1">
                          <Clock className="w-4 h-4" />
                          {course.duration}
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-4 h-4" />
                          {course.enrolled_students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Star className="w-4 h-4 text-[#f48c24]" />
                          {course.rating || '4.5'}
                        </span>
                      </div>

                      {course.tags && Array.isArray(course.tags) && course.tags.length > 0 && (
                        <div className="flex flex-wrap gap-2 mb-4">
                          {course.tags.slice(0, 3).map((tag: string, j: number) => (
                            <span key={j} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t">
                        <div>
                          <span className="text-2xl font-bold text-[#7eca4d]">${course.price}</span>
                        </div>
                        <Link to={`/courses/${course.id}`}>
                          <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white">
                            View Details
                            <ArrowRight className="w-4 h-4 ml-2" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {filteredCourses.length === 0 && (
                <div className="text-center py-16">
                  <BookOpen className="w-20 h-20 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-2">No courses found</h3>
                  <p className="text-[#4a4a4a]">Try adjusting your search or filters</p>
                </div>
              )}
            </>
          )}
        </div>
      </section>
    </div>
  );
};

export default CoursesPage;
