import { projectId, publicAnonKey } from '../../../utils/supabase/info';
import { Course, Feedback, User, Role, DepartmentInfo, FeedbackForm } from '../types';

// Constants
const KEYS = {
  COURSES: 'courses',
  FEEDBACKS: 'feedbacks',
  USERS: 'users',
  DEPARTMENTS: 'departments',
  FEEDBACK_FORMS: 'feedback_forms',
};

// --- Low Level KV Helpers ---

const SERVER_URL = `https://${projectId}.supabase.co/functions/v1/make-server-40c29f38/kv`;

const get = async <T>(key: string): Promise<T | null> => {
  try {
    const response = await fetch(`${SERVER_URL}/${key}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      // If 404, it just means the key hasn't been set yet.
      if (response.status !== 404) {
        console.error(`Error fetching key ${key}:`, response.statusText);
      }
      return null;
    }

    const data = await response.json();
    return data.value as T;
  } catch (err) {
    console.error(`Exception fetching key ${key}:`, err);
    return null;
  }
};

const set = async (key: string, value: any) => {
  try {
    const response = await fetch(`${SERVER_URL}/${key}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${publicAnonKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ value }),
    });
    
    if (!response.ok) {
      console.error(`Error setting key ${key}:`, response.statusText);
    }
  } catch (err) {
    console.error(`Exception setting key ${key}:`, err);
  }
};

// --- Domain Specific Functions ---

// Departments
export const getDepartments = async (): Promise<DepartmentInfo[]> => {
  const data = await get<DepartmentInfo[]>(KEYS.DEPARTMENTS);
  return data || [];
};

export const setDepartments = async (departments: DepartmentInfo[]) => {
  await set(KEYS.DEPARTMENTS, departments);
};

export const addDepartment = async (department: DepartmentInfo) => {
  const departments = await getDepartments();
  departments.push(department);
  await set(KEYS.DEPARTMENTS, departments);
};

export const updateDepartment = async (id: string, updates: Partial<DepartmentInfo>) => {
  const departments = await getDepartments();
  const index = departments.findIndex(d => d.id === id);
  if (index !== -1) {
    departments[index] = { ...departments[index], ...updates };
    await set(KEYS.DEPARTMENTS, departments);
  }
};

// Feedback Forms
export const getFeedbackForms = async (): Promise<FeedbackForm[]> => {
  const data = await get<FeedbackForm[]>(KEYS.FEEDBACK_FORMS);
  return data || [];
};

export const setFeedbackForms = async (forms: FeedbackForm[]) => {
  await set(KEYS.FEEDBACK_FORMS, forms);
};

export const addFeedbackForm = async (form: FeedbackForm) => {
  const forms = await getFeedbackForms();
  forms.push(form);
  await set(KEYS.FEEDBACK_FORMS, forms);
};

export const updateFeedbackForm = async (id: string, updates: Partial<FeedbackForm>) => {
  const forms = await getFeedbackForms();
  const index = forms.findIndex(f => f.id === id);
  if (index !== -1) {
    forms[index] = { ...forms[index], ...updates };
    await set(KEYS.FEEDBACK_FORMS, forms);
  }
};

// Enhanced user management
export const updateUserLogin = async (userId: string, userInfo?: Partial<User>) => {
  const usersMap = await get<Record<string, User>>(KEYS.USERS) || {};
  
  // If user doesn't exist and userInfo is provided, create them
  if (!usersMap[userId] && userInfo) {
    usersMap[userId] = {
      id: userId,
      email: userInfo.email || '',
      name: userInfo.name || 'Unknown User',
      role: userInfo.role || 'student',
      department: userInfo.department || 'CS',
      isOnline: true,
      lastLogin: new Date().toISOString()
    };
  } else if (usersMap[userId]) {
    // Update existing user
    usersMap[userId].lastLogin = new Date().toISOString();
    usersMap[userId].isOnline = true;
    
    // Update additional info if provided
    if (userInfo) {
      if (userInfo.email) usersMap[userId].email = userInfo.email;
      if (userInfo.name) usersMap[userId].name = userInfo.name;
      if (userInfo.role) usersMap[userId].role = userInfo.role;
      if (userInfo.department) usersMap[userId].department = userInfo.department;
    }
  }
  
  await set(KEYS.USERS, usersMap);
};

export const getOnlineUsers = async (role?: Role, department?: string): Promise<User[]> => {
  const usersMap = await get<Record<string, User>>(KEYS.USERS) || {};
  const users = Object.values(usersMap);
  
  return users.filter(user => {
    if (!user.isOnline) return false;
    if (role && user.role !== role) return false;
    if (department && user.department !== department) return false;
    return true;
  });
};

export const getOnlineFacultyByDepartment = async (department?: string): Promise<User[]> => {
  return await getOnlineUsers('faculty', department);
};

export const getAllUsers = async (): Promise<User[]> => {
  const usersMap = await get<Record<string, User>>(KEYS.USERS) || {};
  return Object.values(usersMap);
};

export const addUser = async (user: User) => {
  const usersMap = await get<Record<string, User>>(KEYS.USERS) || {};
  usersMap[user.id] = user;
  await set(KEYS.USERS, usersMap);
};

// Courses
export const getCourses = async (): Promise<Course[]> => {
  const data = await get<Course[]>(KEYS.COURSES);
  return data || [];
};

export const setCourses = async (courses: Course[]) => {
  await set(KEYS.COURSES, courses);
};

export const addCourse = async (course: Course) => {
  const courses = await getCourses();
  courses.push(course);
  await set(KEYS.COURSES, courses);
};

export const updateCourse = async (id: string, updates: Partial<Course>) => {
  const courses = await getCourses();
  const index = courses.findIndex(c => c.id === id);
  if (index !== -1) {
    courses[index] = { ...courses[index], ...updates };
    await set(KEYS.COURSES, courses);
  }
};

export const deleteCourse = async (courseId: string) => {
  const courses = await getCourses();
  const updatedCourses = courses.filter(c => c.id !== courseId);
  await set(KEYS.COURSES, updatedCourses);
};

// Feedbacks
export const getFeedbacks = async (): Promise<Feedback[]> => {
  const data = await get<Feedback[]>(KEYS.FEEDBACKS);
  return data || [];
};

export const addFeedback = async (feedback: Feedback) => {
  const feedbacks = await getFeedbacks();
  feedbacks.push(feedback);
  await set(KEYS.FEEDBACKS, feedbacks);
};

// Users
export const getUserRole = async (userId: string): Promise<Role | null> => {
  const usersMap = await get<Record<string, User>>(KEYS.USERS) || {};
  return usersMap[userId]?.role || null;
};

export const setUserRole = async (user: User) => {
  const usersMap = await get<Record<string, User>>(KEYS.USERS) || {};
  usersMap[user.id] = user;
  await set(KEYS.USERS, usersMap);
};

// Seed function
export const seedDatabase = async () => {
  const courses = await getCourses();
  // Only seed if no courses exist
  if (courses.length === 0) {
    const mockCourses: Course[] = [
      // CS Department
      { id: 'c1', title: 'Advanced React Patterns', code: 'CS401', facultyId: 'f1', department: 'CS', description: 'Deep dive into React hooks and performance optimization.', isActive: true },
      { id: 'c2', title: 'UI/UX Design Principles', code: 'DES101', facultyId: 'f2', department: 'CS', description: 'Fundamentals of user-centric design and prototyping.', isActive: true },
      { id: 'c6', title: 'Data Structures & Algorithms', code: 'CS201', facultyId: 'f1', department: 'CS', description: 'Core concepts of trees, graphs, and dynamic programming.', isActive: true },
      { id: 'c7', title: 'Database Management Systems', code: 'CS301', facultyId: 'f2', department: 'CS', description: 'SQL, normalization, and transaction management.', isActive: true },
      { id: 'c8', title: 'Web Development', code: 'CS302', facultyId: 'f1', department: 'CS', description: 'Full-stack development with modern frameworks.', isActive: true },
      { id: 'c9', title: 'Software Engineering', code: 'CS501', facultyId: 'f2', department: 'CS', description: 'Agile methodologies and software design patterns.', isActive: true },
      
      // AIML Department
      { id: 'c3', title: 'Backend Architecture', code: 'CS502', facultyId: 'f1', department: 'AIML', description: 'Scalable systems with Node.js and Microservices.', isActive: true },
      { id: 'c10', title: 'Machine Learning', code: 'AIML301', facultyId: 'f5', department: 'AIML', description: 'Supervised and unsupervised learning algorithms.', isActive: true },
      { id: 'c11', title: 'Deep Learning', code: 'AIML401', facultyId: 'f5', department: 'AIML', description: 'Neural networks and CNN architectures.', isActive: true },
      { id: 'c12', title: 'Natural Language Processing', code: 'AIML402', facultyId: 'f5', department: 'AIML', description: 'Text analysis and transformer models.', isActive: true },
      { id: 'c13', title: 'Data Science', code: 'AIML201', facultyId: 'f5', department: 'AIML', description: 'Data analysis, visualization, and statistics.', isActive: true },
      { id: 'c14', title: 'Computer Vision', code: 'AIML403', facultyId: 'f5', department: 'AIML', description: 'Image processing and object detection.', isActive: true },
      
      // CHEMICAL Department
      { id: 'c4', title: 'Thermodynamics', code: 'CH201', facultyId: 'f3', department: 'CHEMICAL', description: 'Introduction to chemical thermodynamics and kinetics.', isActive: true },
      { id: 'c15', title: 'Chemical Process Design', code: 'CH301', facultyId: 'f3', department: 'CHEMICAL', description: 'Process flow diagrams and reactor design.', isActive: true },
      { id: 'c16', title: 'Mass Transfer', code: 'CH302', facultyId: 'f3', department: 'CHEMICAL', description: 'Diffusion, distillation, and extraction processes.', isActive: true },
      { id: 'c17', title: 'Fluid Mechanics', code: 'CH401', facultyId: 'f3', department: 'CHEMICAL', description: 'Fluid statics and dynamics in chemical systems.', isActive: true },
      { id: 'c18', title: 'Process Control', code: 'CH402', facultyId: 'f3', department: 'CHEMICAL', description: 'Automation and control systems in chemical plants.', isActive: true },
      { id: 'c19', title: 'Petrochemical Engineering', code: 'CH501', facultyId: 'f3', department: 'CHEMICAL', description: 'Refining processes and petrochemical products.', isActive: true },
      
      // ENTC Department
      { id: 'c5', title: 'Digital Signal Processing', code: 'EN301', facultyId: 'f4', department: 'ENTC', description: 'Analysis of discrete time signals and systems.', isActive: true },
      { id: 'c20', title: 'Analog Circuits', code: 'EN201', facultyId: 'f4', department: 'ENTC', description: 'Amplifiers, filters, and analog IC design.', isActive: true },
      { id: 'c21', title: 'Digital Communication', code: 'EN302', facultyId: 'f4', department: 'ENTC', description: 'Modulation techniques and channel coding.', isActive: true },
      { id: 'c22', title: 'Microprocessors', code: 'EN401', facultyId: 'f4', department: 'ENTC', description: '8086 architecture and embedded systems.', isActive: true },
      { id: 'c23', title: 'VLSI Design', code: 'EN402', facultyId: 'f4', department: 'ENTC', description: 'CMOS design and FPGA implementation.', isActive: true },
      { id: 'c24', title: 'Wireless Networks', code: 'EN501', facultyId: 'f4', department: 'ENTC', description: '5G, IoT protocols, and network security.', isActive: true },
    ];
    await set(KEYS.COURSES, mockCourses);
    
    // Mock feedback
    const mockFeedbacks: Feedback[] = [
      { id: 'fb1', courseId: 'c1', studentId: 's1', rating: 5, aspects: { clarity: 5, engagement: 4, materials: 5 }, comments: 'Amazing course!', timestamp: new Date().toISOString() },
      { id: 'fb2', courseId: 'c1', studentId: 's2', rating: 4, aspects: { clarity: 4, engagement: 4, materials: 3 }, comments: 'Good, but needs more examples.', timestamp: new Date().toISOString() },
      { id: 'fb3', courseId: 'c2', studentId: 's1', rating: 5, aspects: { clarity: 5, engagement: 5, materials: 5 }, comments: 'Loved the design projects.', timestamp: new Date().toISOString() },
      { id: 'fb4', courseId: 'c4', studentId: 's3', rating: 3, aspects: { clarity: 3, engagement: 2, materials: 4 }, comments: 'Difficult to follow.', timestamp: new Date().toISOString() },
    ];
    await set(KEYS.FEEDBACKS, mockFeedbacks);
    
    // Seed some mock users if possible? 
    // Usually users come from Auth, but we can store their metadata here for the dashboard to work immediately with the mock data
    const mockUsers: Record<string, User> = {
      's1': { id: 's1', email: 'student1@test.com', name: 'Alice Student', role: 'student', department: 'CS', isOnline: false },
      's2': { id: 's2', email: 'student2@test.com', name: 'Bob Student', role: 'student', department: 'CS', isOnline: false },
      's3': { id: 's3', email: 'student3@test.com', name: 'Charlie Chemical', role: 'student', department: 'CHEMICAL', isOnline: false },
      'f1': { id: 'f1', email: 'prof.smith@test.com', name: 'Prof. Smith', role: 'faculty', department: 'CS', isOnline: false },
      'f2': { id: 'f2', email: 'prof.doe@test.com', name: 'Prof. Doe', role: 'faculty', department: 'CS', isOnline: false },
      'f3': { id: 'f3', email: 'prof.chem@test.com', name: 'Dr. Mole', role: 'faculty', department: 'CHEMICAL', isOnline: false },
      'f4': { id: 'f4', email: 'prof.signal@test.com', name: 'Dr. Hertz', role: 'faculty', department: 'ENTC', isOnline: false },
    };
    await set(KEYS.USERS, mockUsers);
    
    // Seed departments
    const mockDepartments: DepartmentInfo[] = [
      { id: 'd1', name: 'CS', hod: 'Prof. Smith', description: 'Computer Science Department', isActive: true },
      { id: 'd2', name: 'AIML', hod: 'Dr. Watson', description: 'Artificial Intelligence & Machine Learning Department', isActive: true },
      { id: 'd3', name: 'CHEMICAL', hod: 'Dr. Mole', description: 'Chemical Engineering Department', isActive: true },
      { id: 'd4', name: 'ENTC', hod: 'Dr. Hertz', description: 'Electronics & Telecommunication Department', isActive: true },
    ];
    await set(KEYS.DEPARTMENTS, mockDepartments);

    console.log('Database seeded via Server!');
  }
};
