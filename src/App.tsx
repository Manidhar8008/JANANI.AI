import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Heart, 
  MessageCircle, 
  Calendar, 
  BookOpen, 
  Send, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  Circle,
  Plus,
  History,
  ArrowRight
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { cn } from './lib/utils';
import { ChatMessage } from './types';
import { getJananiResponse } from './services/gemini';

// --- Types ---
interface Task {
  id: number;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}

interface ActivityLog {
  id: number;
  taskId: number;
  action: string;
  timestamp: string;
  notes: string | null;
  task: { title: string };
}

// --- Components ---

const Navbar = ({ activeTab, setActiveTab }: { activeTab: string, setActiveTab: (tab: string) => void }) => {
  const tabs = [
    { id: 'dashboard', icon: Activity, label: 'OS' },
    { id: 'chat', icon: MessageCircle, label: 'Janani AI' },
    { id: 'tasks', icon: Calendar, label: 'Tasks' },
    { id: 'history', icon: History, label: 'Memory' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-6 py-3 z-50 md:top-0 md:bottom-auto md:border-t-0 md:border-b">
      <div className="max-w-4xl mx-auto flex justify-between items-center">
        <div className="hidden md:flex items-center gap-2">
          <Activity className="text-brand-olive" size={24} />
          <span className="font-serif text-xl font-bold text-brand-olive">janani.ai</span>
        </div>
        <div className="flex justify-around w-full md:w-auto md:gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex flex-col items-center gap-1 transition-colors",
                activeTab === tab.id ? "text-brand-olive" : "text-gray-400 hover:text-gray-600"
              )}
            >
              <tab.icon size={20} className={activeTab === tab.id ? "fill-current" : ""} />
              <span className="text-[10px] uppercase tracking-widest font-semibold md:text-xs">{tab.label}</span>
              {activeTab === tab.id && (
                <motion.div 
                  layoutId="activeTab" 
                  className="h-0.5 w-4 bg-brand-olive rounded-full mt-1"
                />
              )}
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
};

const Dashboard = ({ tasks, logs }: { tasks: Task[], logs: ActivityLog[] }) => {
  const completedCount = tasks.filter(t => t.completed).length;
  const completionRate = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="space-y-8 pb-24 md:pt-20">
      <header className="space-y-2">
        <h1 className="text-5xl font-light tracking-tight">System Status</h1>
        <p className="text-gray-500 italic serif text-lg">Analyzing behavior patterns and discipline loops.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-8 bg-white flex flex-col justify-between"
        >
          <div className="space-y-4">
            <span className="text-xs uppercase tracking-widest font-bold text-gray-400">Discipline Score</span>
            <h2 className="text-6xl font-serif italic">{completionRate}%</h2>
            <p className="text-gray-600 leading-relaxed">
              You've completed {completedCount} out of {tasks.length} tasks today.
            </p>
          </div>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${completionRate}%` }}
                className="bg-brand-olive h-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-8 bg-brand-olive text-white"
        >
          <div className="space-y-6">
            <span className="text-xs uppercase tracking-widest font-bold opacity-70">AI Suggestion</span>
            <p className="text-2xl font-serif italic leading-snug">
              "Your morning productivity is high, but afternoon focus drops. Try moving your deep work tasks to 9 AM."
            </p>
            <button className="flex items-center gap-2 text-sm font-bold uppercase tracking-widest hover:gap-3 transition-all">
              Analyze Patterns <ArrowRight size={16} />
            </button>
          </div>
        </motion.div>
      </div>

      <section className="space-y-4">
        <h3 className="text-2xl font-medium">Recent Activity</h3>
        <div className="space-y-3">
          {logs.slice(0, 3).map((log) => (
            <div key={log.id} className="p-4 bg-white rounded-2xl border border-gray-100 shadow-sm flex justify-between items-center">
              <div>
                <p className="font-medium">{log.task.title}</p>
                <p className="text-xs text-gray-400 uppercase tracking-widest font-bold">{log.action}</p>
              </div>
              <span className="text-xs text-gray-400">
                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

const Tasks = ({ tasks, onToggle, onAdd }: { tasks: Task[], onToggle: (id: number, completed: boolean) => void, onAdd: (title: string) => void }) => {
  const [newTitle, setNewTitle] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAdd(newTitle);
    setNewTitle('');
  };

  return (
    <div className="space-y-8 pb-24 md:pt-20">
      <header className="space-y-2">
        <h1 className="text-5xl font-light tracking-tight">Execution</h1>
        <p className="text-gray-500 italic serif text-lg">Daily actions required for system optimization.</p>
      </header>

      <form onSubmit={handleSubmit} className="relative">
        <input 
          type="text" 
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Add new task..."
          className="w-full bg-white border-none rounded-full py-4 pl-6 pr-14 shadow-lg focus:ring-2 focus:ring-brand-olive/20 outline-none"
        />
        <button 
          type="submit"
          className="absolute right-2 top-2 p-2 bg-brand-olive text-white rounded-full hover:opacity-90 transition-opacity"
        >
          <Plus size={20} />
        </button>
      </form>

      <div className="space-y-4">
        {tasks.map((task) => (
          <motion.div 
            key={task.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="card p-6 bg-white flex items-center justify-between group cursor-pointer hover:shadow-md transition-all"
            onClick={() => onToggle(task.id, !task.completed)}
          >
            <div className="flex items-center gap-4">
              {task.completed ? (
                <CheckCircle2 className="text-brand-olive" size={24} />
              ) : (
                <Circle className="text-gray-300" size={24} />
              )}
              <span className={cn("text-xl font-medium", task.completed && "text-gray-400 line-through")}>
                {task.title}
              </span>
            </div>
            <ChevronRight className="text-gray-200 group-hover:text-brand-olive transition-colors" />
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const Memory = ({ logs }: { logs: ActivityLog[] }) => {
  return (
    <div className="space-y-8 pb-24 md:pt-20">
      <header className="space-y-2">
        <h1 className="text-5xl font-light tracking-tight">Memory Bank</h1>
        <p className="text-gray-500 italic serif text-lg">Stored behavior logs and historical patterns.</p>
      </header>

      <div className="space-y-6">
        {logs.map((log) => (
          <div key={log.id} className="relative pl-8 border-l-2 border-gray-100 py-2">
            <div className="absolute left-[-9px] top-4 w-4 h-4 rounded-full bg-brand-olive border-4 border-white shadow-sm" />
            <div className="card p-6 bg-white space-y-2">
              <div className="flex justify-between items-start">
                <h4 className="text-lg font-medium">{log.task.title}</h4>
                <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">
                  {new Date(log.timestamp).toLocaleDateString()}
                </span>
              </div>
              <p className="text-sm text-gray-500 italic serif">Action: {log.action}</p>
              {log.notes && <p className="text-gray-600">{log.notes}</p>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const Chat = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "System online. I am Janani, your Personal AI OS. How shall we optimize your discipline today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user' as const, text: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    const response = await getJananiResponse([...messages, userMessage]);
    setMessages(prev => [...prev, { role: 'model', text: response }]);
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-160px)] md:h-[calc(100vh-120px)] md:pt-20">
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 pb-4 scrollbar-hide"
      >
        {messages.map((msg, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={cn(
              "flex w-full",
              msg.role === 'user' ? "justify-end" : "justify-start"
            )}
          >
            <div className={cn(
              "max-w-[85%] p-4 rounded-3xl",
              msg.role === 'user' 
                ? "bg-brand-olive text-white rounded-tr-none" 
                : "bg-white text-gray-800 rounded-tl-none shadow-sm"
            )}>
              <div className="prose prose-sm prose-invert max-w-none">
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white p-4 rounded-3xl rounded-tl-none shadow-sm flex gap-1">
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-gray-300 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-gray-300 rounded-full" />
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.4 }} className="w-2 h-2 bg-gray-300 rounded-full" />
            </div>
          </div>
        )}
      </div>

      <div className="mt-4 relative">
        <input 
          type="text" 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          placeholder="Input data or query system..."
          className="w-full bg-white border-none rounded-full py-4 pl-6 pr-14 shadow-lg focus:ring-2 focus:ring-brand-olive/20 outline-none"
        />
        <button 
          onClick={handleSend}
          disabled={isLoading}
          className="absolute right-2 top-2 p-2 bg-brand-olive text-white rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          <Send size={20} />
        </button>
      </div>
    </div>
  );
};

// --- Main App ---

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [logs, setLogs] = useState<ActivityLog[]>([]);

  const fetchData = async () => {
    try {
      const [tasksRes, logsRes] = await Promise.all([
        fetch('/api/tasks'),
        fetch('/api/logs')
      ]);
      const tasksData = await tasksRes.json();
      const logsData = await logsRes.json();
      setTasks(tasksData);
      setLogs(logsData);
    } catch (error) {
      console.error("Failed to fetch data", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const toggleTask = async (id: number, completed: boolean) => {
    try {
      await fetch(`/api/tasks/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed })
      });
      
      // Log the action
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId: id, 
          action: completed ? 'completed' : 'uncompleted',
          notes: `Task status changed to ${completed ? 'done' : 'pending'}`
        })
      });

      fetchData();
    } catch (error) {
      console.error("Failed to toggle task", error);
    }
  };

  const addTask = async (title: string) => {
    try {
      const res = await fetch('/api/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description: "System generated task" })
      });
      const newTask = await res.json();

      // Log the creation
      await fetch('/api/logs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          taskId: newTask.id, 
          action: 'created',
          notes: 'New task added to execution queue'
        })
      });

      fetchData();
    } catch (error) {
      console.error("Failed to add task", error);
    }
  };

  return (
    <div className="min-h-screen bg-brand-cream selection:bg-brand-olive/20">
      <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      <main className="max-w-4xl mx-auto px-6 pt-8 pb-20 md:pb-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'dashboard' && <Dashboard tasks={tasks} logs={logs} />}
            {activeTab === 'chat' && <Chat />}
            {activeTab === 'tasks' && <Tasks tasks={tasks} onToggle={toggleTask} onAdd={addTask} />}
            {activeTab === 'history' && <Memory logs={logs} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Background Decorative Elements */}
      <div className="fixed top-0 right-0 -z-10 w-64 h-64 bg-brand-peach/20 rounded-full blur-3xl" />
      <div className="fixed bottom-0 left-0 -z-10 w-96 h-96 bg-brand-sage/10 rounded-full blur-3xl" />
    </div>
  );
}
