import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://your-project.supabase.co';
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Types for database tables
export type Profile = {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'manager' | 'user';
  phone?: string;
  bio?: string;
  created_at: string;
  updated_at: string;
};




export type Courses = {
  id: string;
  title: string;
  description: string;
  short_description?: string;
  image_url?: string;
  category?: string;
  level?: 'beginner' | 'intermediate' | 'advanced';
  duration?: string;
  price: number;
  currency: string;
  max_students: number;
  enrolled_students: number;
  status: 'active' | 'inactive' | 'draft';
  instructor_id?: string;
  start_date?: string;
  end_date?: string;
  schedule?: Record<string, string>;
  requirements?: string[];
  learning_outcomes?: string[];
  tags?: string[];
  rating: number;
  rating_count: number;
  created_at: string;
  updated_at: string;
};

export type Enrollment = {
  id: string;
  student_id: string;
  course_id: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  progress: number;
  created_at: string;
};

export type CourseModule = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  content?: string;
  video_url?: string;
  duration?: number;
  order_index: number;
  is_free: boolean;
  created_at: string;
  updated_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  author_id: string;
  course_id?: string;
  is_global: boolean;
  is_pinned: boolean;
  published_at: string;
  expires_at?: string;
  created_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  is_read: boolean;
  link_url?: string;
  created_at: string;
};
export type Message = {
  id: string;
  sender_id: string;
  recipient_id?: string;
  subject: string;
  message: string;
  is_broadcast: boolean;
  read_at?: string;
  created_at: string;
  updated_at: string;
};