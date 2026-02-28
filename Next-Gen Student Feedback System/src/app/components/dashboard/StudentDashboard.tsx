import React, { useEffect, useState } from 'react';
import { Course, Feedback, User, Role } from '../../types';
import { getCourses, getFeedbacks, getOnlineUsers, getAllUsers, updateUserLogin } from '../../utils/storage';
import { GlassCard } from '../ui/GlassCard';
import { Button } from '../ui/Button';
import { FeedbackForm } from './FeedbackForm';
import { CheckCircle, Clock, BrainCircuit, Lock } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { AITutorial } from '../AITutorial';

export const StudentDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [courses, setCourses] = useState<Course[]>([]);
  const [completedCourseIds, setCompletedCourseIds] = useState<string[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [userId, setUserId] = useState<string>('');
  const [userDept, setUserDept] = useState<string>('');
  const [showTutorial, setShowTutorial] = useState(false);
  const [allUsers, setAllUsers] = useState<User[]>([]);

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if student exists in system (not requiring online status)
      const allUsers = await getAllUsers();
      let studentUser = allUsers.find(u => u.email === user.email && u.role === 'student');
      
      // If not found in users, check if user has student role in metadata
      if (!studentUser && user.user_metadata?.role === 'student') {
        studentUser = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Student User',
          role: 'student' as Role,
          department: user.user_metadata?.department || 'CS',
          isOnline: true
        };
        
        // Add to users storage for future reference
        await updateUserLogin(studentUser.id, studentUser);
      }
      
      if (!studentUser) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Update login status
      await updateUserLogin(studentUser.id);

      setIsAuthenticated(true);
      setUserId(user.id);
      const dept = user.user_metadata?.department || studentUser.department || '';
      setUserDept(dept);
      
      const allCourses = await getCourses();
      const allFeedbacks = await getFeedbacks();
      const allUsersData = await getAllUsers();
      
      // Filter courses by student's department only (remove online faculty requirement)
      const deptCourses = allCourses.filter(c => c.department === dept);
      
      const myFeedbacks = allFeedbacks.filter(f => f.studentId === user.id);
      const doneIds = myFeedbacks.map(f => f.courseId);
      
      setCourses(deptCourses);
      setCompletedCourseIds(doneIds);
      setAllUsers(allUsersData);
      setLoading(false);
    };
    fetch();
  }, [selectedCourse]); // Refetch when modal closes

  if (selectedCourse) {
    return (
      <FeedbackForm 
        course={selectedCourse} 
        studentId={userId} 
        onClose={() => setSelectedCourse(null)} 
        onSuccess={() => setSelectedCourse(null)}
      />
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#7A6AD8]"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-64">
        <GlassCard className="max-w-md text-center">
          <Lock className="w-16 h-16 text-[#9C8ADE] mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#2E2E4D] mb-2">Access Restricted</h2>
          <p className="text-[#6B6B8A] mb-4">
            You must be logged in as a student to access this dashboard. Please contact your administrator if you believe this is an error.
          </p>
          <button 
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-[#7A6AD8] text-white rounded-xl hover:bg-[#5B4FCF] transition-colors"
          >
            Refresh
          </button>
        </GlassCard>
      </div>
    );
  }

  const pendingCourses = courses.filter(c => !completedCourseIds.includes(c.id));
  const completedCourses = courses.filter(c => completedCourseIds.includes(c.id));

  // AI Feature: Smart Survey Summaries (simulated)
  // In a real app, this would fetch summaries of past feedback or course highlights
  const smartSummary = completedCourses.length > 0 
    ? "Great job! Your feedback helps improve course quality. You tend to rate 'Clarity' highly."
    : "Your voice matters! Start by reviewing your pending courses.";

  return (
    <div className="space-y-8 relative">
      <AITutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} defaultRole="student" />

      {/* AI Smart Summary Banner */}
      <GlassCard className="p-4 bg-gradient-to-r from-[#E9E6F7] to-[#CFE7F5] border-[#C8BFE7]">
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-3">
             <div className="bg-[#7A6AD8]/10 p-2 rounded-lg">
               <span className="text-xl">✨</span>
             </div>
             <div>
                <h3 className="font-bold text-[#2E2E4D] text-sm">EduPulse AI Summary</h3>
                <p className="text-[#6B6B8A] text-sm mt-1">{smartSummary}</p>
             </div>
          </div>
          <button 
             onClick={() => setShowTutorial(true)}
             className="text-xs text-[#7A6AD8] hover:text-[#5B4FCF] underline underline-offset-2 flex items-center gap-1"
          >
             <BrainCircuit className="w-3 h-3" />
             How AI Works
          </button>
        </div>
      </GlassCard>

      <div>
        <h2 className="text-2xl font-bold text-[#2E2E4D] mb-4">
          Pending Feedback {userDept && <span className="text-[#7A6AD8] text-lg">({userDept})</span>}
        </h2>
        {pendingCourses.length === 0 ? (
           <GlassCard className="p-8 text-center border-dashed border-[#C8BFE7] bg-[#F8F9FD]">
             <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-50 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
               <CheckCircle className="text-green-500 w-7 h-7" />
             </div>
             <p className="text-[#6B6B8A] font-medium">All caught up! No pending feedback.</p>
             <p className="text-[#9C8ADE] text-sm mt-2">Great job keeping up with your courses!</p>
           </GlassCard>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pendingCourses.map((course) => (
              <GlassCard key={course.id} hoverEffect className="relative overflow-hidden group">
                 <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                    <Clock className="w-24 h-24 text-[#7A6AD8]" />
                 </div>
                 <div className="relative z-10">
                   <div className="flex justify-between items-start mb-3">
                      <span className="text-xs font-bold text-[#7A6AD8] border border-[#C8BFE7] px-3 py-1 rounded-full bg-[#E9E6F7]/50">{course.code}</span>
                      <span className="text-[10px] uppercase tracking-wider text-[#9C8ADE] bg-[#E9E6F7] px-2 py-1 rounded">{course.department}</span>
                   </div>
                   <h3 className="text-lg font-bold text-[#2E2E4D] mb-2">{course.title}</h3>
                   <p className="text-[#9C8ADE] text-xs mb-2">
                     Faculty: {course.facultyId}
                   </p>
                   <p className="text-[#6B6B8A] text-sm mb-4 line-clamp-2">{course.description}</p>
                   <Button 
                     className="w-full" 
                     onClick={() => setSelectedCourse(course)}
                   >
                     Give Feedback
                   </Button>
                 </div>
              </GlassCard>
            ))}
          </div>
        )}
      </div>

      {completedCourses.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-[#6B6B8A] mb-4">Completed</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
             {completedCourses.map(course => (
               <div key={course.id} className="bg-white border border-[#E9E6F7] rounded-2xl p-4 flex items-center justify-between shadow-sm hover:shadow-md transition-shadow">
                  <div>
                    <div className="text-xs text-[#9C8ADE] font-medium">{course.code}</div>
                    <div className="text-sm font-medium text-[#2E2E4D]">{course.title}</div>
                  </div>
                  <CheckCircle className="w-5 h-5 text-green-400" />
               </div>
             ))}
          </div>
        </div>
      )}
    </div>
  );
};
