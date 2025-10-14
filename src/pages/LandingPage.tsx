import { useNavigate } from 'react-router-dom';
import { 
  BookOpen, 
  Target, 
  Clock, 
  Award, 
  TrendingUp, 
  Users, 
  CheckCircle, 
  Star, 
  ArrowRight, 
  Zap, 
  Shield, 
  BarChart3 
} from 'lucide-react';

// Mock navigation handler since external routing libraries (like react-router-dom) are not available 
// in a single-file component environment.
// const mockNavigate = (path) => {
//     // We use alert() here instead of a custom modal for simplicity in this environment
//     if (path === '/register') {
//         alert('Navigating to the Registration Page...');
//     } else if (path === '/login') {
//         alert('Navigating to the Login Page...');
//     } else {
//         console.log(`Attempting to navigate to: ${path}`);
//     }
// };

export default function App() {
  // Use a mock navigation function
  const navigate = useNavigate ();

  const features = [
    {
      icon: BookOpen,
      title: 'Unlimited Practice',
      description: 'Access thousands of WAEC past questions across all subjects'
    },
    {
      icon: Target,
      title: 'Personalized Learning',
      description: 'AI-powered recommendations based on your performance'
    },
    {
      icon: Clock,
      title: 'Timed Sessions',
      description: 'Practice under real exam conditions with countdown timers'
    },
    {
      icon: BarChart3,
      title: 'Performance Analytics',
      description: 'Track your progress with detailed statistics and insights'
    },
    {
      icon: Award,
      title: '7-Day Mock Exam',
      description: 'Full WAEC simulation with certificate upon completion'
    },
    {
      icon: Users,
      title: 'Expert Tutors',
      description: 'Connect with qualified tutors for personalized support'
    }
  ];

  const testimonials = [
    {
      name: 'Kunle Omoluabi',
      category: 'Science',
      score: '95%',
      text: 'AceWAEC Pro helped me improve from 60% to 95% in just 3 months. The practice questions are exactly like the real exam!',
      image: null
    },
    {
      name: 'Ibrahim Yusuf',
      category: 'Commercial',
      score: '88%',
      text: 'The analytics feature showed me exactly where I was weak. Focused practice turned my weaknesses into strengths.',
      image: null
    },
    {
      name: 'Adebayo Adebayo',
      category: 'Art',
      score: '92%',
      text: 'The 7-day comprehensive exam prepared me perfectly. I felt so confident on exam day!',
      image: null
    }
  ];

  const stats = [
    { value: '50,000+', label: 'Students' },
    { value: '10,000+', label: 'Questions' },
    { value: '98%', label: 'Pass Rate', color: 'text-green-600' }, 
    { value: '15+', label: 'Subjects' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 to-white">
      {/* Navbar - Fixed to top for easy navigation */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Logo */}
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-white" size={24} />
              </div>
              <span className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AceWAEC Pro
              </span>
            </div>
            {/* CTA Buttons - Adjusted sizing for mobile */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm sm:text-base px-2 sm:px-0"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-6 sm:py-2 rounded-lg hover:shadow-lg transition-shadow font-medium text-sm sm:text-base whitespace-nowrap"
              >
                Get Started
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 sm:pt-24 sm:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-white opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content Column */}
            <div className='order-last lg:order-first'>
              {/* Tagline */}
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-sm font-medium mb-6">
                <Zap size={16} />
                <span>Trusted by 50,000+ Students</span>
              </div>
              
              {/* Heading - Responsive text sizes applied */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6 leading-tight">
                Master Your
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  WAEC Journey
                </span>
              </h1>
              
              {/* Subtext - Responsive text sizes applied */}
              <p className="text-lg sm:text-xl text-gray-600 mb-8 leading-relaxed">
                Smart practice, detailed analytics, and expert guidance to help you excel in your WAEC examinations.
              </p>
              
              {/* CTA Buttons - Stacks on mobile, inline on sm+ */}
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-8 py-3 sm:py-4 rounded-lg hover:shadow-2xl transition-all font-semibold text-lg flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 px-8 py-3 sm:py-4 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-lg"
                >
                  Learn More
                </button>
              </div>

              {/* Stats - flex-wrap added for mobile robustness */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-8 mt-12">
                {stats.map((stat, idx) => (
                  <div key={idx} className="min-w-[80px] text-center sm:text-left">
                    <p className={`text-3xl font-bold text-gray-900 ${stat.color || ''}`}>{stat.value}</p>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Mock Dashboard Card - Responsive ordering applied */}
            <div className="relative order-first lg:order-last">
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-3xl blur-3xl opacity-20 animate-pulse"></div>
              <div className="relative bg-white rounded-3xl shadow-2xl p-6 sm:p-8 border border-gray-100">
                <h3 className='text-xl font-bold text-gray-900 mb-4'>Your Practice Progress</h3>
                <div className='bg-indigo-50 p-4 rounded-xl mb-6'>
                    <div className='flex justify-between items-center text-gray-700 font-medium mb-1'>
                        <span>Mathematics</span>
                        <span>75%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-indigo-500 h-2.5 rounded-full" style={{width: '75%'}}></div>
                    </div>
                </div>
                <div className='bg-purple-50 p-4 rounded-xl mb-6'>
                    <div className='flex justify-between items-center text-gray-700 font-medium mb-1'>
                        <span>English Language</span>
                        <span>60%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className="bg-purple-500 h-2.5 rounded-full" style={{width: '60%'}}></div>
                    </div>
                </div>
                <div className="space-y-4 pt-4 border-t border-gray-100">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                    <p className="text-gray-700">10,000+ Past WAEC Questions</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                    <p className="text-gray-700">Smart Performance Analytics</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="text-green-500 flex-shrink-0" size={24} />
                    <p className="text-gray-700">Expert Tutor Marketplace</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">
              Comprehensive tools and resources designed to help you ace your WAEC exams
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-6 bg-gradient-to-br from-white to-indigo-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-14 h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform flex-shrink-0">
                  <feature.icon className="text-white" size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 sm:py-24 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Simple steps to exam success</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up and select your student category', icon: Users },
              { step: '2', title: 'Practice Smart', desc: 'Take timed practice tests and track your progress', icon: TrendingUp },
              { step: '3', title: 'Ace Your Exam', desc: 'Apply your knowledge and excel in WAEC', icon: Award }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center pt-8 md:pt-0">
                {/* Connector Line (Hidden on small screens) */}
                {idx < 2 && (
                    <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 hidden md:block z-0" style={{ transform: 'translate(0%, -50%)' }}></div>
                )}
                
                {/* Step Circle */}
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl relative z-10">
                  <item.icon className="text-white" size={28} />
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 sm:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-4">
              Student Success Stories
            </h2>
            <p className="text-lg sm:text-xl text-gray-600">Real results from real students</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-indigo-50 p-6 sm:p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={18} />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{testimonial.name}</p>
                    <p className="text-sm text-gray-600">{testimonial.category} • Score: {testimonial.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 sm:py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <Shield className="mx-auto mb-6 text-white" size={64} />
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Ace Your WAEC Exams?
          </h2>
          <p className="text-lg sm:text-xl text-indigo-100 mb-8">
            Join thousands of students who have transformed their exam preparation with AceWAEC Pro
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-white text-indigo-600 px-8 py-4 rounded-lg hover:shadow-2xl transition-all font-semibold text-lg inline-flex items-center justify-center gap-2 group"
          >
            Start Your Free Trial
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
          </button>
          <p className="text-indigo-100 mt-4 text-sm">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer - Uses grid-cols-2 on mobile */}
      <footer className="bg-gray-900 text-gray-300 py-10 sm:py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            {/* Branding - Takes full width on smallest mobile, then adjusts */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={20} />
                </div>
                <span className="text-xl font-bold text-white">AceWAEC Pro</span>
              </div>
              <p className="text-sm">Master Your WAEC Journey with smart practice and analytics.</p>
            </div>
            {/* Nav Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-sm">
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Features</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white">Login</button></li>
              </ul>
            </div>
            {/* Support Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            {/* Legal Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 AceWAEC Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
