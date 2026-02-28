import React, { useState, useEffect } from 'react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { GlassCard } from '../ui/GlassCard';
import { addCourse, getCourses, getFeedbacks, getUserRole, deleteCourse, setCourses, getDepartments, getOnlineUsers, addDepartment, getOnlineFacultyByDepartment, getAllUsers, addUser } from '../../utils/storage';
import { FeedbackFormManager } from './FeedbackFormManager';
import { toast } from 'sonner';
import { Course, Department, Feedback, DepartmentInfo, User } from '../../types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { BookOpen, MessageSquare, Upload, AlertTriangle, TrendingDown, BrainCircuit, RefreshCw, Trash2 } from 'lucide-react';
import { projectId, publicAnonKey } from '../../../../utils/supabase/info';
import { AITutorial } from '../AITutorial';

const COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b'];

export const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'courses' | 'students' | 'departments' | 'feedback-forms' | 'users'>('dashboard');
  const [courses, setCourses] = useState<Course[]>([]);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [departments, setDepartments] = useState<DepartmentInfo[]>([]);
  const [onlineStudents, setOnlineStudents] = useState<User[]>([]);
  const [onlineFaculty, setOnlineFaculty] = useState<User[]>([]);
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [onlineFacultyByDept, setOnlineFacultyByDept] = useState<Record<string, User[]>>({});
  const [stats, setStats] = useState<any>(null);
  const [showTutorial, setShowTutorial] = useState(false);
  const [aiSummary, setAiSummary] = useState<string>('');
  const [loadingSummary, setLoadingSummary] = useState(false);

  // Department Form
  const [deptName, setDeptName] = useState<Department>('CS');
  const [deptHod, setDeptHod] = useState('');
  const [deptDesc, setDeptDesc] = useState('');
  const [deptLoading, setDeptLoading] = useState(false);

  // User Management Form
  const [userEmail, setUserEmail] = useState('');
  const [userName, setUserName] = useState('');
  const [userRole, setUserRole] = useState<'student' | 'faculty'>('student');
  const [userDepartment, setUserDepartment] = useState<Department>('CS');
  const [userLoading, setUserLoading] = useState(false);

  // Course Form with Faculty Selection
  const [selectedFaculty, setSelectedFaculty] = useState<string>('');
  const [facultyEmail, setFacultyEmail] = useState<string>('');

  // Course Form
  const [title, setTitle] = useState('');
  const [code, setCode] = useState('');
  const [desc, setDesc] = useState('');
  const [dept, setDept] = useState<Department>('CS');
  const [customQs, setCustomQs] = useState(''); // New state
  const [loading, setLoading] = useState(false);

  // Bulk Import
  const [importText, setImportText] = useState('');
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const allCourses = await getCourses();
    const allFeedbacks = await getFeedbacks();
    const allDepartments = await getDepartments();
    const onlineStudentsData = await getOnlineUsers('student');
    const onlineFacultyData = await getOnlineUsers('faculty');
    const allUsersData = await getAllUsers();
    
    // Get online faculty by department
    const facultyByDept: Record<string, User[]> = {};
    for (const dept of ['CS', 'AIML', 'CHEMICAL', 'ENTC', 'General']) {
      facultyByDept[dept] = await getOnlineFacultyByDepartment(dept);
    }
    
    setCourses(allCourses);
    setFeedbacks(allFeedbacks);
    setDepartments(allDepartments);
    setOnlineStudents(onlineStudentsData);
    setOnlineFaculty(onlineFacultyData);
    setAllUsers(allUsersData);
    setOnlineFacultyByDept(facultyByDept);

    // Calculate Stats
    const deptStats: Record<string, { ratingSum: number; count: number }> = {};
    const lowPerfCourses: any[] = [];
    
    allCourses.forEach(c => {
       const cFeedbacks = allFeedbacks.filter(f => f.courseId === c.id);
       const avg = cFeedbacks.length > 0 
          ? cFeedbacks.reduce((a, b) => a + b.rating, 0) / cFeedbacks.length 
          : 0;
          
       if (cFeedbacks.length > 0 && avg < 3.5) {
          lowPerfCourses.push({
             ...c,
             avgRating: parseFloat(avg.toFixed(1))
          });
       }
    });

    allFeedbacks.forEach(f => {
      const course = allCourses.find(c => c.id === f.courseId);
      if (course) {
        if (!deptStats[course.department]) {
          deptStats[course.department] = { ratingSum: 0, count: 0 };
        }
        deptStats[course.department].ratingSum += f.rating;
        deptStats[course.department].count += 1;
      }
    });

    const chartData = Object.entries(deptStats).map(([name, data]) => ({
      name,
      avgRating: parseFloat((data.ratingSum / data.count).toFixed(1)),
      feedbackCount: data.count
    }));

    setStats({
      totalCourses: allCourses.length,
      totalFeedback: allFeedbacks.length,
      chartData,
      lowPerfCourses
    });
  };

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }
    
    try {
      await deleteCourse(courseId);
      toast.success('Course deleted successfully');
      fetchData();
    } catch (e) {
      toast.error('Failed to delete course');
    }
  };

  const handleResetCourses = async () => {
    if (!confirm('⚠️ WARNING: This will DELETE all existing courses and reseed with 24 new courses.\n\nAre you sure you want to continue?')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // New courses with all departments
      const newCourses: Course[] = [
        // CS Department
        { id: crypto.randomUUID(), title: 'Advanced React Patterns', code: 'CS401', facultyId: 'f1', department: 'CS', description: 'Deep dive into React hooks and performance optimization.', isActive: true },
        { id: crypto.randomUUID(), title: 'UI/UX Design Principles', code: 'DES101', facultyId: 'f2', department: 'CS', description: 'Fundamentals of user-centric design and prototyping.', isActive: true },
        { id: crypto.randomUUID(), title: 'Data Structures & Algorithms', code: 'CS201', facultyId: 'f1', department: 'CS', description: 'Core concepts of trees, graphs, and dynamic programming.', isActive: true },
        { id: crypto.randomUUID(), title: 'Database Management Systems', code: 'CS301', facultyId: 'f2', department: 'CS', description: 'SQL, normalization, and transaction management.', isActive: true },
        { id: crypto.randomUUID(), title: 'Web Development', code: 'CS302', facultyId: 'f1', department: 'CS', description: 'Full-stack development with modern frameworks.', isActive: true },
        { id: crypto.randomUUID(), title: 'Software Engineering', code: 'CS501', facultyId: 'f2', department: 'CS', description: 'Agile methodologies and software design patterns.', isActive: true },
        
        // AIML Department
        { id: crypto.randomUUID(), title: 'Backend Architecture', code: 'CS502', facultyId: 'f1', department: 'AIML', description: 'Scalable systems with Node.js and Microservices.', isActive: true },
        { id: crypto.randomUUID(), title: 'Machine Learning', code: 'AIML301', facultyId: 'f5', department: 'AIML', description: 'Supervised and unsupervised learning algorithms.', isActive: true },
        { id: crypto.randomUUID(), title: 'Deep Learning', code: 'AIML401', facultyId: 'f5', department: 'AIML', description: 'Neural networks and CNN architectures.', isActive: true },
        { id: crypto.randomUUID(), title: 'Natural Language Processing', code: 'AIML402', facultyId: 'f5', department: 'AIML', description: 'Text analysis and transformer models.', isActive: true },
        { id: crypto.randomUUID(), title: 'Data Science', code: 'AIML201', facultyId: 'f5', department: 'AIML', description: 'Data analysis, visualization, and statistics.', isActive: true },
        { id: crypto.randomUUID(), title: 'Computer Vision', code: 'AIML403', facultyId: 'f5', department: 'AIML', description: 'Image processing and object detection.', isActive: true },
        
        // CHEMICAL Department
        { id: crypto.randomUUID(), title: 'Thermodynamics', code: 'CH201', facultyId: 'f3', department: 'CHEMICAL', description: 'Introduction to chemical thermodynamics and kinetics.', isActive: true },
        { id: crypto.randomUUID(), title: 'Chemical Process Design', code: 'CH301', facultyId: 'f3', department: 'CHEMICAL', description: 'Process flow diagrams and reactor design.', isActive: true },
        { id: crypto.randomUUID(), title: 'Mass Transfer', code: 'CH302', facultyId: 'f3', department: 'CHEMICAL', description: 'Diffusion, distillation, and extraction processes.', isActive: true },
        { id: crypto.randomUUID(), title: 'Fluid Mechanics', code: 'CH401', facultyId: 'f3', department: 'CHEMICAL', description: 'Fluid statics and dynamics in chemical systems.', isActive: true },
        { id: crypto.randomUUID(), title: 'Process Control', code: 'CH402', facultyId: 'f3', department: 'CHEMICAL', description: 'Automation and control systems in chemical plants.', isActive: true },
        { id: crypto.randomUUID(), title: 'Petrochemical Engineering', code: 'CH501', facultyId: 'f3', department: 'CHEMICAL', description: 'Refining processes and petrochemical products.', isActive: true },
        
        // ENTC Department
        { id: crypto.randomUUID(), title: 'Digital Signal Processing', code: 'EN301', facultyId: 'f4', department: 'ENTC', description: 'Analysis of discrete time signals and systems.', isActive: true },
        { id: crypto.randomUUID(), title: 'Analog Circuits', code: 'EN201', facultyId: 'f4', department: 'ENTC', description: 'Amplifiers, filters, and analog IC design.', isActive: true },
        { id: crypto.randomUUID(), title: 'Digital Communication', code: 'EN302', facultyId: 'f4', department: 'ENTC', description: 'Modulation techniques and channel coding.', isActive: true },
        { id: crypto.randomUUID(), title: 'Microprocessors', code: 'EN401', facultyId: 'f4', department: 'ENTC', description: '8086 architecture and embedded systems.', isActive: true },
        { id: crypto.randomUUID(), title: 'VLSI Design', code: 'EN402', facultyId: 'f4', department: 'ENTC', description: 'CMOS design and FPGA implementation.', isActive: true },
        { id: crypto.randomUUID(), title: 'Wireless Networks', code: 'EN501', facultyId: 'f4', department: 'ENTC', description: '5G, IoT protocols, and network security.', isActive: true },
      ];
      
      await setCourses(newCourses);
      toast.success(`✅ Reset complete! Added ${newCourses.length} courses (6 per department)`);
      fetchData();
    } catch (e) {
      toast.error('Failed to reset courses');
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const generateAISummary = async () => {
    setLoadingSummary(true);
    try {
      // Group feedbacks by department
      const deptFeedbacks: Record<string, Feedback[]> = {};
      feedbacks.forEach(f => {
        const course = courses.find(c => c.id === f.courseId);
        if (course) {
          if (!deptFeedbacks[course.department]) {
            deptFeedbacks[course.department] = [];
          }
          deptFeedbacks[course.department].push(f);
        }
      });

      // Generate AI summary for each department
      let summary = '🤖 **AI Analysis & Improvement Suggestions**\n\n';
      
      Object.entries(deptFeedbacks).forEach(([dept, feedbacks]) => {
        const avgRating = feedbacks.reduce((a, b) => a + b.rating, 0) / feedbacks.length;
        const lowRatingFeedbacks = feedbacks.filter(f => f.rating <= 2);
        const highRatingFeedbacks = feedbacks.filter(f => f.rating >= 4);
        
        // Extract common themes from comments
        const comments = feedbacks.map(f => f.comments).filter(c => c && c.trim());
        const commonIssues = comments.filter(c => 
          c.toLowerCase().includes('difficult') || 
          c.toLowerCase().includes('confusing') || 
          c.toLowerCase().includes('slow') ||
          c.toLowerCase().includes('boring')
        );
        
        const commonPraises = comments.filter(c => 
          c.toLowerCase().includes('excellent') || 
          c.toLowerCase().includes('helpful') || 
          c.toLowerCase().includes('clear') ||
          c.toLowerCase().includes('engaging')
        );

        summary += `## ${dept} Department\n`;
        summary += `**Average Rating:** ${avgRating.toFixed(1)}/5.0\n`;
        summary += `**Total Feedback:** ${feedbacks.length}\n\n`;
        
        if (avgRating < 3.5) {
          summary += `🔴 **Needs Improvement**\n`;
          summary += `**Suggested Changes:**\n`;
          
          if (commonIssues.length > 0) {
            summary += `- Review course content for clarity and engagement\n`;
            summary += `- Consider updating teaching methods to be more interactive\n`;
            summary += `- Provide additional learning resources\n`;
          }
          
          if (lowRatingFeedbacks.length > feedbacks.length * 0.3) {
            summary += `- Schedule regular feedback sessions with students\n`;
            summary += `- Consider peer tutoring programs\n`;
          }
          
          summary += `- Update course materials based on student feedback\n`;
          summary += `- Implement practical examples and hands-on activities\n\n`;
        } else if (avgRating >= 4.0) {
          summary += `🟢 **Excellent Performance**\n`;
          summary += `**Recommendations:**\n`;
          summary += `- Document successful teaching methods\n`;
          summary += `- Share best practices with other faculty\n`;
          summary += `- Consider advanced course offerings\n\n`;
        } else {
          summary += `🟡 **Good Performance**\n`;
          summary += `**Minor Improvements:**\n`;
          summary += `- Continue current teaching approach\n`;
          summary += `- Add more interactive elements\n`;
          summary += `- Regular feedback collection\n\n`;
        }
        
        if (commonPraises.length > 0) {
          summary += `**Strengths Identified:**\n`;
          summary += `- Clear explanations and examples\n`;
          summary += `- Engaging teaching style\n`;
          summary += `- Good course structure\n\n`;
        }
        
        summary += `---\n\n`;
      });

      setAiSummary(summary);
    } catch (e) {
      toast.error('Failed to generate AI summary');
    } finally {
      setLoadingSummary(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setUserLoading(true);
    try {
      const newUser: User = {
        id: crypto.randomUUID(),
        email: userEmail,
        name: userName,
        role: userRole,
        department: userRole === 'student' ? userDepartment : undefined,
        isOnline: false
      };
      
      await addUser(newUser);
      toast.success(`${userRole === 'student' ? 'Student' : 'Faculty'} added successfully`);
      setUserEmail('');
      setUserName('');
      setUserRole('student');
      setUserDepartment('CS');
      fetchData();
    } catch (e) {
      toast.error('Failed to add user');
    } finally {
      setUserLoading(false);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const questions = customQs.split('\n').map(q => q.trim()).filter(q => q);
      const course: Course = {
        id: crypto.randomUUID(),
        title,
        code,
        department: dept,
        facultyId: facultyEmail, // Store faculty email directly
        description: desc,
        customQuestions: questions.length > 0 ? questions : undefined,
        isActive: true
      };
      await addCourse(course);
      toast.success('Course added successfully');
      setTitle('');
      setCode('');
      setDesc('');
      setCustomQs('');
      setFacultyEmail(''); // Reset faculty email
      fetchData();
    } catch (e) {
      toast.error('Failed to add course');
    } finally {
      setLoading(false);
    }
  };

  const handleBulkImport = async () => {
    if (!importText.trim()) return;
    setImporting(true);
    
    const lines = importText.split('\n').filter(l => l.trim());
    let successCount = 0;
    let failCount = 0;

    for (const line of lines) {
      // Format: email, name, department
      const parts = line.split(',').map(s => s.trim());
      if (parts.length < 2) continue;
      
      const [email, name, department] = parts;
      const userDept = (department as Department) || 'CS';
      const password = 'Student@123'; // Default password

      try {
        const response = await fetch(`https://${projectId}.supabase.co/functions/v1/make-server-40c29f38/signup`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${publicAnonKey}`
          },
          body: JSON.stringify({
            email,
            password,
            data: {
              name,
              role: 'student',
              department: userDept,
            },
          }),
        });

        if (!response.ok) throw new Error('Failed');
        successCount++;
      } catch (e) {
        console.error(`Failed to import ${email}`, e);
        failCount++;
      }
    }

    toast.success(`Import complete: ${successCount} added, ${failCount} failed`);
    setImportText('');
    setImporting(false);
  };

  return (
    <div className="space-y-6 relative">
      <AITutorial isOpen={showTutorial} onClose={() => setShowTutorial(false)} defaultRole="admin" />

      {/* Tab Navigation */}
      <div className="flex justify-between items-center mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'dashboard' ? 'bg-[#7A6AD8] text-white' : 'text-[#6B6B8A] hover:text-[#5B4FCF] hover:bg-[#E9E6F7]'}`}
          >
            Dashboard
          </button>
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'courses' ? 'bg-[#7A6AD8] text-white' : 'text-[#6B6B8A] hover:text-[#5B4FCF] hover:bg-[#E9E6F7]'}`}
          >
            Manage Courses
          </button>
          <button
            onClick={() => setActiveTab('departments')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'departments' ? 'bg-[#7A6AD8] text-white' : 'text-[#6B6B8A] hover:text-[#5B4FCF] hover:bg-[#E9E6F7]'}`}
          >
            Departments
          </button>
          <button
            onClick={() => setActiveTab('feedback-forms')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'feedback-forms' ? 'bg-[#7A6AD8] text-white' : 'text-[#6B6B8A] hover:text-[#5B4FCF] hover:bg-[#E9E6F7]'}`}
          >
            Feedback Forms
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'users' ? 'bg-[#7A6AD8] text-white' : 'text-[#6B6B8A] hover:text-[#5B4FCF] hover:bg-[#E9E6F7]'}`}
          >
            Users
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${activeTab === 'students' ? 'bg-[#7A6AD8] text-white' : 'text-[#6B6B8A] hover:text-[#5B4FCF] hover:bg-[#E9E6F7]'}`}
          >
            Bulk Import
          </button>
        </div>
        <button 
           onClick={() => setShowTutorial(true)}
           className="text-xs text-[#7A6AD8] hover:text-[#5B4FCF] flex items-center gap-1"
        >
           <BrainCircuit className="w-4 h-4" />
           AI Help
        </button>
        <button 
           onClick={generateAISummary}
           className="text-xs text-green-500 hover:text-green-600 flex items-center gap-1 ml-2"
        >
           <BrainCircuit className="w-4 h-4" />
           AI Summary
        </button>
      </div>

      {activeTab === 'dashboard' && stats && (
        <div className="space-y-6">
          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
             <GlassCard className="p-4 flex items-center justify-between">
                <div>
                   <p className="text-[#9C8ADE] text-xs">Total Courses</p>
                   <p className="text-2xl font-bold text-[#2E2E4D]">{stats.totalCourses}</p>
                </div>
                <BookOpen className="text-[#7A6AD8] w-8 h-8 opacity-50" />
             </GlassCard>
             <GlassCard className="p-4 flex items-center justify-between">
                <div>
                   <p className="text-[#9C8ADE] text-xs">Total Feedback</p>
                   <p className="text-2xl font-bold text-[#2E2E4D]">{stats.totalFeedback}</p>
                </div>
                <MessageSquare className="text-[#8EC5E8] w-8 h-8 opacity-50" />
             </GlassCard>
             <GlassCard className="p-4 flex items-center justify-between">
                <div>
                   <p className="text-[#9C8ADE] text-xs">Online Students</p>
                   <p className="text-2xl font-bold text-[#2E2E4D]">{onlineStudents.length}</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                   <div className="w-4 h-4 rounded-full bg-green-500"></div>
                </div>
             </GlassCard>
             <GlassCard className="p-4 flex items-center justify-between border-l-4 border-red-400 bg-red-50">
                <div>
                   <p className="text-red-500 text-xs">At Risk Courses</p>
                   <p className="text-2xl font-bold text-[#2E2E4D]">{stats.lowPerfCourses.length}</p>
                </div>
                <AlertTriangle className="text-red-400 w-8 h-8 opacity-50" />
             </GlassCard>
          </div>
          
          {/* Predictive Alerts Widget */}
          {stats.lowPerfCourses.length > 0 && (
             <GlassCard className="bg-red-50 border-red-200">
                <div className="flex items-center gap-2 mb-4">
                   <TrendingDown className="text-red-500 w-5 h-5" />
                   <h3 className="font-bold text-[#2E2E4D]">Predictive Alerts: Low Satisfaction Detected</h3>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                   {stats.lowPerfCourses.map((c: any) => (
                      <div key={c.id} className="bg-white p-3 rounded-xl border border-red-200 flex justify-between items-center">
                         <div>
                            <div className="font-bold text-[#2E2E4D]">{c.code}</div>
                            <div className="text-xs text-[#6B6B8A]">{c.title}</div>
                         </div>
                         <div className="text-2xl font-bold text-red-400">{c.avgRating}</div>
                      </div>
                   ))}
                </div>
             </GlassCard>
          )}

          {/* AI Summary Widget */}
          {aiSummary && (
             <GlassCard className="bg-green-50 border-green-200">
                <div className="flex items-center gap-2 mb-4">
                   <BrainCircuit className="text-green-500 w-5 h-5" />
                   <h3 className="font-bold text-[#2E2E4D]">AI Analysis & Improvement Suggestions</h3>
                </div>
                <div className="prose max-w-none">
                   <div className="text-sm text-[#6B6B8A] leading-relaxed whitespace-pre-line">{aiSummary}</div>
                </div>
             </GlassCard>
          )}

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GlassCard>
              <h3 className="text-lg font-semibold text-[#2E2E4D] mb-6">Department Ratings</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E9E6F7" />
                    <XAxis dataKey="name" stroke="#9C8ADE" />
                    <YAxis stroke="#9C8ADE" domain={[0, 5]} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#fff', borderColor: '#E9E6F7', color: '#2E2E4D' }}
                      cursor={{ fill: '#E9E6F7', opacity: 0.4 }}
                    />
                    <Bar dataKey="avgRating" fill="#7A6AD8" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>

            <GlassCard>
              <h3 className="text-lg font-semibold text-[#2E2E4D] mb-6">Feedback Distribution</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={stats.chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="feedbackCount"
                    >
                      {stats.chartData.map((entry: any, index: number) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderColor: '#E9E6F7', color: '#2E2E4D' }} />
                    <Legend wrapperStyle={{ color: '#6B6B8A' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </GlassCard>
          </div>
        </div>
      )}

      {activeTab === 'courses' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
           {/* Reset/Reseed Button - Full Width Alert */}
           <div className="lg:col-span-3">
             <GlassCard className="bg-amber-50 border-amber-200 p-4">
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-3">
                   <div className="p-2 bg-amber-100 rounded-lg">
                     <RefreshCw className="w-5 h-5 text-amber-500" />
                   </div>
                   <div>
                     <h3 className="font-bold text-[#2E2E4D]">Reset All Courses</h3>
                     <p className="text-sm text-[#6B6B8A]">Delete all existing courses and reseed with 24 new courses (6 per department)</p>
                   </div>
                 </div>
                 <Button 
                   onClick={handleResetCourses} 
                   isLoading={loading}
                   className="bg-amber-500 hover:bg-amber-600 text-white"
                 >
                   <RefreshCw className="w-4 h-4 mr-2" />
                   Reset & Reseed
                 </Button>
               </div>
             </GlassCard>
           </div>

           <div className="lg:col-span-1">
              <GlassCard>
                <h2 className="text-xl font-bold text-[#2E2E4D] mb-6">Add New Course</h2>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <div>
                    <label className="block text-sm text-[#6B6B8A] mb-1">Department</label>
                    <select 
                      className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                      value={dept}
                      onChange={e => {
                        setDept(e.target.value as Department);
                        setFacultyEmail(''); // Reset faculty email when department changes
                      }}
                    >
                      {['CS', 'AIML', 'ENTC', 'CHEMICAL'].map(d => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B6B8A] mb-1">Faculty Email</label>
                    <Input 
                      type="email"
                      value={facultyEmail} 
                      onChange={e => setFacultyEmail(e.target.value)} 
                      placeholder="faculty@university.edu"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B6B8A] mb-1">Course Code</label>
                    <Input value={code} onChange={e => setCode(e.target.value)} placeholder="e.g. CS101" required />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B6B8A] mb-1">Course Title</label>
                    <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Course Name" required />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B6B8A] mb-1">Description</label>
                    <textarea 
                      className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                      value={desc} 
                      onChange={e => setDesc(e.target.value)} 
                      placeholder="Description..."
                    />
                  </div>
                  <div>
                    <label className="block text-sm text-[#6B6B8A] mb-1">Custom Questions (Optional, one per line)</label>
                    <textarea 
                      className="w-full h-24 bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                      value={customQs} 
                      onChange={e => setCustomQs(e.target.value)} 
                      placeholder="e.g. How was the lab equipment?&#10;Was the grading fair?"
                    />
                  </div>
                  <Button type="submit" isLoading={loading} className="w-full">Create Course</Button>
                </form>
              </GlassCard>
           </div>
           
           <div className="lg:col-span-2">
              <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">Current Courses ({courses.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {courses.map(course => (
                   <GlassCard key={course.id} className="p-4 relative group">
                      <span className="absolute top-4 right-4 text-xs font-bold text-[#9C8ADE] bg-[#E9E6F7] px-2 py-1 rounded">
                        {course.department}
                      </span>
                      <h3 className="font-bold text-[#2E2E4D]">{course.title}</h3>
                      <p className="text-sm text-[#6B6B8A] mb-2">{course.code}</p>
                      <p className="text-xs text-[#9C8ADE] mb-2">
                        Faculty: {course.facultyId}
                      </p>
                      <p className="text-xs text-[#9C8ADE] line-clamp-2">{course.description}</p>
                      <div className="mt-3 flex gap-2">
                         <button
                            onClick={() => handleDeleteCourse(course.id)}
                            className="text-xs bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition-colors flex items-center gap-1"
                         >
                            <Trash2 className="w-3 h-3" />
                            Delete
                         </button>
                      </div>
                   </GlassCard>
                ))}
              </div>
              {courses.length === 0 && (
                <div className="text-center py-8 text-[#9C8ADE]">
                  <p>No courses found. Click "Reset & Reseed" to add 24 courses.</p>
                </div>
              )}
           </div>
        </div>
      )}

      {activeTab === 'departments' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">Add Department</h3>
            <form onSubmit={async (e) => {
              e.preventDefault();
              setDeptLoading(true);
              try {
                const newDept: DepartmentInfo = {
                  id: crypto.randomUUID(),
                  name: deptName,
                  hod: deptHod,
                  description: deptDesc,
                  isActive: true
                };
                await addDepartment(newDept);
                toast.success('Department added successfully');
                setDeptHod('');
                setDeptDesc('');
                fetchData();
              } catch (e) {
                toast.error('Failed to add department');
              } finally {
                setDeptLoading(false);
              }
            }} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Department Name</label>
                <select 
                  className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                  value={deptName} 
                  onChange={e => setDeptName(e.target.value as Department)}
                >
                  <option value="CS">Computer Science</option>
                  <option value="AIML">AI & Machine Learning</option>
                  <option value="CHEMICAL">Chemical Engineering</option>
                  <option value="ENTC">Electronics & Telecommunication</option>
                  <option value="General">General</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Faculty (Online Only)</label>
                <select 
                  className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                  value={selectedFaculty} 
                  onChange={e => setSelectedFaculty(e.target.value)}
                  required
                >
                  <option value="">Select Faculty</option>
                  {onlineFacultyByDept[deptName]?.map(faculty => (
                    <option key={faculty.id} value={faculty.id}>
                      {faculty.name} ({faculty.email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Head of Department</label>
                <Input 
                  value={deptHod} 
                  onChange={e => setDeptHod(e.target.value)} 
                  placeholder="HOD Name..."
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Description</label>
                <textarea 
                  className="w-full h-24 bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                  value={deptDesc} 
                  onChange={e => setDeptDesc(e.target.value)} 
                  placeholder="Department description..."
                  required
                />
              </div>
              <Button type="submit" isLoading={deptLoading} className="w-full">Create Department</Button>
            </form>
          </GlassCard>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">Current Departments ({departments.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {departments.map(dept => (
                <GlassCard key={dept.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-bold text-[#2E2E4D]">{dept.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${dept.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {dept.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B6B8A] mb-1">HOD: {dept.hod}</p>
                  <p className="text-xs text-[#9C8ADE] line-clamp-2">{dept.description}</p>
                </GlassCard>
              ))}
            </div>
            {departments.length === 0 && (
              <div className="text-center py-8 text-[#9C8ADE]">
                <p>No departments found. Add your first department above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'feedback-forms' && (
        <FeedbackFormManager />
      )}

      {activeTab === 'users' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <GlassCard>
            <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">Add User</h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Email</label>
                <Input 
                  type="email"
                  value={userEmail} 
                  onChange={e => setUserEmail(e.target.value)} 
                  placeholder="user@example.com"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Name</label>
                <Input 
                  value={userName} 
                  onChange={e => setUserName(e.target.value)} 
                  placeholder="Full Name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm text-[#6B6B8A] mb-1">Role</label>
                <select 
                  className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                  value={userRole} 
                  onChange={e => setUserRole(e.target.value as 'student' | 'faculty')}
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>
              </div>
              {userRole === 'student' && (
                <div>
                  <label className="block text-sm text-[#6B6B8A] mb-1">Department</label>
                  <select 
                    className="w-full bg-white border-2 border-[#E9E6F7] rounded-xl p-3 text-[#2E2E4D] focus:outline-none focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                    value={userDepartment} 
                    onChange={e => setUserDepartment(e.target.value as Department)}
                  >
                    <option value="CS">Computer Science</option>
                    <option value="AIML">AI & Machine Learning</option>
                    <option value="CHEMICAL">Chemical Engineering</option>
                    <option value="ENTC">Electronics & Telecommunication</option>
                    <option value="General">General</option>
                  </select>
                </div>
              )}
              <Button type="submit" isLoading={userLoading} className="w-full">Add User</Button>
            </form>
          </GlassCard>
          
          <div className="lg:col-span-2">
            <h3 className="text-lg font-bold text-[#2E2E4D] mb-4">All Users ({allUsers.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {allUsers.map(user => (
                <GlassCard key={user.id} className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="font-semibold text-[#2E2E4D]">{user.name}</h4>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.isOnline ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {user.isOnline ? 'Online' : 'Offline'}
                    </span>
                  </div>
                  <p className="text-sm text-[#6B6B8A] mb-1">{user.email}</p>
                  <p className="text-xs text-[#9C8ADE] capitalize mb-1">Role: {user.role}</p>
                  {user.department && (
                    <p className="text-xs text-[#9C8ADE]">Department: {user.department}</p>
                  )}
                </GlassCard>
              ))}
            </div>
            {allUsers.length === 0 && (
              <div className="text-center py-8 text-[#9C8ADE]">
                <p>No users found. Add your first user above.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'students' && (
        <GlassCard className="max-w-2xl mx-auto">
           <div className="flex items-center gap-3 mb-6">
              <div className="p-3 bg-[#E9E6F7] rounded-lg">
                 <Upload className="text-[#7A6AD8] w-6 h-6" />
              </div>
              <div>
                 <h2 className="text-xl font-bold text-[#2E2E4D]">Bulk Student Import</h2>
                 <p className="text-[#6B6B8A] text-sm">Add multiple students at once. Default password: Student@123</p>
              </div>
           </div>

           <div className="space-y-4">
              <div className="bg-[#F8F9FD] p-4 rounded-xl border border-[#E9E6F7]">
                 <p className="text-xs text-[#9C8ADE] mb-2 font-mono">Format: email, name, department</p>
                 <div className="text-xs text-[#6B6B8A] font-mono">
                    student1@example.com, John Doe, CS<br/>
                    student2@example.com, Jane Smith, AIML
                 </div>
              </div>

              <textarea 
                className="w-full h-48 bg-white border-2 border-[#E9E6F7] rounded-xl p-4 text-[#2E2E4D] font-mono text-sm focus:ring-2 focus:ring-[#7A6AD8]/30 focus:border-[#7A6AD8]"
                placeholder="Paste your CSV data here..."
                value={importText}
                onChange={e => setImportText(e.target.value)}
              />

              <Button 
                onClick={handleBulkImport} 
                isLoading={importing} 
                className="w-full"
                disabled={!importText.trim()}
              >
                 Import Students
              </Button>
           </div>
        </GlassCard>
      )}
    </div>
  );
};
