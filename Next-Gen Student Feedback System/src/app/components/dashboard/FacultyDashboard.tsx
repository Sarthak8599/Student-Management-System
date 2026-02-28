import React, { useEffect, useState } from 'react';
import { GlassCard } from '../ui/GlassCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Cell } from 'recharts';
import { Course, Feedback, User, Role } from '../../types';
import { getCourses, getFeedbacks, getOnlineUsers, getAllUsers, updateUserLogin } from '../../utils/storage';
import { supabase } from '../../lib/supabase';
import { Loader2, BrainCircuit, Sparkles, TrendingUp, AlertTriangle, HelpCircle, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import { AITutorial } from '../AITutorial';

export const FacultyDashboard = () => {
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [stats, setStats] = useState<any[]>([]);
  const [overallAspects, setOverallAspects] = useState<any[]>([]);
  const [showTutorial, setShowTutorial] = useState(false);
  
  // AI Feature State
  const [selectedSubjectStats, setSelectedSubjectStats] = useState<any>(null);
  const [aiSuggestions, setAiSuggestions] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative'>('Neutral');

  useEffect(() => {
    const fetch = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Check if user exists in system (not requiring online status)
      const allUsers = await getAllUsers();
      let facultyUser = allUsers.find(u => u.email === user.email && u.role === 'faculty');
      
      // If not found in users, check if user has faculty role in metadata
      if (!facultyUser && user.user_metadata?.role === 'faculty') {
        facultyUser = {
          id: user.id,
          email: user.email!,
          name: user.user_metadata?.name || user.email?.split('@')[0] || 'Faculty User',
          role: 'faculty' as Role,
          department: user.user_metadata?.department || 'CS',
          isOnline: true
        };
        
        // Add to users storage for future reference
        await updateUserLogin(facultyUser.id, facultyUser);
      }
      
      if (!facultyUser) {
        setIsAuthenticated(false);
        setLoading(false);
        return;
      }

      // Update login status
      await updateUserLogin(facultyUser.id);
      
      setIsAuthenticated(true);
      setCurrentUser(facultyUser);

      const allCourses = await getCourses();
      const allFeedbacks = await getFeedbacks();

      // Get courses for this faculty only (match by email)
      const myCourses = allCourses.filter(c => c.facultyId === user.email);
      const myCourseIds = myCourses.map(c => c.id);
      const myFeedbacks = allFeedbacks.filter(f => myCourseIds.includes(f.courseId));

      setCourses(myCourses);
      setFeedbacks(myFeedbacks);

      // Compute Stats per Course
      const courseStats = myCourses.map(course => {
        const cFeedbacks = myFeedbacks.filter(f => f.courseId === course.id);
        const avg = cFeedbacks.reduce((acc, curr) => acc + curr.rating, 0) / (cFeedbacks.length || 1);
        
        // Compute aspects for this course specifically
        const cAspects: Record<string, number> = {};
        const cCounts: Record<string, number> = {};
        
        cFeedbacks.forEach(f => {
           Object.entries(f.aspects).forEach(([k, v]) => {
              cAspects[k] = (cAspects[k] || 0) + v;
              cCounts[k] = (cCounts[k] || 0) + 1;
           });
        });
        
        const weakestLink = Object.entries(cAspects).reduce((a, b) => {
           const avgA = a[1] / (cCounts[a[0]] || 1);
           const avgB = b[1] / (cCounts[b[0]] || 1);
           return avgA < avgB ? a : b;
        }, ['None', 5])[0];

        return {
          id: course.id,
          name: course.code,
          subjectName: course.title, // Added for clearer chart
          fullTitle: course.title,
          rating: parseFloat(avg.toFixed(1)),
          count: cFeedbacks.length,
          weakestAspect: weakestLink,
          feedbacks: cFeedbacks
        };
      });

      setStats(courseStats);

      // Default to overall radar
      calculateOverallRadar(myFeedbacks);
      
      setLoading(false);
    };

    fetch();
  }, []);

  const calculateOverallRadar = (feedbacks: Feedback[]) => {
      const aspectSums: Record<string, number> = {};
      const aspectCounts: Record<string, number> = {};

      feedbacks.forEach(f => {
        Object.entries(f.aspects).forEach(([key, value]) => {
           if (!aspectSums[key]) { aspectSums[key] = 0; aspectCounts[key] = 0; }
           aspectSums[key] += value;
           aspectCounts[key] += 1;
        });
      });

      const aspectData = Object.keys(aspectSums).map(key => ({
        subject: key.charAt(0).toUpperCase() + key.slice(1),
        A: parseFloat((aspectSums[key] / aspectCounts[key]).toFixed(2)),
        fullMark: 5
      }));
      setOverallAspects(aspectData);
  };

  const analyzeSubject = (courseStat: any) => {
     setSelectedSubjectStats(courseStat);
     
     // Mock AI Analysis
     const suggestions = [];
     const lowAspect = courseStat.weakestAspect;
     
     if (lowAspect === 'clarity') suggestions.push("Try breaking down complex topics into smaller chunks.");
     if (lowAspect === 'engagement') suggestions.push("Incorporate more interactive polls or real-world examples.");
     if (lowAspect === 'materials') suggestions.push("Review lecture slides for readability and accessibility.");
     if (courseStat.rating < 3.5) suggestions.push("Consider holding an open Q&A session to address concerns.");
     if (suggestions.length === 0) suggestions.push("Great job! Maintain your current teaching style.");
     
     setAiSuggestions(suggestions);

     // Sentiment Analysis
     const comments = courseStat.feedbacks.map((f: any) => f.comments.toLowerCase()).join(' ');
     const pos = (comments.match(/good|great|love|amazing|excellent|clear/g) || []).length;
     const neg = (comments.match(/bad|poor|hard|confusing|boring|difficult/g) || []).length;
     
     setSentiment(pos > neg ? 'Positive' : neg > pos ? 'Negative' : 'Neutral');
  };

  // Custom Tooltip for BarChart to show Subject Name
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white border border-[#E9E6F7] p-3 rounded-xl shadow-xl">
          <p className="font-bold text-[#2E2E4D] mb-1">{data.name}</p>
          <p className="text-xs text-[#7A6AD8] mb-2">{data.subjectName}</p>
          <p className="text-sm text-[#6B6B8A]">Rating: <span className="font-bold text-[#2E2E4D]">{data.rating}</span></p>
          <p className="text-xs text-[#9C8ADE]">Based on {data.count} reviews</p>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-[#7A6AD8]" />
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
            You must be logged in as faculty to access this dashboard. Please contact your administrator if you believe this is an error.
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

  const COLORS = ['#7A6AD8', '#8EC5E8', '#C8BFE7'];

  return (
    <div className="space-y-8 relative">
      <AITutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} defaultRole="faculty" />
      
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-2xl font-bold text-[#2E2E4D] mb-2">Faculty Overview</h2>
          <p className="text-[#6B6B8A]">Real-time insights for your courses</p>
        </div>
        <button 
          onClick={() => setShowTutorial(true)}
          className="flex items-center gap-2 px-3 py-2 bg-[#E9E6F7] hover:bg-[#C8BFE7] text-[#7A6AD8] rounded-xl text-sm transition-colors border border-[#C8BFE7]"
        >
          <BrainCircuit className="w-4 h-4" />
          How AI Works
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <GlassCard className="p-6 border-l-4 border-[#7A6AD8]">
           <h3 className="text-[#9C8ADE] text-sm font-medium">Total Feedback</h3>
           <div className="text-4xl font-bold text-[#2E2E4D] mt-2">
             {feedbacks.length}
           </div>
        </GlassCard>
        <GlassCard className="p-6 border-l-4 border-[#8EC5E8]">
           <h3 className="text-[#9C8ADE] text-sm font-medium">Avg Rating</h3>
           <div className="text-4xl font-bold text-[#2E2E4D] mt-2">
             {(stats.reduce((acc, curr) => acc + curr.rating, 0) / (stats.length || 1)).toFixed(1)}
             <span className="text-sm text-[#9C8ADE] font-normal ml-2">/ 5.0</span>
           </div>
        </GlassCard>
        <GlassCard className="p-6 border-l-4 border-[#C8BFE7]">
           <h3 className="text-[#9C8ADE] text-sm font-medium">Courses</h3>
           <div className="text-4xl font-bold text-[#2E2E4D] mt-2">
             {courses.length}
           </div>
        </GlassCard>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
            <GlassCard>
              <h3 className="text-lg font-semibold text-[#2E2E4D] mb-6">Course Comparison Tool</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats} onClick={(data) => data && analyzeSubject(data.activePayload?.[0]?.payload)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E6F7" vertical={false} />
                    <XAxis dataKey="name" stroke="#9C8ADE" />
                    <YAxis stroke="#9C8ADE" domain={[0, 5]} />
                    <Tooltip content={<CustomTooltip />} cursor={{ fill: '#E9E6F7', opacity: 0.4 }} />
                    <Bar dataKey="rating" fill="url(#colorGradient)" radius={[6, 6, 0, 0]} className="cursor-pointer">
                       {stats.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                       ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-xs text-center text-[#9C8ADE] mt-2">Click on a bar to see detailed AI analysis</p>
            </GlassCard>

            <GlassCard>
               <h3 className="text-lg font-semibold text-[#2E2E4D] mb-6">Strength Analysis (Aggregate)</h3>
               <div className="h-[300px]">
                 <ResponsiveContainer width="100%" height="100%">
                   <RadarChart cx="50%" cy="50%" outerRadius="80%" data={overallAspects}>
                     <PolarGrid stroke="#E9E6F7" />
                     <PolarAngleAxis dataKey="subject" tick={{ fill: '#9C8ADE', fontSize: 12 }} />
                     <PolarRadiusAxis angle={30} domain={[0, 5]} tick={{ fill: '#6B6B8A' }} />
                     <Radar
                       name="Average"
                       dataKey="A"
                       stroke="#7A6AD8"
                       strokeWidth={3}
                       fill="#7A6AD8"
                       fillOpacity={0.2}
                     />
                     <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E9E6F7', color: '#2E2E4D' }} />
                   </RadarChart>
                 </ResponsiveContainer>
               </div>
            </GlassCard>
        </div>

        <div className="space-y-6">
           {/* AI Panel */}
           <GlassCard className="h-full bg-gradient-to-b from-[#F8F9FD] to-white border-[#E9E6F7]">
              <div className="flex items-center gap-2 mb-6">
                 <BrainCircuit className="text-[#7A6AD8] w-6 h-6" />
                 <h3 className="text-lg font-bold text-[#2E2E4D]">EduPulse AI</h3>
              </div>
              
              {!selectedSubjectStats ? (
                 <div className="text-center text-[#9C8ADE] py-10">
                    <Sparkles className="w-12 h-12 mx-auto mb-4 opacity-50" />
                    <p>Select a course from the chart to view AI insights.</p>
                 </div>
              ) : (
                 <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="space-y-6"
                 >
                    <div>
                       <span className="text-xs text-[#9C8ADE] uppercase tracking-widest">Subject</span>
                       <h4 className="text-xl font-bold text-[#2E2E4D]">{selectedSubjectStats.fullTitle}</h4>
                       <span className="text-xs text-[#7A6AD8] font-mono mt-1 block">{selectedSubjectStats.name}</span>
                    </div>

                    <div>
                       <span className="text-xs text-[#9C8ADE] uppercase tracking-widest">Sentiment Dashboard</span>
                       <div className="flex items-center gap-3 mt-2">
                          <div className={`text-2xl font-bold ${sentiment === 'Positive' ? 'text-green-500' : sentiment === 'Negative' ? 'text-red-500' : 'text-amber-500'}`}>
                             {sentiment}
                          </div>
                          {sentiment === 'Negative' && <AlertTriangle className="text-red-500 w-5 h-5" />}
                          {sentiment === 'Positive' && <TrendingUp className="text-green-500 w-5 h-5" />}
                       </div>
                    </div>

                    <div>
                       <span className="text-xs text-[#9C8ADE] uppercase tracking-widest">Technique Suggestions</span>
                       <ul className="mt-2 space-y-3">
                          {aiSuggestions.map((s, i) => (
                             <li key={i} className="flex gap-2 text-sm text-[#6B6B8A] bg-[#F8F9FD] p-2 rounded-xl border border-[#E9E6F7]">
                                <span className="text-[#7A6AD8]">•</span> {s}
                             </li>
                          ))}
                       </ul>
                    </div>
                 </motion.div>
              )}
           </GlassCard>
        </div>
      </div>
    </div>
  );
};
