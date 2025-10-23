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
  BarChart3,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function LandingPage() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
      text: 'AceWAEC Pro helped me improve from 60% to 95% in just 3 months.'
    },
    {
      name: 'Ibrahim Yusuf',
      category: 'Commercial',
      score: '88%',
      text: 'The analytics feature showed me exactly where I was weak.'
    },
    {
      name: 'Adebayo Adebayo',
      category: 'Art',
      score: '92%',
      text: 'The 7-day exam prepared me perfectly. So confident!'
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
      {/* Navbar */}
      <nav className="bg-white/80 backdrop-blur-md shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                <BookOpen className="text-white" size={20} />
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                AceWAEC Pro
              </span>
            </div>

            {/* Desktop CTA Buttons */}
            <div className="hidden sm:flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => navigate('/login')}
                className="text-gray-700 hover:text-indigo-600 font-medium transition-colors text-sm sm:text-base"
              >
                Login
              </button>
              <button
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 sm:px-6 rounded-lg hover:shadow-lg transition-shadow font-medium text-sm sm:text-base"
              >
                Get Started
              </button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="sm:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="sm:hidden mt-3 pt-3 border-t space-y-2">
              <button
                onClick={() => {
                  navigate('/login');
                  setMobileMenuOpen(false);
                }}
                className="w-full text-left px-3 py-2 text-gray-700 hover:bg-gray-100 rounded-lg"
              >
                Login
              </button>
              <button
                onClick={() => {
                  navigate('/register');
                  setMobileMenuOpen(false);
                }}
                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-3 py-2 rounded-lg font-medium"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-12 sm:pt-20 sm:pb-16 lg:pt-24 lg:pb-24">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-50 to-white opacity-70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className='order-last lg:order-first'>
              {/* Tagline */}
              <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium mb-4 sm:mb-6">
                <Zap size={16} />
                <span>Trusted by 50,000+ Students</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
                Master Your
                <span className="block bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                  WAEC Journey
                </span>
              </h1>
              
              {/* Subtext */}
              <p className="text-base sm:text-lg lg:text-xl text-gray-600 mb-6 sm:mb-8 leading-relaxed">
                Smart practice, detailed analytics, and expert guidance to help you excel in your WAEC examinations.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-8 sm:mb-12">
                <button
                  onClick={() => navigate('/register')}
                  className="w-full sm:w-auto bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:shadow-2xl transition-all font-semibold text-sm sm:text-base flex items-center justify-center gap-2 group"
                >
                  Start Free Trial
                  <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
                </button>
                <button
                  onClick={() => {
                    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto border-2 border-indigo-600 text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:bg-indigo-50 transition-colors font-semibold text-sm sm:text-base"
                >
                  Learn More
                </button>
              </div>

              {/* Stats */}
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-6 sm:gap-8">
                {stats.map((stat, idx) => (
                  <div key={idx} className="text-center sm:text-left">
                    <p className={`text-xl sm:text-2xl font-bold ${stat.color || 'text-gray-900'}`}>
                      {stat.value}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-600">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Image */}
            <div className="relative mt-8 lg:mt-0">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-100 to-purple-100 rounded-3xl blur-3xl"></div>
              <div className="relative bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl p-6 sm:p-8 text-white space-y-4 sm:space-y-6">
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                  <p className="text-sm sm:text-base">Unlimited Practice Questions</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                  <p className="text-sm sm:text-base">Real-time Performance Analytics</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                  <p className="text-sm sm:text-base">Expert Tutor Support</p>
                </div>
                <div className="flex items-center gap-3">
                  <CheckCircle className="text-green-400 flex-shrink-0" size={24} />
                  <p className="text-sm sm:text-base">7-Day Mock Exam</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-12 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Everything You Need to Succeed
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-3xl mx-auto px-4 sm:px-0">
              Comprehensive tools and resources designed to help you ace your WAEC exams
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {features.map((feature, idx) => (
              <div
                key={idx}
                className="group p-5 sm:p-6 bg-gradient-to-br from-white to-indigo-50 rounded-2xl border border-gray-100 hover:shadow-xl transition-all hover:-translate-y-1"
              >
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform flex-shrink-0">
                  <feature.icon className="text-white" size={24} />
                </div>
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-12 sm:py-20 lg:py-24 bg-gradient-to-b from-indigo-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              How It Works
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Simple steps to exam success</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Create Account', desc: 'Sign up and select your student category', icon: Users },
              { step: '2', title: 'Practice Smart', desc: 'Take timed practice tests and track your progress', icon: TrendingUp },
              { step: '3', title: 'Ace Your Exam', desc: 'Apply your knowledge and excel in WAEC', icon: Award }
            ].map((item, idx) => (
              <div key={idx} className="relative text-center pt-8 md:pt-0">
                {idx < 2 && (
                  <div className="absolute top-1/2 left-1/2 w-full h-0.5 bg-gradient-to-r from-indigo-200 to-purple-200 hidden md:block z-0" style={{ transform: 'translate(0%, -50%)' }}></div>
                )}
                
                <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 shadow-xl relative z-10 flex-shrink-0">
                  <item.icon className="text-white" size={24} />
                </div>
                
                <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-2 sm:mb-3">{item.title}</h3>
                <p className="text-sm sm:text-base text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 sm:py-20 lg:py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10 sm:mb-16">
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
              Student Success Stories
            </h2>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600">Real results from real students</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
            {testimonials.map((testimonial, idx) => (
              <div
                key={idx}
                className="bg-gradient-to-br from-white to-indigo-50 p-5 sm:p-6 lg:p-8 rounded-2xl shadow-lg border border-gray-100"
              >
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="text-yellow-400 fill-current" size={16} />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 sm:mb-6 italic text-sm sm:text-base">"{testimonial.text}"</p>
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-indigo-400 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-lg flex-shrink-0">
                    {testimonial.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-gray-900 text-sm sm:text-base truncate">{testimonial.name}</p>
                    <p className="text-xs sm:text-sm text-gray-600">{testimonial.category} • {testimonial.score}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-12 sm:py-20 lg:py-24 bg-gradient-to-r from-indigo-600 to-purple-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Shield className="mx-auto mb-4 sm:mb-6 text-white" size={48} />
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white mb-4 sm:mb-6">
            Ready to Ace Your WAEC Exams?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-indigo-100 mb-6 sm:mb-8">
            Join thousands of students who have transformed their exam preparation
          </p>
          <button
            onClick={() => navigate('/register')}
            className="w-full sm:w-auto bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg hover:shadow-2xl transition-all font-semibold text-sm sm:text-base inline-flex items-center justify-center gap-2 group"
          >
            Start Your Free Trial
            <ArrowRight className="group-hover:translate-x-1 transition-transform" size={18} />
          </button>
          <p className="text-indigo-100 mt-3 sm:mt-4 text-xs sm:text-sm">No credit card required • Cancel anytime</p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 py-8 sm:py-10 lg:py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8 mb-6 sm:mb-8">
            {/* Branding */}
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="text-white" size={18} />
                </div>
                <span className="text-lg sm:text-xl font-bold text-white">AceWAEC Pro</span>
              </div>
              <p className="text-xs sm:text-sm">Master Your WAEC Journey with smart practice.</p>
            </div>

            {/* Product Links */}
            <div>
              <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Product</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Features</button></li>
                <li><button onClick={() => navigate('/register')} className="hover:text-white">Pricing</button></li>
                <li><button onClick={() => navigate('/login')} className="hover:text-white">Login</button></li>
              </ul>
            </div>

            {/* Support Links */}
            <div>
              <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Support</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div className="col-span-2 sm:col-span-1">
              <h4 className="font-bold text-white mb-3 text-sm sm:text-base">Legal</h4>
              <ul className="space-y-2 text-xs sm:text-sm">
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 sm:pt-8 text-center text-xs sm:text-sm">
            <p>&copy; 2025 AceWAEC Pro. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}