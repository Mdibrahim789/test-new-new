
import React, { useState, useEffect } from 'react';
import { UserRole, AppData, Student, Poll, Notice, RoutineItem, Faculty, AttendanceRecord } from './types';

// Mock initial data
const INITIAL_DATA: AppData = {
  routine: [
    { id: '1', type: 'Offline', day: 'FRIDAY', time: '8.00', sub: 'Circuit', teacher: 'ASK', roomOrLink: '20002' }
  ],
  student: [
    { id: '2026001', name: 'Al-Amin', phone: '01700000001', dipSession: '2019-20' },
    { id: '2026002', name: 'Tanvir Ahmed', phone: '01700000002', dipSession: '2019-20' }
  ],
  teacher: [
    { id: 'T1', name: 'Dr. Jahid Hasan', designation: 'Head of Dept.', phone: '01800000000' }
  ],
  notice: [
    { id: 'n1', date: '2024-05-20', title: 'Midterm Schedule Published', desc: 'The midterm exams for Spring 2024 will start from June 5th. Please check the portal for details.' }
  ],
  attendance: [],
  polls: [
    { id: 'p1', question: 'When should we have the next study session?', options: [{ text: 'Friday Evening', votes: 5 }, { text: 'Saturday Morning', votes: 3 }], voters: [] }
  ],
  subjects: [{ name: 'Microprocessor', code: 'EEE 311', link: 'https://drive.google.com' }],
  resources: [{ title: 'Power Electronics Notes', url: 'https://drive.google.com' }],
  crKeys: [{ name: 'Class CR', key: 'CR-7890', permissions: ['routine', 'notice', 'attendance'] }]
};

const MASTER_PASS = 'admin789';

const App: React.FC = () => {
  const [data, setData] = useState<AppData>(() => {
    const saved = localStorage.getItem('uu_eee_data');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });

  const [activeSection, setActiveSection] = useState('home');
  const [role, setRole] = useState<UserRole>(UserRole.VIEWER);
  const [currentUser, setCurrentUser] = useState<Student | null>(null);
  const [crPermissions, setCrPermissions] = useState<string[]>([]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginInput, setLoginInput] = useState('');

  useEffect(() => {
    localStorage.setItem('uu_eee_data', JSON.stringify(data));
  }, [data]);

  const handleLogin = () => {
    const val = loginInput.trim();
    if (val === MASTER_PASS) {
      setRole(UserRole.MASTER);
      setShowLoginModal(false);
    } else {
      const cr = data.crKeys.find(k => k.key === val);
      if (cr) {
        setRole(UserRole.CR);
        setCrPermissions(cr.permissions);
        setShowLoginModal(false);
      } else {
        const student = data.student.find(s => s.id === val);
        if (student) {
          setRole(UserRole.STUDENT);
          setCurrentUser(student);
          setShowLoginModal(false);
        } else {
          alert("Invalid credentials!");
        }
      }
    }
    setLoginInput('');
  };

  const handleLogout = () => {
    setRole(UserRole.VIEWER);
    setCurrentUser(null);
    setCrPermissions([]);
  };

  const canEdit = (perm: string) => {
    return role === UserRole.MASTER || (role === UserRole.CR && crPermissions.includes(perm));
  };

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  const handleVote = (pollId: string, optionIndex: number) => {
    if (role !== UserRole.STUDENT) {
      alert("Please login as a student to vote.");
      return;
    }
    setData(prev => ({
      ...prev,
      polls: prev.polls.map(p => {
        if (p.id === pollId && !p.voters.includes(currentUser!.id)) {
          const newOptions = [...p.options];
          newOptions[optionIndex].votes += 1;
          return { ...p, options: newOptions, voters: [...p.voters, currentUser!.id] };
        }
        return p;
      })
    }));
  };

  const renderSection = () => {
    switch (activeSection) {
      case 'home': return <HomeView data={data} setData={setData} canEdit={canEdit} />;
      case 'academic': return <AcademicView data={data} setData={setData} canEdit={canEdit} />;
      case 'students': return <StudentsView data={data} setData={setData} canEdit={canEdit} role={role} currentUser={currentUser} />;
      case 'teachers': return <TeachersView data={data} setData={setData} canEdit={canEdit} />;
      case 'notice': return <NoticeView data={data} setData={setData} canEdit={canEdit} />;
      case 'attendance': return <AttendanceView data={data} setData={setData} canEdit={canEdit} />;
      case 'polls': return <PollsView data={data} handleVote={handleVote} currentUser={currentUser} canEdit={canEdit} setData={setData} />;
      default: return <HomeView data={data} setData={setData} canEdit={canEdit} />;
    }
  };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      {isSidebarOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-sm" onClick={toggleSidebar} />
      )}

      <aside className={`fixed inset-y-0 left-0 w-72 bg-slate-900 text-slate-300 z-50 transform ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 flex flex-col shadow-2xl lg:shadow-none`}>
        <div className="p-8 flex items-center gap-3 text-white text-2xl font-bold border-b border-slate-800/50">
          <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900">
            <i className="fa-solid fa-bolt"></i>
          </div>
          <span className="tracking-tight">UU EEE Hub</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto mt-4">
          {[
            { id: 'home', icon: 'fa-house', label: 'Routine & Dashboard' },
            { id: 'academic', icon: 'fa-book-open', label: 'Study Resources' },
            { id: 'students', icon: 'fa-users', label: 'Student List' },
            { id: 'teachers', icon: 'fa-chalkboard-user', label: 'Faculty Directory' },
            { id: 'notice', icon: 'fa-bullhorn', label: 'Notice Board' },
            { id: 'attendance', icon: 'fa-clipboard-check', label: 'Attendance' },
            { id: 'polls', icon: 'fa-square-poll-vertical', label: 'Batch Polls' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => { setActiveSection(item.id); setIsSidebarOpen(false); }}
              className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl transition-all font-medium ${activeSection === item.id ? 'bg-amber-500 text-slate-900 shadow-lg shadow-amber-500/20' : 'hover:bg-slate-800 hover:text-white'}`}
            >
              <i className={`fa-solid ${item.icon} w-6 text-center`}></i>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-slate-800/50 space-y-4">
          <button 
            onClick={role === UserRole.VIEWER ? () => setShowLoginModal(true) : handleLogout}
            className={`w-full flex items-center justify-center gap-3 py-4 rounded-xl border-2 transition-all ${role !== UserRole.VIEWER ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-slate-800 border-slate-700 text-white hover:bg-slate-700 active:scale-95'}`}
          >
            <i className={`fa-solid ${role !== UserRole.VIEWER ? 'fa-user-check' : 'fa-right-to-bracket'}`}></i>
            <span className="font-bold">{role !== UserRole.VIEWER ? (currentUser?.name || 'Authorized') : 'Login'}</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 h-full relative">
        <header className="lg:hidden flex items-center justify-between p-5 bg-white border-b border-slate-200 shadow-sm sticky top-0 z-30">
          <button onClick={toggleSidebar} className="w-10 h-10 flex items-center justify-center rounded-lg bg-slate-50 text-slate-600 active:scale-90 transition-transform">
            <i className="fa-solid fa-bars text-xl"></i>
          </button>
          <div className="font-bold text-slate-800 tracking-tight">UU EEE Portal</div>
          <div className="w-10"></div>
        </header>

        <div className="flex-1 overflow-y-auto p-4 md:p-10 max-w-7xl mx-auto w-full space-y-8 scroll-smooth">
          {renderSection()}
          <footer className="pt-10 pb-6 text-center text-slate-400 text-sm">
            &copy; 2024 UU EEE Batch 2026. Made with <i className="fa-solid fa-heart text-red-400 mx-1"></i>
          </footer>
        </div>
      </main>

      {showLoginModal && (
        <div className="fixed inset-0 bg-slate-900/90 backdrop-blur-md z-[60] flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-8 w-full max-w-md shadow-2xl animate-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-8">
              <h3 className="text-2xl font-black text-slate-800">Welcome Back</h3>
              <button onClick={() => setShowLoginModal(false)} className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-400 hover:text-red-500">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-slate-500 mb-2 ml-1">Student ID or Access Key</label>
                <input
                  type="password"
                  value={loginInput}
                  onChange={(e) => setLoginInput(e.target.value)}
                  placeholder="e.g. 2026001"
                  className="w-full px-5 py-4 rounded-2xl border-2 border-slate-100 focus:border-amber-500 focus:ring-4 focus:ring-amber-500/5 outline-none transition-all text-center text-xl font-bold tracking-widest placeholder:tracking-normal placeholder:font-normal"
                  onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                />
              </div>
              <button 
                onClick={handleLogin}
                className="w-full py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 active:scale-[0.98] transition-all shadow-xl shadow-slate-900/10"
              >
                Enter Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// --- Sub-View Components ---

const HomeView: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; canEdit: (p: string) => boolean }> = ({ data, setData, canEdit }) => {
  const [form, setForm] = useState<Partial<RoutineItem>>({ type: 'Offline', day: 'FRIDAY' });

  const addClass = () => {
    if (!form.sub || !form.time) return alert("Fill required fields");
    const newItem: RoutineItem = {
      id: Date.now().toString(),
      type: form.type as any,
      day: form.day || 'FRIDAY',
      time: form.time || '',
      sub: form.sub || '',
      teacher: form.teacher || '',
      roomOrLink: form.roomOrLink || ''
    };
    setData(prev => ({ ...prev, routine: [...prev.routine, newItem] }));
    setForm({ type: 'Offline', day: 'FRIDAY' });
  };

  const removeClass = (id: string) => {
    setData(prev => ({ ...prev, routine: prev.routine.filter(r => r.id !== id) }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-5 duration-500">
      <div className="flex items-center gap-3 py-2">
        <span className="text-3xl">👋</span>
        <h1 className="text-3xl font-black text-slate-800">Welcome Batch 2026</h1>
      </div>

      <div className="bg-blue-50 border border-blue-100 p-4 rounded-2xl flex items-center gap-4 text-blue-700 shadow-sm">
        <div className="flex items-center gap-2">
          <i className="fa-solid fa-bullhorn text-lg"></i>
          <span className="font-black">Latest:</span>
        </div>
        <button className="text-blue-600 hover:underline font-medium">Update your Profile</button>
      </div>

      {canEdit('routine') && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-md space-y-4">
          <h3 className="font-black text-lg text-slate-800 flex items-center gap-3">
            <i className="fa-solid fa-plus-circle text-amber-500"></i>
            Quick Add Routine
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <select value={form.type} onChange={e => setForm({...form, type: e.target.value as any})} className="p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none">
                <option value="Offline">Offline Class</option>
                <option value="Online">Online Class</option>
            </select>
            <input placeholder="DAY (e.g. FRIDAY)" value={form.day} onChange={e => setForm({...form, day: e.target.value.toUpperCase()})} className="p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none" />
            <input placeholder="TIME (e.g. 8.00)" value={form.time} onChange={e => setForm({...form, time: e.target.value})} className="p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none" />
            <input placeholder="SUBJECT" value={form.sub} onChange={e => setForm({...form, sub: e.target.value})} className="p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none" />
            <input placeholder="TEACHER" value={form.teacher} onChange={e => setForm({...form, teacher: e.target.value})} className="p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none" />
            <input placeholder="ROOM / LINK" value={form.roomOrLink} onChange={e => setForm({...form, roomOrLink: e.target.value})} className="p-3 rounded-xl bg-slate-50 border border-slate-100 outline-none" />
          </div>
          <button onClick={addClass} className="w-full bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-all">
            Add to Routine
          </button>
        </div>
      )}

      <div className="space-y-12">
        <RoutineSection title="Offline Class (Campus)" type="Offline" items={data.routine} removeClass={removeClass} canEdit={canEdit('routine')} />
        <RoutineSection title="Online Class" type="Online" items={data.routine} removeClass={removeClass} canEdit={canEdit('routine')} />
      </div>
    </div>
  );
};

const RoutineSection: React.FC<{ title: string; type: string; items: RoutineItem[]; removeClass: (id: string) => void; canEdit: boolean }> = ({ title, type, items, removeClass, canEdit }) => {
  const filtered = items.filter(i => i.type === type);
  const isOffline = type === 'Offline';
  
  return (
    <div className="space-y-0">
      <div className={`flex items-center gap-3 p-4 bg-slate-100/50 rounded-t-2xl border-l-8 ${isOffline ? 'border-emerald-500' : 'border-blue-500'}`}>
        <i className={`fa-solid ${isOffline ? 'fa-building' : 'fa-laptop'} text-slate-600`}></i>
        <h3 className="text-lg font-black text-slate-800">{title}</h3>
      </div>
      
      <div className="bg-white border-x border-b border-slate-100 shadow-sm overflow-hidden">
        <table className="w-full text-left table-fixed md:table-auto">
          <thead className="bg-slate-50/50 text-slate-400 text-[11px] uppercase font-black tracking-widest border-b border-slate-100">
            <tr>
              <th className="px-6 py-4 w-28">DAY</th>
              <th className="px-6 py-4 w-28">TIME</th>
              <th className="px-6 py-4">SUBJECT</th>
              <th className="px-6 py-4">TEACHER</th>
              <th className="px-6 py-4">{isOffline ? 'ROOM' : 'LINK'}</th>
              {canEdit && <th className="px-6 py-4 w-16 text-center"></th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {filtered.length === 0 ? (
              <tr><td colSpan={canEdit ? 6 : 5} className="px-6 py-10 text-center text-slate-300 font-medium italic">No classes scheduled</td></tr>
            ) : filtered.map(item => (
              <tr key={item.id} className={`group hover:bg-slate-50/50 transition-colors border-l-4 ${isOffline ? 'border-emerald-500/20' : 'border-blue-500/20'}`}>
                <td className="px-6 py-4 font-black text-slate-900 uppercase text-sm">{item.day}</td>
                <td className="px-6 py-4 text-slate-600 font-medium text-sm">{item.time}</td>
                <td className="px-6 py-4 text-slate-700 font-semibold text-sm">{item.sub}</td>
                <td className="px-6 py-4 text-slate-600 font-medium text-sm">{item.teacher}</td>
                <td className="px-6 py-4">
                  {isOffline ? (
                    <span className="text-slate-600 font-bold text-sm">{item.roomOrLink}</span>
                  ) : (
                    <a href={item.roomOrLink.startsWith('http') ? item.roomOrLink : `https://${item.roomOrLink}`} target="_blank" className="text-blue-500 hover:underline font-bold text-sm truncate block max-w-[150px]">
                      {item.roomOrLink}
                    </a>
                  )}
                </td>
                {canEdit && (
                  <td className="px-6 py-4 text-center">
                    <button onClick={() => removeClass(item.id)} className="text-slate-200 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100">
                      <i className="fa-solid fa-trash-can text-sm"></i>
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const AcademicView: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; canEdit: (p: string) => boolean }> = ({ data, setData, canEdit }) => {
  const [newSub, setNewSub] = useState({ name: '', code: '', link: '' });
  const [newRes, setNewRes] = useState({ title: '', url: '' });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Study Hub</h2>
        <div className="px-4 py-2 bg-slate-900 text-white rounded-full text-xs font-bold tracking-widest uppercase">Academic 2026</div>
      </div>
      
      {canEdit('academic') && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-5">
            <h3 className="font-black text-lg text-slate-800">New Course</h3>
            <div className="space-y-4">
               <input placeholder="Course Name" value={newSub.name} onChange={e => setNewSub({...newSub, name: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
               <input placeholder="Code" value={newSub.code} onChange={e => setNewSub({...newSub, code: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
               <input placeholder="Syllabus Link" value={newSub.link} onChange={e => setNewSub({...newSub, link: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
               <button onClick={() => { setData(prev => ({...prev, subjects: [...prev.subjects, newSub]})); setNewSub({name:'', code:'', link:''}) }} className="w-full bg-slate-900 text-white font-bold py-4 rounded-2xl">Add Course</button>
            </div>
          </div>
          <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-5">
            <h3 className="font-black text-lg text-slate-800">New File</h3>
            <div className="space-y-4">
               <input placeholder="File Title" value={newRes.title} onChange={e => setNewRes({...newRes, title: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
               <input placeholder="Google Drive Link" value={newRes.url} onChange={e => setNewRes({...newRes, url: e.target.value})} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
               <button onClick={() => { setData(prev => ({...prev, resources: [...prev.resources, newRes]})); setNewRes({title:'', url:''}) }} className="w-full bg-amber-500 text-slate-900 font-bold py-4 rounded-2xl">Upload Link</button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {data.subjects.map((sub, i) => (
          <a key={i} href={sub.link} target="_blank" className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between group hover:border-amber-500 transition-all hover:shadow-xl hover:-translate-y-1">
            <div>
              <div className="font-black text-slate-900 text-lg leading-tight">{sub.name}</div>
              <div className="text-sm text-slate-400 font-bold mt-1 tracking-widest uppercase">{sub.code}</div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-amber-100 group-hover:text-amber-600 transition-all">
              <i className="fa-solid fa-arrow-up-right-from-square"></i>
            </div>
          </a>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-5">
        {data.resources.map((res, i) => (
          <a key={i} href={res.url} target="_blank" className="bg-white p-6 rounded-3xl border border-slate-200 flex items-center gap-5 hover:bg-slate-50 transition-all">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-500 flex items-center justify-center text-2xl">
              <i className="fa-solid fa-folder-open"></i>
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-black text-slate-800 truncate">{res.title}</div>
              <div className="text-xs text-slate-400 truncate font-mono mt-1">{res.url}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

const StudentsView: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; canEdit: (p: string) => boolean; role: UserRole; currentUser: Student | null }> = ({ data, setData, canEdit, role, currentUser }) => {
  const [newS, setNewS] = useState<Partial<Student>>({});

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Student Directory</h2>
      
      {canEdit('student') && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-5">
          <h3 className="font-black text-xl">Register Profile</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input placeholder="Name" value={newS.name || ''} onChange={e => setNewS({...newS, name: e.target.value})} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
            <input placeholder="ID" value={newS.id || ''} onChange={e => setNewS({...newS, id: e.target.value})} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
            <input placeholder="Session" value={newS.dipSession || ''} onChange={e => setNewS({...newS, dipSession: e.target.value})} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
            <input placeholder="Phone" value={newS.phone || ''} onChange={e => setNewS({...newS, phone: e.target.value})} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
          </div>
          <button onClick={() => { setData(prev => ({...prev, student: [...prev.student, newS as Student]})); setNewS({}) }} className="w-full bg-amber-500 text-slate-900 font-black py-4 rounded-2xl">Save Member</button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {data.student.map((s, i) => (
          <div key={i} className={`bg-white p-6 rounded-3xl border-2 transition-all flex items-center gap-5 relative group ${currentUser?.id === s.id ? 'border-amber-500 shadow-xl shadow-amber-500/5' : 'border-slate-100'}`}>
            <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${s.id}`} className="w-16 h-16 rounded-2xl bg-slate-50" alt={s.name} />
            <div className="flex-1 min-w-0">
              <div className="font-black text-slate-900 text-lg truncate leading-tight">{s.name}</div>
              <div className="text-xs text-slate-400 font-bold tracking-tighter mt-1">{s.id} • {s.dipSession}</div>
            </div>
            <a href={`tel:${s.phone}`} className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center hover:bg-emerald-500 hover:text-white transition-all">
              <i className="fa-solid fa-phone"></i>
            </a>
            {canEdit('student') && (
              <button onClick={() => setData(prev => ({...prev, student: prev.student.filter(x => x.id !== s.id)}))} className="absolute top-2 right-2 text-slate-200 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100">
                <i className="fa-solid fa-circle-xmark"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const TeachersView: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; canEdit: (p: string) => boolean }> = ({ data, setData, canEdit }) => {
  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Department Faculty</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {data.teacher.map((t, i) => (
          <div key={i} className="bg-white p-8 rounded-[2rem] border border-slate-200 shadow-sm flex flex-col items-center text-center space-y-6 hover:shadow-2xl transition-all relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-slate-900 to-slate-800 -z-0"></div>
            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${t.name}`} className="w-28 h-28 rounded-[2rem] border-4 border-white shadow-xl relative z-10" alt={t.name} />
            <div className="relative z-10 pt-2">
              <div className="font-black text-2xl text-slate-900 tracking-tight leading-tight">{t.name}</div>
              <div className="text-amber-600 font-bold text-sm uppercase tracking-widest mt-2">{t.designation}</div>
            </div>
            <div className="flex gap-4 w-full relative z-10">
              <a href={`tel:${t.phone}`} className="flex-1 flex items-center justify-center gap-2 py-4 rounded-2xl bg-slate-900 text-white font-black hover:bg-slate-800 transition-all">
                <i className="fa-solid fa-phone-flip text-xs"></i>
                Call
              </a>
              <button className="w-14 h-14 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center hover:bg-amber-100 hover:text-amber-600 transition-all">
                <i className="fa-solid fa-envelope"></i>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const NoticeView: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; canEdit: (p: string) => boolean }> = ({ data, setData, canEdit }) => {
  const [newN, setNewN] = useState<Partial<Notice>>({ date: new Date().toISOString().split('T')[0] });

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Announcements</h2>
      
      {canEdit('notice') && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="font-black text-xl">Publish News</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" value={newN.date} onChange={e => setNewN({...newN, date: e.target.value})} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
            <input placeholder="Short Heading" value={newN.title || ''} onChange={e => setNewN({...newN, title: e.target.value})} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
          </div>
          <textarea rows={4} placeholder="Full Announcement Content..." value={newN.desc || ''} onChange={e => setNewN({...newN, desc: e.target.value})} className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
          <button onClick={() => { setData(prev => ({...prev, notice: [...prev.notice, {...newN, id: Date.now().toString()} as Notice]})); setNewN({date: new Date().toISOString().split('T')[0]}) }} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10">Post Publicly</button>
        </div>
      )}

      <div className="space-y-6">
        {[...data.notice].reverse().map((n, i) => (
          <div key={i} className="bg-white p-8 rounded-3xl border-2 border-slate-100 shadow-sm relative hover:border-amber-200 transition-all group">
            <div className="flex justify-between items-start mb-6">
              <div className="px-4 py-1.5 bg-slate-50 text-slate-400 rounded-full text-[10px] font-black uppercase tracking-widest">{n.date}</div>
              {canEdit('notice') && (
                <button onClick={() => setData(prev => ({...prev, notice: prev.notice.filter(x => x.id !== n.id)}))} className="text-slate-200 hover:text-red-500 transition-colors">
                   <i className="fa-solid fa-trash-can"></i>
                </button>
              )}
            </div>
            <h4 className="text-2xl font-black text-slate-900 mb-4 leading-tight">{n.title}</h4>
            <p className="text-slate-600 leading-relaxed font-medium">{n.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const AttendanceView: React.FC<{ data: AppData; setData: React.Dispatch<React.SetStateAction<AppData>>; canEdit: (p: string) => boolean }> = ({ data, setData, canEdit }) => {
  const [attDate, setAttDate] = useState(new Date().toISOString().split('T')[0]);
  const [attSub, setAttSub] = useState('');
  const [tempPresent, setTempPresent] = useState<Set<string>>(new Set());

  const saveAttendance = () => {
    if (!attSub) return alert("Subject required");
    const record: AttendanceRecord = { id: Date.now().toString(), date: attDate, subject: attSub, presentIDs: Array.from(tempPresent) };
    setData(prev => ({ ...prev, attendance: [...prev.attendance, record] }));
    setTempPresent(new Set()); setAttSub('');
  };

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Attendance Manager</h2>
      
      {canEdit('attendance') && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="date" value={attDate} onChange={e => setAttDate(e.target.value)} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
            <input placeholder="Subject Name" value={attSub} onChange={e => setAttSub(e.target.value)} className="p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setTempPresent(new Set(data.student.map(s => s.id)))} className="px-6 py-3 bg-slate-100 text-slate-600 rounded-xl text-xs font-black uppercase">All Present</button>
            <button onClick={() => setTempPresent(new Set())} className="px-6 py-3 bg-slate-100 text-slate-400 rounded-xl text-xs font-black uppercase">Clear</button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {data.student.map(s => (
              <button 
                key={s.id} 
                onClick={() => setTempPresent(prev => { const next = new Set(prev); if(next.has(s.id)) next.delete(s.id); else next.add(s.id); return next; })}
                className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${tempPresent.has(s.id) ? 'bg-emerald-500 border-emerald-600 text-white shadow-lg' : 'bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100'}`}
              >
                <div className="font-black text-xs truncate w-full text-center">{s.name}</div>
                <div className="text-[10px] font-bold opacity-60 tracking-tighter">{s.id}</div>
              </button>
            ))}
          </div>
          <button onClick={saveAttendance} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl shadow-xl shadow-slate-900/10">Save Record</button>
        </div>
      )}

      <div className="space-y-4">
        <h3 className="text-xl font-black text-slate-800 ml-2">History Records</h3>
        {[...data.attendance].reverse().map((record, i) => (
          <div key={i} className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center text-xl">
                <i className="fa-solid fa-calendar-check"></i>
              </div>
              <div>
                <div className="font-black text-slate-900 text-lg">{record.subject}</div>
                <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">{record.date} • {record.presentIDs.length} Present</div>
              </div>
            </div>
            {canEdit('attendance') && (
              <button onClick={() => setData(prev => ({...prev, attendance: prev.attendance.filter(x => x.id !== record.id)}))} className="w-10 h-10 rounded-full text-slate-200 hover:text-red-500 transition-colors">
                <i className="fa-solid fa-trash-can"></i>
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const PollsView: React.FC<{ data: AppData; handleVote: (pid: string, oi: number) => void; currentUser: Student | null; canEdit: (p: string) => boolean; setData: React.Dispatch<React.SetStateAction<AppData>> }> = ({ data, handleVote, currentUser, canEdit, setData }) => {
  const [newQ, setNewQ] = useState('');
  const [newO, setNewO] = useState('');

  return (
    <div className="space-y-10 animate-in fade-in duration-500">
      <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Batch Decision Polls</h2>
      
      {canEdit('polls') && (
        <div className="bg-white p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="font-black text-xl">New Topic</h3>
          <input placeholder="What's the question?" value={newQ} onChange={e => setNewQ(e.target.value)} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
          <textarea placeholder="Option 1, Option 2, Option 3..." value={newO} onChange={e => setNewO(e.target.value)} rows={2} className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-amber-500 outline-none" />
          <button onClick={() => { setData(prev => ({...prev, polls: [...prev.polls, {id: Date.now().toString(), question: newQ, options: newO.split(',').map(x => ({text: x.trim(), votes: 0})).filter(o => o.text), voters: []}]})); setNewQ(''); setNewO(''); }} className="w-full bg-slate-900 text-white font-black py-4 rounded-2xl">Start Voting</button>
        </div>
      )}

      <div className="space-y-6">
        {[...data.polls].reverse().map(poll => {
          const total = poll.options.reduce((a, b) => a + b.votes, 0);
          const hasVoted = currentUser && poll.voters.includes(currentUser.id);

          return (
            <div key={poll.id} className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6 relative overflow-hidden group">
              <div className="flex justify-between items-start">
                <h4 className="text-2xl font-black text-slate-800 pr-10">{poll.question}</h4>
                {canEdit('polls') && (
                  <button onClick={() => setData(prev => ({...prev, polls: prev.polls.filter(x => x.id !== poll.id)}))} className="text-slate-200 hover:text-red-500">
                    <i className="fa-solid fa-trash-can"></i>
                  </button>
                )}
              </div>
              <div className="space-y-3">
                {poll.options.map((opt, oi) => {
                  const pct = total ? Math.round((opt.votes / total) * 100) : 0;
                  return (
                    <button 
                      key={oi} 
                      onClick={() => handleVote(poll.id, oi)}
                      disabled={!!hasVoted}
                      className={`w-full relative rounded-2xl border-2 p-5 text-left transition-all ${hasVoted ? 'bg-slate-50 border-slate-100 cursor-default' : 'bg-white border-slate-100 hover:border-amber-400 active:scale-[0.99]'}`}
                    >
                      <div className="absolute inset-y-0 left-0 bg-amber-500/10 transition-all duration-1000" style={{ width: `${pct}%` }}></div>
                      <div className="relative flex justify-between items-center">
                        <span className="font-bold text-slate-700">{opt.text}</span>
                        <div className="flex items-center gap-3">
                           <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{opt.votes} votes</span>
                           <span className="text-sm font-black text-amber-600">{pct}%</span>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                 <div className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Total Respondents: {total}</div>
                 {hasVoted && <div className="text-emerald-500 font-black text-xs flex items-center gap-2"><i className="fa-solid fa-circle-check"></i> Recorded</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default App;
