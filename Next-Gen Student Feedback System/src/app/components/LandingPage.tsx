/**
 * LandingPage Component
 * 
 * A modern, accessible landing page for EduPulse with:
 * - Soft pastel purple (#E9E6F7 → #5B4FCF) and blue (#CFE7F5 → #8EC5E8) gradient theme
 * - Animated abstract blob shapes in corners
 * - Smooth curves and rounded elements
 * - Minimal, clean, professional startup style
 * 
 * Color Palette:
 * - Soft Lavender: #E9E6F7
 * - Light Purple: #C8BFE7
 * - Pastel Violet: #9C8ADE
 * - Medium Purple (Buttons): #7A6AD8
 * - Deep Purple (Text): #5B4FCF
 * - Pastel Blue: #CFE7F5
 * - Soft Sky Blue: #A9D3F0
 * - Light Teal-Blue: #8EC5E8
 * - Off White Background: #F8F9FD
 * - Dark Navy Text: #2E2E4D
 * - Soft Gray Text: #6B6B8A
 * 
 * INTEGRATION EXAMPLE:
 * 
 * In your App.tsx:
 * 
 * import { LandingPage } from './components/LandingPage';
 * 
 * function App() {
 *   const [showLanding, setShowLanding] = useState(true);
 *   
 *   if (showLanding) {
 *     return <LandingPage onGetStarted={() => setShowLanding(false)} />;
 *   }
 *   
 *   return <YourAuthApp />;
 * }
 */

import React from 'react';
import { motion } from 'motion/react';
import { 
  MessageSquare, 
  BarChart3, 
  Zap, 
  Shield, 
  Users, 
  Star,
  ArrowRight,
  CheckCircle,
  GraduationCap,
  Sparkles,
  Heart,
  TrendingUp
} from 'lucide-react';

// Color palette constants based on user's specification
const colors = {
  // Lavender/Purple tones
  softLavender: '#E9E6F7',
  lightPurple: '#C8BFE7',
  pastelViolet: '#9C8ADE',
  mediumPurple: '#7A6AD8',
  deepPurple: '#5B4FCF',
  
  // Blue tones
  pastelBlue: '#CFE7F5',
  softSkyBlue: '#A9D3F0',
  lightTealBlue: '#8EC5E8',
  
  // Neutrals
  offWhite: '#F8F9FD',
  cardWhite: '#FFFFFF',
  darkNavy: '#2E2E4D',
  softGray: '#6B6B8A',
};

// Animated blob component
const Blob = ({ 
  className, 
  color, 
  delay = 0 
}: { 
  className?: string; 
  color: string; 
  delay?: number;
}) => (
  <motion.div
    className={`absolute rounded-full blur-3xl opacity-60 ${className}`}
    style={{ backgroundColor: color }}
    initial={{ scale: 0.8, opacity: 0 }}
    animate={{ 
      scale: [0.8, 1.2, 0.9, 1.1, 1],
      opacity: [0.4, 0.6, 0.5, 0.7, 0.6],
      rotate: [0, 90, 180, 270, 360]
    }}
    transition={{ 
      duration: 20,
      repeat: Infinity,
      repeatType: "reverse",
      delay: delay,
      ease: "easeInOut"
    }}
  />
);

// Feature card component
const FeatureCard = ({ 
  icon: Icon, 
  title, 
  description 
}: { 
  icon: React.ElementType; 
  title: string; 
  description: string;
}) => (
  <motion.div
    whileHover={{ y: -8, boxShadow: '0 25px 50px -12px rgba(122, 106, 216, 0.25)' }}
    className="p-8 rounded-3xl transition-all duration-300"
    style={{ 
      backgroundColor: colors.cardWhite,
      boxShadow: '0 10px 40px -10px rgba(46, 46, 77, 0.08)'
    }}
  >
    <div 
      className="w-14 h-14 rounded-2xl flex items-center justify-center mb-6"
      style={{ 
        background: `linear-gradient(135deg, ${colors.pastelViolet}20, ${colors.pastelBlue}40)` 
      }}
    >
      <Icon 
        className="w-7 h-7" 
        style={{ color: colors.mediumPurple }}
      />
    </div>
    <h3 
      className="text-xl font-bold mb-3"
      style={{ color: colors.darkNavy }}
    >
      {title}
    </h3>
    <p 
      className="text-base leading-relaxed"
      style={{ color: colors.softGray }}
    >
      {description}
    </p>
  </motion.div>
);

// Testimonial card
const TestimonialCard = ({ 
  name, 
  role, 
  quote, 
  rating 
}: { 
  name: string; 
  role: string; 
  quote: string; 
  rating: number;
}) => (
  <motion.div
    whileHover={{ y: -4 }}
    className="p-6 rounded-3xl"
    style={{ 
      backgroundColor: colors.cardWhite,
      boxShadow: '0 8px 32px -8px rgba(46, 46, 77, 0.06)'
    }}
  >
    <div className="flex gap-1 mb-4">
      {[...Array(5)].map((_, i) => (
        <Star 
          key={i}
          className="w-5 h-5"
          fill={i < rating ? colors.mediumPurple : 'transparent'}
          stroke={i < rating ? colors.mediumPurple : colors.lightPurple}
        />
      ))}
    </div>
    <p 
      className="text-base mb-6 italic"
      style={{ color: colors.darkNavy }}
    >
      "{quote}"
    </p>
    <div className="flex items-center gap-3">
      <div 
        className="w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold"
        style={{ 
          background: `linear-gradient(135deg, ${colors.pastelViolet}, ${colors.mediumPurple})`,
          color: colors.cardWhite
        }}
      >
        {name.split(' ').map(n => n[0]).join('')}
      </div>
      <div>
        <p 
          className="font-semibold"
          style={{ color: colors.darkNavy }}
        >
          {name}
        </p>
        <p 
          className="text-sm"
          style={{ color: colors.softGray }}
        >
          {role}
        </p>
      </div>
    </div>
  </motion.div>
);

// Purple gradient button
const GradientButton = ({ 
  children, 
  onClick, 
  variant = 'primary',
  className = ''
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}) => {
  const baseStyles = "px-8 py-4 rounded-full font-semibold text-base transition-all duration-300 flex items-center gap-2";
  
  const variants = {
    primary: {
      background: `linear-gradient(135deg, ${colors.mediumPurple}, ${colors.deepPurple})`,
      color: colors.cardWhite,
      boxShadow: `0 10px 30px -10px ${colors.mediumPurple}60`,
    },
    secondary: {
      background: `linear-gradient(135deg, ${colors.pastelBlue}, ${colors.lightTealBlue})`,
      color: colors.deepPurple,
      boxShadow: `0 10px 30px -10px ${colors.lightTealBlue}60`,
    },
    outline: {
      background: 'transparent',
      color: colors.mediumPurple,
      border: `2px solid ${colors.mediumPurple}`,
    }
  };
  
  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`${baseStyles} ${className}`}
      style={variants[variant]}
    >
      {children}
    </motion.button>
  );
};

// Main landing page component
export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div 
      className="min-h-screen w-full overflow-x-hidden"
      style={{ backgroundColor: colors.offWhite }}
    >
      {/* Background blobs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <Blob 
          className="w-[600px] h-[600px] -top-40 -right-40" 
          color={colors.softLavender}
          delay={0}
        />
        <Blob 
          className="w-[500px] h-[500px] top-1/4 -left-32" 
          color={colors.pastelBlue}
          delay={2}
        />
        <Blob 
          className="w-[400px] h-[400px] bottom-20 right-1/4" 
          color={colors.lightPurple}
          delay={4}
        />
        <Blob 
          className="w-[300px] h-[300px] top-1/2 left-1/2" 
          color={colors.pastelViolet}
          delay={1}
        />
      </div>

      {/* Navigation */}
      <nav className="relative z-10 px-6 lg:px-12 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-3"
          >
            <div 
              className="w-10 h-10 rounded-xl flex items-center justify-center"
              style={{ 
                background: `linear-gradient(135deg, ${colors.mediumPurple}, ${colors.deepPurple})` 
              }}
            >
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span 
              className="text-2xl font-bold"
              style={{ color: colors.darkNavy }}
            >
              EduPulse
            </span>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="hidden md:flex items-center gap-8"
          >
            {['Features', 'Testimonials'].map((item) => (
              <a 
                key={item}
                href={`#${item.toLowerCase()}`}
                className="text-sm font-medium transition-colors hover:text-[var(--hover-color)]"
                style={{ color: colors.softGray }}
                onMouseEnter={(e) => e.currentTarget.style.color = colors.mediumPurple}
                onMouseLeave={(e) => e.currentTarget.style.color = colors.softGray}
              >
                {item}
              </a>
            ))}
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <GradientButton onClick={onGetStarted} variant="primary">
              Get Started
              <ArrowRight className="w-5 h-5" />
            </GradientButton>
          </motion.div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 lg:px-12 pt-20 pb-32">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left content */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2 }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-8"
                style={{ 
                  backgroundColor: colors.pastelViolet + '20',
                  border: `1px solid ${colors.pastelViolet}40`
                }}
              >
                <Sparkles className="w-4 h-4" style={{ color: colors.mediumPurple }} />
                <span 
                  className="text-sm font-medium"
                  style={{ color: colors.deepPurple }}
                >
                  AI-Powered Feedback System
                </span>
              </motion.div>
              
              <h1 
  className="text-5xl lg:text-7xl font-bold leading-tight mb-6"
  style={{ color: colors.darkNavy }}
>
  Student Feedback System
  <br />
  <span 
    style={{ 
      background: `linear-gradient(135deg, ${colors.mediumPurple}, ${colors.deepPurple})`,
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    }}
  >
    v1.0 - Live!
  </span>
</h1>
              
              <p 
                className="text-xl mb-10 leading-relaxed max-w-lg"
                style={{ color: colors.softGray }}
              >
                Transform how you gather and analyze student feedback. 
                AI-driven insights, beautiful reports, and actionable recommendations.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <GradientButton size="lg" onClick={onGetStarted}>
                  Get Started
                  <ArrowRight className="w-5 h-5" />
                </GradientButton>
              </div>
              
              {/* Trust badges */}
              <div className="flex items-center gap-6 mt-12">
                <div className="flex -space-x-3">
                  {['A', 'B', 'C', 'D'].map((letter, i) => (
                    <div
                      key={i}
                      className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-xs font-bold"
                      style={{ 
                        backgroundColor: colors.softLavender,
                        borderColor: colors.cardWhite,
                        color: colors.mediumPurple
                      }}
                    >
                      {letter}
                    </div>
                  ))}
                </div>
                <div>
                  <div className="flex items-center gap-1 mb-1">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-[#7A6AD8] stroke-[#7A6AD8]" />
                    ))}
                  </div>
                  <p className="text-sm" style={{ color: colors.softGray }}>
                    Trusted by 500+ institutions
                  </p>
                </div>
              </div>
            </motion.div>
            
            {/* Right - Abstract illustration */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.3 }}
              className="relative"
            >
              <div 
                className="relative p-8 rounded-[3rem]"
                style={{ 
                  background: `linear-gradient(145deg, ${colors.cardWhite}, ${colors.softLavender})`,
                  boxShadow: `0 40px 80px -20px ${colors.mediumPurple}30`
                }}
              >
                {/* Dashboard mockup */}
                <div 
                  className="rounded-2xl overflow-hidden mb-6"
                  style={{ 
                    backgroundColor: colors.offWhite,
                    boxShadow: '0 20px 40px -10px rgba(46, 46, 77, 0.1)'
                  }}
                >
                  <div 
                    className="h-12 flex items-center px-4 gap-2"
                    style={{ backgroundColor: colors.cardWhite, borderBottom: `1px solid ${colors.softLavender}` }}
                  >
                    <div className="flex gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FF6B6B' }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#FFE66D' }} />
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#4ECDC4' }} />
                    </div>
                  </div>
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div 
                        className="h-4 w-32 rounded"
                        style={{ backgroundColor: colors.pastelViolet + '40' }}
                      />
                      <div 
                        className="h-8 w-20 rounded-full"
                        style={{ backgroundColor: colors.mediumPurple + '20' }}
                      />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div 
                          key={i}
                          className="p-4 rounded-xl"
                          style={{ backgroundColor: colors.cardWhite }}
                        >
                          <div 
                            className="h-3 w-12 rounded mb-2"
                            style={{ backgroundColor: colors.softLavender }}
                          />
                          <div 
                            className="h-6 w-16 rounded"
                            style={{ backgroundColor: i % 2 === 0 ? colors.mediumPurple + '30' : colors.pastelBlue + '50' }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                {/* Floating cards */}
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-8 top-1/4 p-4 rounded-2xl"
                  style={{ 
                    backgroundColor: colors.cardWhite,
                    boxShadow: '0 20px 40px -10px rgba(46, 46, 77, 0.15)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-full flex items-center justify-center"
                      style={{ backgroundColor: colors.pastelBlue }}
                    >
                      <TrendingUp className="w-5 h-5" style={{ color: colors.mediumPurple }} />
                    </div>
                    <div>
                      <p className="text-xs" style={{ color: colors.softGray }}>Feedback</p>
                      <p className="font-bold" style={{ color: colors.darkNavy }}>+24.5%</p>
                    </div>
                  </div>
                </motion.div>
                
                <motion.div
                  animate={{ y: [0, 10, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-4 bottom-1/4 p-4 rounded-2xl"
                  style={{ 
                    backgroundColor: colors.cardWhite,
                    boxShadow: '0 20px 40px -10px rgba(46, 46, 77, 0.15)'
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Heart className="w-5 h-5 fill-[#EF4444] stroke-[#EF4444]" />
                    <span className="text-sm font-medium" style={{ color: colors.darkNavy }}>92% Satisfaction</span>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: colors.pastelBlue + '60',
                color: colors.deepPurple
              }}
            >
              Powerful Features
            </span>
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: colors.darkNavy }}
            >
              Everything You Need
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: colors.softGray }}
            >
              Streamline your feedback collection with our comprehensive suite of tools
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: MessageSquare,
                title: 'Smart Forms',
                description: 'Create beautiful, mobile-friendly feedback forms with customizable templates and branching logic.'
              },
              {
                icon: BarChart3,
                title: 'Analytics Dashboard',
                description: 'Visualize feedback trends with interactive charts, department comparisons, and satisfaction metrics.'
              },
              {
                icon: Zap,
                title: 'AI Insights',
                description: 'Get automated recommendations for course improvements based on feedback patterns.'
              },
              {
                icon: Shield,
                title: 'Secure & Private',
                description: 'Enterprise-grade security with anonymous feedback options and role-based access control.'
              },
              {
                icon: Users,
                title: 'Multi-Department',
                description: 'Manage feedback across different departments with customized course catalogs per department.'
              },
              {
                icon: Star,
                title: 'Rating System',
                description: 'Comprehensive rating scales with customizable aspects like clarity, engagement, and materials.'
              }
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <FeatureCard {...feature} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="relative z-10 px-6 lg:px-12 py-20">
        <div 
          className="max-w-5xl mx-auto rounded-[3rem] p-12"
          style={{ 
            background: `linear-gradient(135deg, ${colors.mediumPurple}, ${colors.deepPurple})`,
            boxShadow: `0 40px 80px -20px ${colors.mediumPurple}50`
          }}
        >
          <div className="grid md:grid-cols-4 gap-8 text-center">
            {[
              { value: '50K+', label: 'Feedback Collected' },
              { value: '500+', label: 'Institutions' },
              { value: '98%', label: 'Satisfaction Rate' },
              { value: '24/7', label: 'AI Support' }
            ].map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, scale: 0.5 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <p className="text-4xl lg:text-5xl font-bold text-white mb-2">
                  {stat.value}
                </p>
                <p className="text-white/80">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 lg:px-12 py-24">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <span 
              className="inline-block px-4 py-2 rounded-full text-sm font-medium mb-4"
              style={{ 
                backgroundColor: colors.lightPurple + '60',
                color: colors.deepPurple
              }}
            >
              Testimonials
            </span>
            <h2 
              className="text-4xl lg:text-5xl font-bold mb-4"
              style={{ color: colors.darkNavy }}
            >
              Loved by Educators
            </h2>
            <p 
              className="text-xl max-w-2xl mx-auto"
              style={{ color: colors.softGray }}
            >
              See what faculty and administrators say about EduPulse
            </p>
          </motion.div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                name: 'Dr. Sarah Johnson',
                role: 'Dean of CS Department',
                quote: 'EduPulse has transformed how we understand student satisfaction. The AI insights helped us improve course ratings by 40%.',
                rating: 5
              },
              {
                name: 'Prof. Michael Chen',
                role: 'Head of AIML Division',
                quote: 'Finally, a feedback system that is both powerful and easy to use. Our faculty loves the intuitive dashboard.',
                rating: 5
              },
              {
                name: 'Dr. Emily Williams',
                role: 'Student Affairs Director',
                quote: 'The department-specific filtering is brilliant. Students only see relevant courses, making feedback more accurate.',
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
              >
                <TestimonialCard {...testimonial} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 lg:px-12 py-24">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <div 
            className="rounded-[3rem] p-12 lg:p-16 relative overflow-hidden"
            style={{ 
              background: `linear-gradient(145deg, ${colors.cardWhite}, ${colors.softLavender})`,
              boxShadow: `0 40px 80px -20px ${colors.mediumPurple}20`
            }}
          >
            {/* Decorative blobs */}
            <div 
              className="absolute -top-20 -right-20 w-40 h-40 rounded-full opacity-50"
              style={{ backgroundColor: colors.pastelBlue }}
            />
            <div 
              className="absolute -bottom-20 -left-20 w-40 h-40 rounded-full opacity-50"
              style={{ backgroundColor: colors.pastelViolet }}
            />
            
            <div className="relative z-10">
              <h2 
                className="text-4xl lg:text-5xl font-bold mb-6"
                style={{ color: colors.darkNavy }}
              >
                Ready to Transform Your Feedback?
              </h2>
              <p 
                className="text-xl mb-10 max-w-2xl mx-auto"
                style={{ color: colors.softGray }}
              >
                Join thousands of educators who are collecting better feedback and making data-driven improvements.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4">
                <GradientButton onClick={onGetStarted}>
                  Get Started Free
                  <ArrowRight className="w-5 h-5" />
                </GradientButton>
                <GradientButton variant="secondary">
                  Schedule Demo
                </GradientButton>
              </div>
              
              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 mt-10">
                {[
                  'No credit card required',
                  '14-day free trial',
                  'Cancel anytime'
                ].map((item) => (
                  <div key={item} className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5" style={{ color: colors.mediumPurple }} />
                    <span className="text-sm" style={{ color: colors.softGray }}>{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer 
        className="relative z-10 px-6 lg:px-12 py-16"
        style={{ backgroundColor: colors.darkNavy }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            {/* Brand */}
            <div className="md:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ 
                    background: `linear-gradient(135deg, ${colors.mediumPurple}, ${colors.deepPurple})` 
                  }}
                >
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold text-white">
                  EduPulse
                </span>
              </div>
              <p className="text-white/60 text-sm leading-relaxed">
                AI-powered feedback collection and analytics for modern educational institutions.
              </p>
            </div>
            
            {/* Links */}
            {[
              {
                title: 'Product',
                links: ['Features', 'Integrations', 'API']
              },
              {
                title: 'Company',
                links: ['Blog', 'Careers', 'Contact']
              },
              {
                title: 'Resources',
                links: ['Documentation', 'Help Center', 'Community', 'Status']
              }
            ].map((section) => (
              <div key={section.title}>
                <h4 className="text-white font-semibold mb-4">{section.title}</h4>
                <ul className="space-y-3">
                  {section.links.map((link) => (
                    <li key={link}>
                      <a 
                        href="#"
                        className="text-white/60 hover:text-white transition-colors text-sm"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          
          <div className="pt-8 border-t border-white/10 flex flex-wrap justify-between items-center gap-4">
            <p className="text-white/40 text-sm">
              © 2025 EduPulse. All rights reserved.
            </p>
            <div className="flex gap-6">
              {['Privacy Policy', 'Terms of Service', 'Cookie Settings'].map((item) => (
                <a 
                  key={item}
                  href="#"
                  className="text-white/40 hover:text-white/60 transition-colors text-sm"
                >
                  {item}
                </a>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
