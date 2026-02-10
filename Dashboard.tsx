
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { User, UserRole, Course } from '../types';
import { DB } from '../services/db';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  
  const [newCourse, setNewCourse] = useState({ name: '', subject: '' });
  const [joinCode, setJoinCode] = useState('');

  const loadCourses = () => {
    const allCourses = DB.getCourses();
    if (user.role === UserRole.TEACHER) {
      setCourses(allCourses.filter(c => c.teacherId === user.id));
    } else {
      setCourses(allCourses.filter(c => 
        c.enrolledStudentIds.includes(user.id) || 
        c.pendingStudentIds.includes(user.id)
      ));
    }
  };

  useEffect(() => {
    loadCourses();
  }, [user.id, user.role]);

  const handleCreateCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const enrollmentCode = Math.random().toString(36).substr(2, 6).toUpperCase();
    const course: Course = {
      id: Math.random().toString(36).substr(2, 9),
      teacherId: user.id,
      name: newCourse.name,
      subject: newCourse.subject,
      enrollmentCode,
      enrolledStudentIds: [],
      pendingStudentIds: []
    };
    const updated = [...DB.getCourses(), course];
    DB.saveCourses(updated);
    loadCourses();
    setShowCreateModal(false);
    setNewCourse({ name: '', subject: '' });
  };

  const handleJoinCourse = (e: React.FormEvent) => {
    e.preventDefault();
    const allCourses = DB.getCourses();
    const course = allCourses.find(c => c.enrollmentCode === joinCode.toUpperCase());
    
    if (!course) {
      alert('Invalid Enrollment Code');
      return;
    }
    
    if (course.enrolledStudentIds.includes(user.id) || course.pendingStudentIds.includes(user.id)) {
      alert('You have already requested to join or are enrolled in this course.');
      return;
    }

    const updatedCourses = allCourses.map(c => {
      if (c.id === course.id) {
        DB.addNotification({
          userId: c.teacherId,
          title: 'New Enrollment Request',
          message: `${user.name} has requested to join "${c.name}".`,
          type: 'info'
        });
        return { ...c, pendingStudentIds: [...c.pendingStudentIds, user.id] };
      }
      return c;
    });

    DB.saveCourses(updatedCourses);
    loadCourses();
    setShowJoinModal(false);
    setJoinCode('');
    alert('Join request sent! Waiting for teacher approval.');
  };

  return (
    <div className="animate-in fade-in duration-700 max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="space-y-1">
          <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic Dashboard</h1>
          <p className="text-slate-500 font-bold text-sm uppercase tracking-widest flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full animate-pulse" style={{ backgroundColor: user.themeColor || '#4f46e5' }}></span>
            Welcome, {user.name}
          </p>
        </div>
        
        <div className="flex gap-4 w-full md:w-auto">
          {user.role === UserRole.TEACHER ? (
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex-1 md:flex-none text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 group shadow-xl"
              style={{ backgroundColor: user.themeColor || '#4f46e5', boxShadow: `0 10px 15px -3px ${(user.themeColor || '#4f46e5')}44` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:scale-125 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 4v16m8-8H4" /></svg>
              Create Course
            </button>
          ) : (
            <button 
              onClick={() => setShowJoinModal(true)}
              className="flex-1 md:flex-none text-white px-8 py-4 rounded-2xl font-black transition-all flex items-center justify-center gap-3 group shadow-xl"
              style={{ backgroundColor: user.themeColor || '#4f46e5', boxShadow: `0 10px 15px -3px ${(user.themeColor || '#4f46e5')}44` }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:-translate-y-1 transition-transform" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM6.293 6.707a1 1 0 010-1.414l3-3a1 1 0 011.414 0l3 3a1 1 0 01-1.414 1.414L11 5.414V13a1 1 0 11-2 0V5.414L7.707 6.707a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
              Join a Class
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {courses.map(course => (
          <Link 
            key={course.id} 
            to={`/course/${course.id}`}
            className="group bg-white p-8 rounded-[2.5rem] border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
          >
            <div className="absolute -top-4 -right-4 w-24 h-24 rounded-full group-hover:scale-150 transition-transform duration-500" style={{ backgroundColor: (user.themeColor || '#4f46e5') + '11' }}></div>
            
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-8">
                <div className="w-16 h-16 rounded-3xl flex items-center justify-center text-white shadow-xl group-hover:rotate-6 transition-transform" style={{ backgroundColor: user.themeColor || '#4f46e5', boxShadow: `0 10px 15px -3px ${(user.themeColor || '#4f46e5')}44` }}>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <span className="text-[10px] font-black uppercase tracking-[0.2em] bg-white px-3 py-1.5 rounded-full border shadow-sm" style={{ color: user.themeColor || '#4f46e5', borderColor: (user.themeColor || '#4f46e5') + '33' }}>
                  {course.enrollmentCode}
                </span>
              </div>
              
              <h3 className="text-2xl font-black text-slate-900 leading-tight mb-2 group-hover:text-primary transition-colors">{course.name}</h3>
              <p className="text-slate-500 font-bold mb-8 uppercase tracking-widest text-[10px]">{course.subject}</p>
              
              <div className="flex items-center justify-between pt-6 border-t border-slate-50">
                <div className="flex items-center gap-2">
                  <div className="flex -space-x-3">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-[10px] font-bold" style={{ backgroundColor: (user.themeColor || '#4f46e5') + '22', color: user.themeColor || '#4f46e5' }}>
                        {String.fromCharCode(64 + i)}
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                    {course.enrolledStudentIds.length} Students
                  </span>
                </div>
                
                {course.pendingStudentIds.includes(user.id) ? (
                  <div className="bg-amber-50 text-amber-600 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-amber-100">Pending Approval</div>
                ) : (
                  <div className="p-2 rounded-xl transition-all group-hover:text-white" style={{ backgroundColor: (user.themeColor || '#4f46e5') + '11', color: user.themeColor || '#4f46e5' }}>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" /></svg>
                  </div>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>

      {courses.length === 0 && (
        <div className="text-center py-40 bg-white/50 backdrop-blur-md rounded-[4rem] border-4 border-dashed border-slate-100 mt-12 group transition-all">
          <div className="w-24 h-24 bg-white rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 group-hover:scale-110 transition-transform shadow-sm">
             <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" /></svg>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Academic Journey Starts Here</h2>
          <p className="text-slate-400 font-bold mb-10 max-w-xs mx-auto text-sm uppercase tracking-widest">Enroll or create your first course</p>
          <button 
            onClick={() => user.role === UserRole.TEACHER ? setShowCreateModal(true) : setShowJoinModal(true)}
            className="font-black hover:opacity-80 underline underline-offset-8 decoration-4"
            style={{ color: user.themeColor || '#4f46e5' }}
          >
            {user.role === UserRole.TEACHER ? '+ Launch New Course' : '+ Secure Enrollment'}
          </button>
        </div>
      )}

      {/* Modals */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-12 shadow-2xl relative border-t-8" style={{ borderTopColor: user.themeColor || '#4f46e5' }}>
            <button onClick={() => setShowCreateModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-10 tracking-tight">Define Class</h2>
            <form onSubmit={handleCreateCourse} className="space-y-8">
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Class Title</label>
                <input required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none transition-all font-bold focus:border-indigo-600 text-black" placeholder="e.g. Modern Web Design" value={newCourse.name} onChange={(e) => setNewCourse({...newCourse, name: e.target.value})} />
              </div>
              <div>
                <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-3 ml-1">Subject Area</label>
                <input required className="w-full px-6 py-5 bg-slate-50 border-2 border-slate-50 rounded-2xl outline-none transition-all font-bold focus:border-indigo-600 text-black" placeholder="e.g. Visual Arts" value={newCourse.subject} onChange={(e) => setNewCourse({...newCourse, subject: e.target.value})} />
              </div>
              <button type="submit" className="w-full text-white py-6 rounded-2xl font-black shadow-2xl active:scale-[0.98] transition-all text-lg" style={{ backgroundColor: user.themeColor || '#4f46e5', boxShadow: `0 10px 15px -3px ${(user.themeColor || '#4f46e5')}44` }}>Publish Course</button>
            </form>
          </div>
        </div>
      )}

      {showJoinModal && (
        <div className="fixed inset-0 bg-indigo-950/60 backdrop-blur-md flex items-center justify-center p-4 z-[100] animate-in fade-in duration-300">
          <div className="bg-white rounded-[3rem] max-w-md w-full p-12 shadow-2xl relative text-center border-t-8" style={{ borderTopColor: user.themeColor || '#4f46e5' }}>
             <button onClick={() => setShowJoinModal(false)} className="absolute top-10 right-10 text-slate-400 hover:text-slate-600 bg-slate-50 p-2 rounded-xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            <h2 className="text-3xl font-black text-slate-900 mb-2 tracking-tight">Class Code</h2>
            <p className="text-slate-400 font-bold text-xs mb-12 uppercase tracking-widest">Verify Access</p>
            <form onSubmit={handleJoinCourse} className="space-y-8">
              <input 
                required 
                className="w-full px-6 py-8 bg-slate-50 border-4 border-slate-100 rounded-3xl outline-none text-center text-5xl font-black font-mono tracking-[0.3em] uppercase transition-all focus:border-indigo-600 text-black" 
                placeholder="0000" 
                maxLength={6} 
                value={joinCode} 
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())} 
              />
              <button type="submit" className="w-full text-white py-6 rounded-2xl font-black shadow-2xl active:scale-[0.98] transition-all text-lg" style={{ backgroundColor: user.themeColor || '#4f46e5', boxShadow: `0 10px 15px -3px ${(user.themeColor || '#4f46e5')}44` }}>Verify Enrollment</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
