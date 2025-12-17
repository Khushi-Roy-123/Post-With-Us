import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { LoginModal } from './LoginModal';

interface LandingPageProps {
  onGetStarted: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onGetStarted }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const { currentUser } = useAuth();

  const handleGetStarted = () => {
    if (currentUser) {
      onGetStarted();
    } else {
      setShowLoginModal(true);
    }
  };

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, id: string) => {
    e.preventDefault();
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans flex flex-col justify-between overflow-x-hidden">
      
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-5%] w-[500px] h-[500px] bg-purple-200/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob"></div>
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-200/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-2000"></div>
        <div className="absolute bottom-[-20%] left-[20%] w-[500px] h-[500px] bg-pink-200/40 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-blob animation-delay-4000"></div>
      </div>

      <nav className="relative z-50 pt-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full flex justify-between items-center">
        <div className="flex items-center space-x-2">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg transform -rotate-3">
                 <svg className="w-6 h-6 transform rotate-3 translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
            </div>
            <span className="text-2xl font-bold tracking-tight text-gray-900">Post With Us</span>
        </div>
        <div className="hidden md:flex space-x-8 text-sm font-medium text-gray-600">
           <a href="#features" onClick={(e) => scrollToSection(e, 'features')} className="hover:text-blue-600 transition-colors">Features</a>
           <a href="#benefits" onClick={(e) => scrollToSection(e, 'benefits')} className="hover:text-blue-600 transition-colors">Benefits</a>
        </div>
        {/* Sign In Button removed as requested */}
        <div className="hidden md:block w-10"></div> 
      </nav>

      <header className="relative pt-16 pb-20 lg:pt-32 lg:pb-28">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:grid lg:grid-cols-12 lg:gap-16 items-center">
            
            <div className="lg:col-span-6 text-center lg:text-left mb-16 lg:mb-0">
               <div className="inline-flex items-center px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-blue-600 text-xs font-bold uppercase tracking-wide mb-6">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mr-2 animate-pulse"></span>
                  AI Pipeline Agent 2.0 is Live
               </div>
               
               <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-gray-900 leading-[1.1] mb-6">
                 Create Weeks of Content in <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600">Seconds.</span>
               </h1>
               
               <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
                 Stop staring at a blank screen. Our AI agent researches, writes, designs, and schedules your entire content strategy across all platforms instantly.
               </p>
               
               <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 mb-10">
                 <button
                   onClick={handleGetStarted}
                   className="w-full sm:w-auto px-8 py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-xl shadow-blue-500/30 hover:bg-blue-700 hover:-translate-y-1 transition-all duration-200 flex items-center justify-center"
                 >
                   Start Creating for Free
                   <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path></svg>
                 </button>
               </div>
            </div>
            
            <div className="lg:col-span-6 relative perspective-1000">
               <div className="relative z-10 bg-white rounded-2xl shadow-2xl border border-gray-100 transform rotate-y-[-5deg] rotate-x-[5deg] hover:rotate-0 transition-transform duration-500 ease-out">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-100 rounded-t-2xl flex items-center space-x-2">
                     <div className="w-3 h-3 rounded-full bg-red-400"></div>
                     <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                     <div className="w-3 h-3 rounded-full bg-green-400"></div>
                     <div className="ml-4 bg-white border border-gray-200 rounded-md px-3 py-1 text-[10px] text-gray-400 font-mono flex-1">
                        postwithus.com/agent/new
                     </div>
                  </div>
                  
                  <div className="p-6">
                     <div className="flex items-center justify-between mb-6">
                        <div>
                           <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mb-2"></div>
                           <div className="h-3 w-20 bg-gray-100 rounded animate-pulse"></div>
                        </div>
                        <div className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                           Pipeline Active
                        </div>
                     </div>
                     
                     <div className="space-y-4">
                        <div className="p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                           <div className="flex items-center space-x-3 mb-3">
                              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs">LI</div>
                              <div className="h-2 w-24 bg-gray-200 rounded"></div>
                           </div>
                           <div className="space-y-2">
                              <div className="h-2 w-full bg-gray-200 rounded"></div>
                              <div className="h-2 w-5/6 bg-gray-200 rounded"></div>
                              <div className="h-2 w-4/6 bg-gray-200 rounded"></div>
                           </div>
                        </div>
                        
                        <div className="h-32 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-xl flex items-center justify-center text-white/80 text-sm font-medium">
                           <svg className="w-8 h-8 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                        </div>
                     </div>
                     
                     <div className="mt-6 flex justify-end space-x-3">
                        <div className="h-8 w-20 bg-gray-100 rounded-lg"></div>
                        <div className="h-8 w-24 bg-blue-600 rounded-lg shadow-lg shadow-blue-500/30"></div>
                     </div>
                  </div>
               </div>

               <div className="absolute -right-8 top-10 bg-white p-4 rounded-xl shadow-xl border border-gray-100 z-20 animate-bounce-slow">
                  <div className="flex items-center space-x-3">
                     <div className="p-2 bg-pink-100 text-pink-600 rounded-lg">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                     </div>
                     <div>
                        <div className="text-xs text-gray-400 font-bold uppercase">Viral Score</div>
                        <div className="text-lg font-bold text-gray-900">98/100</div>
                     </div>
                  </div>
               </div>

               <div className="absolute -left-4 bottom-20 bg-white p-3 rounded-lg shadow-lg border border-gray-100 z-20 flex items-center space-x-2 animate-bounce-slow animation-delay-2000">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-sm font-semibold text-gray-700">Scheduled: Today 2PM</span>
               </div>
            </div>
            
          </div>
        </div>
      </header>

      <section id="features" className="py-24 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
             <h2 className="text-3xl font-bold text-gray-900 mb-4">Everything You Need to Dominate Your Niche</h2>
             <p className="text-gray-600 text-lg">Our AI doesn't just write. It plans, strategizes, and executes a complete content calendar tailored to your audience.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { 
                title: "Pipeline Agent", 
                desc: "Turn one topic into a blog, LinkedIn post, tweet, and image prompt instantly.", 
                icon: "M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z",
                color: "text-blue-600 bg-blue-50" 
              },
              { 
                title: "Quick Post", 
                desc: "Drop a link or image and get a perfectly formatted social post in seconds.", 
                icon: "M13 10V3L4 14h7v7l9-11h-7z",
                color: "text-green-600 bg-green-50"
              },
              { 
                title: "Trend Hunter", 
                desc: "Spot rising topics before they go viral and draft content immediately.", 
                icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6",
                color: "text-purple-600 bg-purple-50"
              },
              { 
                title: "Smart Calendar", 
                desc: "Drag, drop, and visualize your publishing schedule with ease.", 
                icon: "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
                color: "text-pink-600 bg-pink-50"
              }
            ].map((feature, i) => (
               <div key={i} className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 ${feature.color}`}>
                     <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feature.icon}></path></svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-500 leading-relaxed">{feature.desc}</p>
               </div>
            ))}
          </div>
        </div>
      </section>

      <section id="benefits" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
           <div className="bg-gray-900 rounded-3xl p-8 sm:p-16 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
               <div className="absolute bottom-0 left-0 w-64 h-64 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
               
               <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-6 relative z-10">Ready to Transform Your Content?</h2>
               <p className="text-gray-300 text-lg mb-10 max-w-2xl mx-auto relative z-10">Join thousands of creators who are saving 20+ hours a week with our AI-powered production pipeline.</p>
               
               <button
                  onClick={handleGetStarted}
                  className="px-10 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg hover:bg-gray-100 transition-colors shadow-lg relative z-10"
                >
                  Get Started Now
                </button>
           </div>
        </div>
      </section>

      <footer className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center">
           <div className="flex items-center space-x-2 mb-4 md:mb-0">
               <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center text-white transform -rotate-3">
                 <svg className="w-4 h-4 transform rotate-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
               </div>
               <span className="text-xl font-bold text-gray-900">Post With Us</span>
           </div>
           
           <div className="flex space-x-6 text-sm text-gray-500">
              <a href="#" className="hover:text-gray-900">Privacy</a>
              <a href="#" className="hover:text-gray-900">Terms</a>
              <a href="#" className="hover:text-gray-900">Twitter</a>
              <a href="#" className="hover:text-gray-900">LinkedIn</a>
           </div>
           
           <p className="text-sm text-gray-400 mt-4 md:mt-0">&copy; {new Date().getFullYear()} Post With Us Inc.</p>
        </div>
      </footer>
      
      <LoginModal isOpen={showLoginModal} onClose={() => setShowLoginModal(false)} />
    </div>
  );
};