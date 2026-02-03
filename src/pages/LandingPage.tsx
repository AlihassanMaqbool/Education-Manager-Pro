import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Menu, X, ChevronRight, Users, Calendar, MessageCircle, BarChart3, 
  UserPlus, Settings, Rocket, Star, Check, ArrowRight, Play,
  Facebook, Twitter, Linkedin, Instagram, Mail, Phone, MapPin,
  GraduationCap, Clock, TrendingUp, Shield
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface LandingPageProps {
  user: { id: string; email: string; role: 'manager' | 'user'; full_name: string } | null;
}

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 60 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.6 } }
};

const slideInLeft = {
  hidden: { opacity: 0, x: -80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
};

const slideInRight = {
  hidden: { opacity: 0, x: 80 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8 } }
};

const scaleIn = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.2 }
  }
};

const wordReveal = {
  hidden: { opacity: 0, y: 30, clipPath: 'inset(100% 0 0 0)' },
  visible: { 
    opacity: 1, 
    y: 0, 
    clipPath: 'inset(0% 0 0 0)',
    transition: { duration: 0.6 }
  }
};

// Particle Network Component
const ParticleNetwork = () => {
  const [particles, setParticles] = useState<Array<{x: number; y: number; vx: number; vy: number}>>([]);
  
  useEffect(() => {
    const newParticles = Array.from({ length: 50 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
      vx: (Math.random() - 0.5) * 0.02,
      vy: (Math.random() - 0.5) * 0.02,
    }));
    setParticles(newParticles);

    let animationId: number;
    const animate = () => {
      setParticles(prev => prev.map(p => ({
        ...p,
        x: (p.x + p.vx + 100) % 100,
        y: (p.y + p.vy + 100) % 100,
      })));
      animationId = requestAnimationFrame(animate);
    };
    animate();

    return () => cancelAnimationFrame(animationId);
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <svg className="w-full h-full">
        {particles.map((p1, i) => 
          particles.slice(i + 1).map((p2, j) => {
            const dx = p1.x - p2.x;
            const dy = p1.y - p2.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < 20) {
              return (
                <line
                  key={`${i}-${j}`}
                  x1={`${p1.x}%`}
                  y1={`${p1.y}%`}
                  x2={`${p2.x}%`}
                  y2={`${p2.y}%`}
                  stroke="rgba(126, 202, 77, 0.15)"
                  strokeWidth={1 - distance / 20}
                />
              );
            }
            return null;
          })
        )}
        {particles.map((p, i) => (
          <circle
            key={i}
            cx={`${p.x}%`}
            cy={`${p.y}%`}
            r={2}
            fill="rgba(126, 202, 77, 0.3)"
          />
        ))}
      </svg>
    </div>
  );
};

// Navigation Component
const Navigation = ({ user }: { user: LandingPageProps['user'] }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Features', href: '#features' },
    { name: 'How It Works', href: '#how-it-works' },
    { name: 'Pricing', href: '#pricing' },
    { name: 'Contact', href: '#contact' },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm py-3' : 'bg-transparent py-5'
      }`}
    >
      <div className="max-w-7xl 2xl:max-w-8xl 4xl:max-w-9xl 6xl:max-w-10xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className={`text-xl font-bold transition-colors ${scrolled ? 'text-[#1a1a1a]' : 'text-[#1a1a1a]'}`}>
              EduManager
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className={`text-sm font-medium transition-colors hover:text-[#7eca4d] relative group ${
                  scrolled ? 'text-[#4a4a4a]' : 'text-[#4a4a4a]'
                }`}
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#7eca4d] transition-all group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <Link to={user.role === 'manager' ? '/manager' : '/dashboard'}>
                <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full px-6">
                  Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/login">
                  <Button variant="ghost" className="text-[#4a4a4a] hover:text-[#7eca4d]">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full px-6">
                    Get Started
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-t"
          >
            <div className="px-4 py-4 space-y-3">
              {navLinks.map((link) => (
                <a
                  key={link.name}
                  href={link.href}
                  className="block py-2 text-[#4a4a4a] hover:text-[#7eca4d]"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </a>
              ))}
              {user ? (
                <Link to={user.role === 'manager' ? '/manager' : '/dashboard'}>
                  <Button className="w-full bg-[#7eca4d] hover:bg-[#6ab53a] text-white">
                    Dashboard
                  </Button>
                </Link>
              ) : (
                <div className="flex gap-3 pt-3">
                  <Link to="/login" className="flex-1">
                    <Button variant="outline" className="w-full">Sign In</Button>
                  </Link>
                  <Link to="/register" className="flex-1">
                    <Button className="w-full bg-[#7eca4d] hover:bg-[#6ab53a] text-white">
                      Get Started
                    </Button>
                  </Link>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
};

// Hero Section
const HeroSection = ({ user }: { user: LandingPageProps['user'] }) => {
  return (
    <section id="home" className="relative min-h-screen flex items-center pt-20 overflow-hidden bg-gradient-to-br from-[#f8f8f8] via-white to-[#f0f7eb]">
      <ParticleNetwork />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={staggerContainer}
            className="space-y-8"
          >
            <motion.div variants={wordReveal} className="space-y-2">
              <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold">
                🚀 Transform Education Management
              </span>
            </motion.div>
            
            <motion.h1 variants={wordReveal} className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-[#1a1a1a] leading-tight">
              Transform<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#7eca4d] to-[#6ab53a]">Education</span><br />
              Management
            </motion.h1>
            
            <motion.p variants={fadeInUp} className="text-lg text-[#4a4a4a] max-w-lg">
              Streamline your institution's workflow with our comprehensive platform. 
              Connect teachers, students, and administrators in one powerful ecosystem.
            </motion.p>
            
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              {user ? (
                <Link to={user.role === 'manager' ? '/manager' : '/dashboard'}>
                  <Button size="lg" className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-[#7eca4d]/30 hover:shadow-xl hover:shadow-[#7eca4d]/40 transition-all hover:-translate-y-1">
                    Go to Dashboard
                    <ArrowRight className="ml-2 w-5 h-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/register">
                    <Button size="lg" className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full px-8 py-6 text-lg shadow-lg shadow-[#7eca4d]/30 hover:shadow-xl hover:shadow-[#7eca4d]/40 transition-all hover:-translate-y-1">
                      Start Free Trial
                      <ArrowRight className="ml-2 w-5 h-5" />
                    </Button>
                  </Link>
                  <Button 
                    size="lg" 
                    variant="outline" 
                    className="rounded-full px-8 py-6 text-lg border-2 border-[#1a1a1a] hover:border-[#7eca4d] hover:text-[#7eca4d] transition-all"
                    onClick={() => toast.info('Demo video coming soon!')}
                  >
                    <Play className="mr-2 w-5 h-5" />
                    Watch Demo
                  </Button>
                </>
              )}
            </motion.div>
            
            <motion.div variants={fadeInUp} className="flex items-center gap-6 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 border-2 border-white flex items-center justify-center">
                    <Users className="w-5 h-5 text-gray-500" />
                  </div>
                ))}
              </div>
              <div>
                <p className="font-semibold text-[#1a1a1a]">500+ Institutions</p>
                <p className="text-sm text-[#4a4a4a]">Trust EduManager</p>
              </div>
            </motion.div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 1, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#7eca4d]/20 to-[#f48c24]/20 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=800&h=1000&fit=crop"
                alt="Education Management"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
              
              {/* Floating Stats Card */}
              <motion.div
                initial={{ opacity: 0, y: 80, rotate: -10 }}
                animate={{ opacity: 1, y: 0, rotate: 0 }}
                transition={{ duration: 0.8, delay: 1, ease: [0.34, 1.56, 0.64, 1] }}
                className="absolute -bottom-6 -left-6 bg-white rounded-2xl shadow-xl p-6"
              >
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] flex items-center justify-center">
                    <TrendingUp className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <p className="text-sm text-[#4a4a4a]">Total Students</p>
                    <p className="text-2xl font-bold text-[#1a1a1a]">12,450</p>
                    <span className="text-xs text-[#7eca4d] font-semibold">+15% this month</span>
                  </div>
                </div>
              </motion.div>
              
              {/* Floating Badge */}
              <motion.div
                initial={{ opacity: 0, scale: 0 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.2, ease: [0.68, -0.55, 0.265, 1.55] }}
                className="absolute -top-4 -right-4 bg-white rounded-xl shadow-lg p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="w-4 h-4 fill-[#f48c24] text-[#f48c24]" />
                    ))}
                  </div>
                  <span className="text-sm font-semibold text-[#1a1a1a]">4.9/5</span>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-20 left-10 w-20 h-20 bg-[#7eca4d]/10 rounded-full blur-xl" />
      <div className="absolute bottom-20 right-10 w-32 h-32 bg-[#f48c24]/10 rounded-full blur-xl" />
    </section>
  );
};

// Brand Logos Section
const BrandLogosSection = () => {
  const logos = [
    'Harvard University', 'Stanford', 'MIT', 'Yale', 'Princeton', 
    'Columbia', 'Oxford', 'Cambridge', 'Google', 'Microsoft'
  ];

  return (
    <section className="py-16 bg-white overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <p className="text-[#4a4a4a] font-medium">Trusted by leading institutions worldwide</p>
      </motion.div>
      
      <div className="relative">
        <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-white to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-white to-transparent z-10" />
        
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="flex gap-16 animate-marquee"
        >
          {[...logos, ...logos].map((logo, i) => (
            <div
              key={i}
              className="flex-shrink-0 px-8 py-4 bg-gray-50 rounded-xl grayscale hover:grayscale-0 transition-all hover:scale-110 cursor-pointer"
            >
              <span className="text-xl font-bold text-[#4a4a4a] hover:text-[#7eca4d]">{logo}</span>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// Features Section
const FeaturesSection = () => {
  const features = [
    {
      icon: Users,
      title: 'Student Management',
      description: 'Track enrollments, attendance, grades, and progress in one unified dashboard.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      icon: Calendar,
      title: 'Course Scheduling',
      description: 'Intelligent scheduling system that prevents conflicts and optimizes resources.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      icon: MessageCircle,
      title: 'Communication Hub',
      description: 'Connect teachers, students, and parents with integrated messaging and announcements.',
      color: 'from-pink-500 to-pink-600'
    },
    {
      icon: BarChart3,
      title: 'Analytics & Reports',
      description: 'Data-driven insights with customizable reports and real-time dashboards.',
      color: 'from-[#7eca4d] to-[#6ab53a]'
    },
  ];

  return (
    <section id="features" className="py-24 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold mb-4">
            Features
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Powerful Features
          </h2>
          <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto">
            Everything you need to manage your educational institution efficiently
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-2 gap-8"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={fadeInUp}
              whileHover={{ y: -10, scale: 1.02 }}
              className="group bg-white rounded-2xl p-8 shadow-lg hover:shadow-2xl transition-all duration-300 border border-transparent hover:border-[#7eca4d]/30"
            >
              <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-3">{feature.title}</h3>
              <p className="text-[#4a4a4a] leading-relaxed">{feature.description}</p>
              <div className="mt-6 flex items-center text-[#7eca4d] font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                <span>Learn more</span>
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-2 transition-transform" />
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// About Section
const AboutSection = () => {
  const stats = [
    { value: '10+', label: 'Years of Excellence' },
    { value: '500+', label: 'Institutions Served' },
    { value: '1M+', label: 'Students Managed' },
    { value: '99.9%', label: 'Uptime Guarantee' },
  ];

  return (
    <section id="about" className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-[#7eca4d]/20 to-[#f48c24]/20 rounded-3xl blur-2xl" />
              <img
                src="https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=600&h=800&fit=crop"
                alt="About Us"
                className="relative rounded-2xl shadow-2xl w-full object-cover"
              />
              
              {/* Stats Overlay */}
              <motion.div
                initial={{ opacity: 0, scale: 0.5, y: 30 }}
                whileInView={{ opacity: 1, scale: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.6, ease: [0.68, -0.55, 0.265, 1.55] }}
                className="absolute -bottom-8 -right-8 bg-white rounded-2xl shadow-xl p-6 grid grid-cols-2 gap-4"
              >
                {stats.slice(0, 2).map((stat, i) => (
                  <div key={i} className="text-center">
                    <p className="text-3xl font-bold text-[#7eca4d]">{stat.value}</p>
                    <p className="text-xs text-[#4a4a4a]">{stat.label}</p>
                  </div>
                ))}
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="space-y-6"
          >
            <motion.span variants={fadeIn} className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold">
              About Us
            </motion.span>
            
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold text-[#1a1a1a]">
              Empowering Education Through <span className="text-[#7eca4d]">Technology</span>
            </motion.h2>
            
            <motion.p variants={fadeInUp} className="text-lg text-[#4a4a4a] leading-relaxed">
              For over a decade, we've been at the forefront of educational innovation. 
              Our platform serves 500+ institutions worldwide, managing over 1 million 
              student records with 99.9% uptime.
            </motion.p>
            
            <motion.p variants={fadeInUp} className="text-lg text-[#4a4a4a] leading-relaxed">
              We believe technology should enhance learning, not complicate it. That's why 
              we've built an intuitive platform that educators actually love to use.
            </motion.p>

            <motion.div variants={fadeInUp} className="grid grid-cols-2 gap-6 pt-4">
              {stats.map((stat, i) => (
                <div key={i} className="p-4 bg-[#f8f8f8] rounded-xl">
                  <p className="text-3xl font-bold text-[#7eca4d]">{stat.value}</p>
                  <p className="text-sm text-[#4a4a4a]">{stat.label}</p>
                </div>
              ))}
            </motion.div>

            <motion.div variants={fadeInUp}>
              <Button className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-full px-8">
                Learn More About Us
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Stats Section
const StatsSection = () => {
  const stats = [
    { value: '99.9%', label: 'Uptime Guarantee', icon: Shield },
    { value: '24/7', label: 'Customer Support', icon: Clock },
    { value: '500+', label: 'Institutions', icon: Building },
    { value: '1M+', label: 'Active Students', icon: Users },
  ];

  function Building(props: { className?: string }) {
    return (
      <svg {...props} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M3 21h18M5 21V7l8-4 8 4v14M8 21v-5a2 2 0 012-2h4a2 2 0 012 2v5" />
      </svg>
    );
  }

  return (
    <section className="py-20 bg-gradient-to-r from-[#f8f8f8] to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              variants={scaleIn}
              className="text-center relative"
            >
              {index > 0 && (
                <div className="hidden md:block absolute left-0 top-1/2 -translate-y-1/2 w-px h-16 bg-gray-200" />
              )}
              <stat.icon className="w-8 h-8 text-[#7eca4d] mx-auto mb-4" />
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-2"
              >
                {stat.value}
              </motion.p>
              <p className="text-[#4a4a4a]">{stat.label}</p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// How It Works Section
const HowItWorksSection = () => {
  const steps = [
    {
      icon: UserPlus,
      title: 'Create Your Account',
      description: 'Sign up in minutes with your institution details. No credit card required for the 14-day free trial.',
      color: 'bg-blue-500'
    },
    {
      icon: Settings,
      title: 'Set Up Your Environment',
      description: 'Import your data or start fresh. Customize fields, workflows, and permissions to match your needs.',
      color: 'bg-purple-500'
    },
    {
      icon: Rocket,
      title: 'Go Live',
      description: 'Invite your team and start managing. Our onboarding specialists ensure a smooth transition.',
      color: 'bg-[#7eca4d]'
    },
  ];

  return (
    <section id="how-it-works" className="py-24 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold mb-4">
            How It Works
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Get Started in Three Simple Steps
          </h2>
          <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto">
            From signup to launch, we've made the process as simple as possible
          </p>
        </motion.div>

        <div className="relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gray-200 -translate-y-1/2" />
          <motion.div
            initial={{ scaleX: 0 }}
            whileInView={{ scaleX: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1.5, ease: 'easeOut' }}
            className="hidden md:block absolute top-1/2 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-[#7eca4d] -translate-y-1/2 origin-left"
          />

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="grid md:grid-cols-3 gap-8"
          >
            {steps.map((step, index) => (
              <motion.div
                key={step.title}
                variants={fadeInUp}
                className={`relative ${index % 2 === 1 ? 'md:mt-16' : ''}`}
              >
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  whileInView={{ scale: 1, rotate: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.2, ease: [0.68, -0.55, 0.265, 1.55] }}
                  className={`w-20 h-20 ${step.color} rounded-full flex items-center justify-center mx-auto mb-6 relative z-10 shadow-lg`}
                >
                  <step.icon className="w-10 h-10 text-white" />
                </motion.div>
                
                <motion.div
                  initial={{ opacity: 0, x: index % 2 === 0 ? -80 : 80, rotateY: index % 2 === 0 ? 45 : -45 }}
                  whileInView={{ opacity: 1, x: 0, rotateY: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.7, delay: 0.7 + index * 0.2 }}
                  className="bg-white rounded-2xl p-8 shadow-lg text-center hover:shadow-xl transition-shadow"
                >
                  <div className="text-5xl font-bold text-gray-100 mb-4">0{index + 1}</div>
                  <h3 className="text-xl font-bold text-[#1a1a1a] mb-3">{step.title}</h3>
                  <p className="text-[#4a4a4a]">{step.description}</p>
                </motion.div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Testimonials Section
const TestimonialsSection = () => {
  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Principal, Lincoln High School',
      quote: 'EduManager transformed how we handle student data. What used to take hours now takes minutes.',
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&h=200&fit=crop',
      rating: 5
    },
    {
      name: 'Michael Chen',
      role: 'IT Director, Global Academy',
      quote: 'The integration capabilities are incredible. It connects seamlessly with all our existing tools.',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop',
      rating: 5
    },
    {
      name: 'Emily Rodriguez',
      role: 'Dean of Students, Westfield University',
      quote: 'Support team is phenomenal. Any issue is resolved within hours, not days.',
      avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop',
      rating: 5
    },
  ];

  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <section className="py-24 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold mb-4">
            Testimonials
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            What Our Clients Say
          </h2>
          <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto">
            Join hundreds of satisfied educational institutions
          </p>
        </motion.div>

        <div className="relative">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="flex justify-center items-center gap-6"
          >
            {testimonials.map((testimonial, index) => {
              const isActive = index === activeIndex;
              const isPrev = index === (activeIndex - 1 + testimonials.length) % testimonials.length;
              const isNext = index === (activeIndex + 1) % testimonials.length;

              return (
                <motion.div
                  key={testimonial.name}
                  variants={fadeIn}
                  animate={{
                    scale: isActive ? 1 : 0.85,
                    opacity: isActive ? 1 : 0.5,
                    rotateY: isPrev ? 25 : isNext ? -25 : 0,
                    x: isPrev ? 50 : isNext ? -50 : 0,
                  }}
                  transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
                  className={`${isActive ? 'z-20' : 'z-10'} w-full max-w-lg cursor-pointer`}
                  onClick={() => setActiveIndex(index)}
                >
                  <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
                    <div className="flex gap-1 mb-6">
                      {[...Array(testimonial.rating)].map((_, i) => (
                        <Star key={i} className="w-5 h-5 fill-[#f48c24] text-[#f48c24]" />
                      ))}
                    </div>
                    <p className="text-lg text-[#4a4a4a] mb-6 italic">"{testimonial.quote}"</p>
                    <div className="flex items-center gap-4">
                      <img
                        src={testimonial.avatar}
                        alt={testimonial.name}
                        className="w-14 h-14 rounded-full object-cover"
                      />
                      <div>
                        <p className="font-bold text-[#1a1a1a]">{testimonial.name}</p>
                        <p className="text-sm text-[#4a4a4a]">{testimonial.role}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Navigation Dots */}
          <div className="flex justify-center gap-2 mt-8">
            {testimonials.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`w-3 h-3 rounded-full transition-all ${
                  index === activeIndex ? 'bg-[#7eca4d] scale-125' : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

// Pricing Section
const PricingSection = () => {
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      name: 'Starter',
      monthlyPrice: 29,
      annualPrice: 23,
      description: 'Perfect for small schools and startups',
      features: [
        'Up to 500 students',
        'Basic analytics',
        'Email support',
        '5 admin users',
        'Core features',
      ],
      cta: 'Start Free Trial',
      popular: false,
    },
    {
      name: 'Professional',
      monthlyPrice: 79,
      annualPrice: 63,
      description: 'For growing institutions',
      features: [
        'Up to 5,000 students',
        'Advanced analytics',
        'Priority support',
        '25 admin users',
        'All features',
        'API access',
      ],
      cta: 'Start Free Trial',
      popular: true,
    },
    {
      name: 'Enterprise',
      monthlyPrice: null,
      annualPrice: null,
      description: 'For large organizations',
      features: [
        'Unlimited students',
        'Custom analytics',
        '24/7 dedicated support',
        'Unlimited admins',
        'All features',
        'Custom integrations',
        'SLA guarantee',
      ],
      cta: 'Contact Sales',
      popular: false,
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold mb-4">
            Pricing
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Simple, Transparent Pricing
          </h2>
          <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto">
            Choose the plan that fits your institution's needs
          </p>
        </motion.div>

        {/* Toggle */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="flex justify-center items-center gap-4 mb-12"
        >
          <span className={`text-sm font-medium ${!isAnnual ? 'text-[#1a1a1a]' : 'text-[#4a4a4a]'}`}>
            Monthly
          </span>
          <button
            onClick={() => setIsAnnual(!isAnnual)}
            className="relative w-16 h-8 bg-[#7eca4d] rounded-full p-1 transition-colors"
          >
            <motion.div
              animate={{ x: isAnnual ? 32 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              className="w-6 h-6 bg-white rounded-full shadow-md"
            />
          </button>
          <span className={`text-sm font-medium ${isAnnual ? 'text-[#1a1a1a]' : 'text-[#4a4a4a]'}`}>
            Annual
          </span>
          {isAnnual && (
            <motion.span
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-[#7eca4d] font-semibold"
            >
              Save 20%
            </motion.span>
          )}
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-3 gap-8"
        >
          {plans.map((plan) => (
            <motion.div
              key={plan.name}
              variants={fadeInUp}
              whileHover={{ y: -10 }}
              className={`relative bg-white rounded-2xl p-8 shadow-lg transition-all ${
                plan.popular ? 'ring-2 ring-[#7eca4d] scale-105' : ''
              }`}
            >
              {plan.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: 'spring' }}
                  className="absolute -top-4 left-1/2 -translate-x-1/2 bg-[#7eca4d] text-white px-4 py-1 rounded-full text-sm font-semibold"
                >
                  Most Popular
                </motion.div>
              )}

              <h3 className="text-2xl font-bold text-[#1a1a1a] mb-2">{plan.name}</h3>
              <p className="text-[#4a4a4a] mb-6">{plan.description}</p>

              <div className="mb-6">
                {plan.monthlyPrice ? (
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-bold text-[#1a1a1a]">
                      ${isAnnual ? plan.annualPrice : plan.monthlyPrice}
                    </span>
                    <span className="text-[#4a4a4a]">/month</span>
                  </div>
                ) : (
                  <span className="text-4xl font-bold text-[#1a1a1a]">Custom</span>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-3">
                    <Check className="w-5 h-5 text-[#7eca4d]" />
                    <span className="text-[#4a4a4a]">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                className={`w-full rounded-full py-6 ${
                  plan.popular
                    ? 'bg-[#7eca4d] hover:bg-[#6ab53a] text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-[#1a1a1a]'
                }`}
              >
                {plan.cta}
              </Button>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// FAQ Section
const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      question: 'How does the 14-day free trial work?',
      answer: 'Start with full access to all features. No credit card required. At the end of 14 days, choose a plan or continue with our free tier.',
    },
    {
      question: 'Can I import data from my current system?',
      answer: 'Absolutely. We support imports from CSV, Excel, and direct integrations with popular SIS platforms. Our team can assist with migration.',
    },
    {
      question: 'Is my data secure?',
      answer: 'Yes. We use bank-level encryption, SOC 2 Type II compliance, and regular security audits. Your data is backed up daily across multiple regions.',
    },
    {
      question: 'What support options are available?',
      answer: 'All plans include email support. Professional adds priority chat, and Enterprise includes 24/7 phone support with a dedicated account manager.',
    },
    {
      question: 'Can I customize the platform?',
      answer: 'Yes. Customize fields, workflows, reports, and branding. Enterprise plans include API access for deeper integrations.',
    },
    {
      question: 'How do I cancel my subscription?',
      answer: 'You can cancel anytime from your account settings. No cancellation fees or hidden charges. Your data remains accessible for 30 days post-cancellation.',
    },
  ];

  return (
    <section className="py-24 bg-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold mb-4">
            FAQ
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-[#4a4a4a]">
            Everything you need to know about EduManager
          </p>
        </motion.div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="space-y-4"
        >
          {faqs.map((faq, index) => (
            <motion.div
              key={index}
              variants={index % 2 === 0 ? slideInLeft : slideInRight}
              className="border border-gray-200 rounded-xl overflow-hidden"
            >
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                className="w-full flex items-center justify-between p-6 text-left hover:bg-gray-50 transition-colors"
              >
                <span className="font-semibold text-[#1a1a1a]">{faq.question}</span>
                <motion.div
                  animate={{ rotate: openIndex === index ? 180 : 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <ChevronRight className="w-5 h-5 text-[#7eca4d]" />
                </motion.div>
              </button>
              <AnimatePresence>
                {openIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <p className="px-6 pb-6 text-[#4a4a4a]">{faq.answer}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

// CTA Section
const CTASection = () => {
  return (
    <section className="py-24 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7eca4d] to-[#6ab53a]" />
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-white rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full blur-3xl translate-x-1/2 translate-y-1/2" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerContainer}
            className="text-white"
          >
            <motion.h2 variants={fadeInUp} className="text-4xl md:text-5xl font-bold mb-6">
              Ready to Transform Your Institution?
            </motion.h2>
            <motion.p variants={fadeInUp} className="text-xl text-white/90 mb-8">
              Join 500+ educational institutions already using EduManager. 
              Start your free trial today—no credit card required.
            </motion.p>
            <motion.div variants={fadeInUp} className="flex flex-wrap gap-4">
              <Link to="/register">
                <Button size="lg" className="bg-white text-[#7eca4d] hover:bg-gray-100 rounded-full px-8 py-6 text-lg font-semibold shadow-lg hover:shadow-xl transition-all hover:-translate-y-1">
                  Start Free Trial
                  <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-2 border-white text-gray-700 hover:bg-white/10 rounded-full px-8 py-6 text-lg"
                onClick={() => toast.info('Demo scheduling coming soon!')}
              >
                Schedule a Demo
              </Button>
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 100 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block"
          >
            <img
              src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?w=600&h=700&fit=crop"
              alt="CTA"
              className="rounded-2xl shadow-2xl"
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
};

// Contact Section
const ContactSection = () => {
  return (
    <section id="contact" className="py-24 bg-[#f8f8f8]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#7eca4d]/10 text-[#7eca4d] rounded-full text-sm font-semibold mb-4">
            Contact
          </span>
          <h2 className="text-4xl md:text-5xl font-bold text-[#1a1a1a] mb-4">
            Get in Touch
          </h2>
          <p className="text-lg text-[#4a4a4a] max-w-2xl mx-auto">
            Have questions? We'd love to hear from you.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-2 gap-12">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#7eca4d]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-6 h-6 text-[#7eca4d]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Email</h3>
                <p className="text-[#4a4a4a]">m.alihassanm.maqbool812@gmail.com</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#7eca4d]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-6 h-6 text-[#7eca4d]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Phone</h3>
                <p className="text-[#4a4a4a]">+92 309 7914548</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-[#7eca4d]/10 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-6 h-6 text-[#7eca4d]" />
              </div>
              <div>
                <h3 className="font-bold text-[#1a1a1a] mb-1">Address</h3>
                <p className="text-[#4a4a4a]">123 Education Street, Tech City, TC 12345</p>
              </div>
            </div>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl p-8 shadow-lg space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              toast.success('Message sent successfully!');
            }}
          >
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">First Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all" placeholder="Ali" />
              </div>
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Last Name</label>
                <input type="text" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all" placeholder="Hassan" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Email</label>
              <input type="email" className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all" placeholder="m.alihassanm.maqbool812@gmail.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#1a1a1a] mb-2">Message</label>
              <textarea rows={4} className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-[#7eca4d] focus:ring-2 focus:ring-[#7eca4d]/20 outline-none transition-all resize-none" placeholder="How can we help you?"></textarea>
            </div>
            <Button type="submit" className="w-full bg-[#7eca4d] hover:bg-[#6ab53a] text-white rounded-xl py-6">
              Send Message
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

// Footer
const Footer = () => {
  const quickLinks = ['Home', 'About', 'Features', 'Pricing', 'Contact'];
  const supportLinks = ['Help Center', 'Documentation', 'API Reference', 'Status'];

  return (
    <footer className="bg-[#1a1a1a] text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={staggerContainer}
          className="grid md:grid-cols-4 gap-12 mb-12"
        >
          <motion.div variants={fadeInUp}>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#7eca4d] to-[#6ab53a] rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold">EduManager</span>
            </div>
            <p className="text-gray-400 mb-6">Transforming education management worldwide.</p>
            <div className="flex gap-4">
              {[Facebook, Twitter, Linkedin, Instagram].map((Icon, i) => (
                <motion.a
                  key={i}
                  href="https://www.linkedin.com/in/alihassanmaqbool/"
                  whileHover={{ y: -3, scale: 1.1 }}
                  className="w-10 h-10 bg-gray-800 rounded-lg flex items-center justify-center hover:bg-[#7eca4d] transition-colors"
                >
                  <Icon className="w-5 h-5" />
                </motion.a>
              ))}
            </div>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              {quickLinks.map((link) => (
                <li key={link}>
                  <a href={`#${link.toLowerCase()}`} className="text-gray-400 hover:text-[#7eca4d] hover:translate-x-1 inline-block transition-all">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h4 className="font-bold mb-4">Support</h4>
            <ul className="space-y-2">
              {supportLinks.map((link) => (
                <li key={link}>
                  <a href="#" className="text-gray-400 hover:text-[#7eca4d] hover:translate-x-1 inline-block transition-all">
                    {link}
                  </a>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div variants={fadeInUp}>
            <h4 className="font-bold mb-4">Stay Updated</h4>
            <p className="text-gray-400 mb-4">Get the latest news and updates.</p>
            <form className="flex gap-2" onSubmit={(e) => { e.preventDefault(); toast.success('Subscribed!'); }}>
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 bg-gray-800 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[#7eca4d]"
              />
              <Button type="submit" className="bg-[#7eca4d] hover:bg-[#6ab53a] text-white px-4">
                <Mail className="w-5 h-5" />
              </Button>
            </form>
          </motion.div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-gray-400 text-sm">© 2024 EduManager. All rights reserved.</p>
          <div className="flex gap-6">
            <a href="#" className="text-gray-400 hover:text-[#7eca4d] text-sm">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-[#7eca4d] text-sm">Terms of Service</a>
          </div>
        </motion.div>
      </div>
    </footer>
  );
};

// Main Landing Page Component
const LandingPage = ({ user }: LandingPageProps) => {
  return (
    <div className="min-h-screen bg-white">
      <Navigation user={user} />
      <HeroSection user={user} />
      <BrandLogosSection />
      <FeaturesSection />
      <AboutSection />
      <StatsSection />
      <HowItWorksSection />
      <TestimonialsSection />
      <PricingSection />
      <FAQSection />
      <CTASection />
      <ContactSection />
      <Footer />
    </div>
  );
};

export default LandingPage;
