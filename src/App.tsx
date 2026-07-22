import React, { useState, useEffect } from "react";
import CatWidget from "./components/CatWidget";
import {
  Settings,
  Bell,
  X,
  Plus,
  Trash2,
  RotateCcw,
  Moon,
  Sun,
  Utensils,
  Heart,
  Zap,
  Gamepad2,
  CheckCircle2,
  Circle,
  Clock,
  ListTodo,
  Cat,
  SlidersHorizontal,
  Palette,
  Glasses
} from "lucide-react";

const DEFAULT_SETTINGS = {
  catScale: 1.3,
  catType: "default",
  catSpeed: 1000,
  swattingEnabled: true,
  roamingEnabled: true,
  tamagotchiEnabled: true,
  hungerDecay: 3,
  energyDecay: 2,
  happinessDecay: 4,
  phrases: [
    { id: "1", text: "Miyav!", timeSec: 5 },
    { id: "2", text: "Mrrr...", timeSec: 15 },
    { id: "3", text: "Zzz...", timeSec: 30 },
  ],
};

interface Todo {
  id: number;
  text: string;
  time?: string;
  completed: boolean;
  warned5Min?: boolean;
  warnedNow?: boolean;
}

function CustomTimePicker({ value, onChange }: { value: string, onChange: (v: string) => void }) {
  const [isOpen, setIsOpen] = useState(false);
  
  const currentHour = value ? value.split(':')[0] : '12';
  const currentMinute = value ? value.split(':')[1] : '00';

  const hours = Array.from({length: 24}).map((_, i) => i.toString().padStart(2, '0'));
  const minutes = Array.from({length: 60}).map((_, i) => i.toString().padStart(2, '0'));

  const handleHourClick = (h: string) => {
    onChange(`${h}:${currentMinute}`);
  };

  const handleMinuteClick = (m: string) => {
    onChange(`${currentHour}:${m}`);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (isOpen && !(e.target as Element).closest('.time-picker-wrapper')) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  return (
    <div className="relative flex-1 time-picker-wrapper flex flex-col">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`h-14 w-full flex items-center justify-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-inset transition-colors ${isOpen ? 'ring-2 ring-amber-500 ring-inset bg-white' : 'hover:bg-white'}`}
      >
        <Clock className="w-5 h-5 text-slate-400" />
        <span className="text-slate-700 font-medium text-lg">{value || "--:--"}</span>
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 flex gap-2 w-full sm:w-[280px] animate-in fade-in zoom-in-95 duration-200">
          
          <div className="flex-1 h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {hours.map(h => (
              <button
                key={h}
                type="button"
                onClick={() => handleHourClick(h)}
                className={`w-full text-center py-2 rounded-lg mb-1 transition-colors cursor-pointer ${currentHour === h ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-600'}`}
              >
                {h}
              </button>
            ))}
          </div>

          <div className="w-px bg-slate-100 my-2"></div>

          <div className="flex-1 h-48 overflow-y-auto pr-1 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
            {minutes.map(m => (
              <button
                key={m}
                type="button"
                onClick={() => handleMinuteClick(m)}
                className={`w-full text-center py-2 rounded-lg mb-1 transition-colors cursor-pointer ${currentMinute === m ? 'bg-amber-500 text-white font-bold' : 'hover:bg-amber-50 text-slate-600'}`}
              >
                {m}
              </button>
            ))}
          </div>
          
        </div>
      )}
    </div>
  );
}

export default function App() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodo, setNewTodo] = useState("");
  const [newTodoTime, setNewTodoTime] = useState("");
  const [todoWarning, setTodoWarning] = useState<string | null>(null);
  
  const [colorTheme, setColorTheme] = useState("orange");
  const [catType, setCatType] = useState("default");
  const [accessory, setAccessory] = useState("none");
  
  const [showSettings, setShowSettings] = useState(false);
  const [activeTab, setActiveTab] = useState<'todo' | 'cat' | 'settings'>('todo');

  const [catScale, setCatScale] = useState(DEFAULT_SETTINGS.catScale);
  const [catSpeed, setCatSpeed] = useState(DEFAULT_SETTINGS.catSpeed);
  const [swattingEnabled, setSwattingEnabled] = useState(DEFAULT_SETTINGS.swattingEnabled);
  const [roamingEnabled, setRoamingEnabled] = useState(DEFAULT_SETTINGS.roamingEnabled);
  const [tamagotchiEnabled, setTamagotchiEnabled] = useState(DEFAULT_SETTINGS.tamagotchiEnabled);
  
  const [hungerDecay, setHungerDecay] = useState(DEFAULT_SETTINGS.hungerDecay);
  const [energyDecay, setEnergyDecay] = useState(DEFAULT_SETTINGS.energyDecay);
  const [happinessDecay, setHappinessDecay] = useState(DEFAULT_SETTINGS.happinessDecay);
  const [phrases, setPhrases] = useState(DEFAULT_SETTINGS.phrases);
  
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isCatActive, setIsCatActive] = useState(true);

  // Tamagotchi State
  const [hunger, setHunger] = useState(100);
  const [energy, setEnergy] = useState(100);
  const [happiness, setHappiness] = useState(100);
  const [actionTrigger, setActionTrigger] = useState<"FEED" | "SLEEP" | "PLAY" | null>(null);

  useEffect(() => {
    if (!tamagotchiEnabled) return;
    const interval = setInterval(() => {
      setHunger((h) => Math.max(0, h - hungerDecay / 2));
      setEnergy((e) => Math.max(0, e - energyDecay / 2));
      setHappiness((h) => Math.max(0, h - happinessDecay / 2));
    }, 10000); // Her 10 saniyede bir düşüş
    return () => clearInterval(interval);
  }, [tamagotchiEnabled, hungerDecay, energyDecay, happinessDecay]);

  const resetToDefaults = () => {
    setCatScale(DEFAULT_SETTINGS.catScale);
    setCatSpeed(DEFAULT_SETTINGS.catSpeed);
    setSwattingEnabled(DEFAULT_SETTINGS.swattingEnabled);
    setRoamingEnabled(DEFAULT_SETTINGS.roamingEnabled);
    setTamagotchiEnabled(DEFAULT_SETTINGS.tamagotchiEnabled);
    setHungerDecay(DEFAULT_SETTINGS.hungerDecay);
    setEnergyDecay(DEFAULT_SETTINGS.energyDecay);
    setHappinessDecay(DEFAULT_SETTINGS.happinessDecay);
    setPhrases(DEFAULT_SETTINGS.phrases);
    setColorTheme("orange");
    setCatType(DEFAULT_SETTINGS.catType);
    setAccessory("none");
  };

  // Todo warning logic
  useEffect(() => {
    const checkTimes = setInterval(() => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMinutes = now.getMinutes();

      let hasChanges = false;
      
      setTodos(currentTodos => {
        const nextTodos = currentTodos.map(t => {
          if (t.completed || !t.time) return t;
          
          const [h, m] = t.time.split(':').map(Number);
          const timeDiffMinutes = (h * 60 + m) - (currentHours * 60 + currentMinutes);
          
          let updatedT = { ...t };
          let shouldUpdate = false;

          if (timeDiffMinutes === 5 && !t.warned5Min) {
            setTodoWarning(`Miyav! "${t.text}" için son 5 dakika!`);
            setTimeout(() => setTodoWarning(null), 10000);
            updatedT.warned5Min = true;
            shouldUpdate = true;
          } else if (timeDiffMinutes <= 0 && timeDiffMinutes >= -5 && !t.warnedNow) {
            setTodoWarning(`Miyavvv! "${t.text}" vakti geldi!`);
            setTimeout(() => setTodoWarning(null), 10000);
            updatedT.warnedNow = true;
            shouldUpdate = true;
          }
          
          if (shouldUpdate) {
            hasChanges = true;
            return updatedT;
          }
          return t;
        });
        
        return hasChanges ? nextTodos : currentTodos;
      });
      
    }, 2000);

    const uncompletedCount = todos.filter(t => !t.completed).length;
    let timer: any;
    if (uncompletedCount > 0) {
      timer = setTimeout(() => {
        setTodoWarning(`Miyav! ${uncompletedCount} görev bekliyor!`);
        setTimeout(() => setTodoWarning(null), 5000);
      }, 120000); 
    }
    
    return () => {
      clearInterval(checkTimes);
      if (timer) clearTimeout(timer);
    };
  }, [todos]);

  const addTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.trim()) return;
    const timeStr = newTodoTime;
    setTodos([...todos, { id: Date.now(), text: newTodo.trim(), time: timeStr, completed: false }]);
    setNewTodo("");
    setTodoWarning("Miyav! Görev eklendi.");
    setTimeout(() => setTodoWarning(null), 3000);
  };

  const toggleTodo = (id: number) => {
    setTodos(todos.map(t => {
      if (t.id === id) {
        const isCompleted = !t.completed;
        if (isCompleted) {
           setTodoWarning("Miyav! Aferin! 🎉");
           setTimeout(() => setTodoWarning(null), 3000);
        }
        return { ...t, completed: isCompleted };
      }
      return t;
    }));
  };

  const deleteTodo = (id: number) => {
    setTodos(todos.filter(t => t.id !== id));
  };

  const addPhrase = () => {
    setPhrases([
      ...phrases,
      { id: Date.now().toString(), text: "", timeSec: 10 },
    ]);
  };

  const updatePhrase = (id: string, field: "text" | "timeSec", value: any) => {
    setPhrases(phrases.map((p) => (p.id === id ? { ...p, [field]: value } : p)));
  };

  const removePhrase = (id: string) => {
    setPhrases(phrases.filter((p) => p.id !== id));
  };

  const handleAction = (action: "FEED" | "SLEEP" | "PLAY") => {
    setActionTrigger(action);
    if (action === "FEED") setHunger(100);
    if (action === "SLEEP") setEnergy(100);
    if (action === "PLAY") setHappiness(100);
    setTimeout(() => setActionTrigger(null), 100);
  };

  const handleCatInteract = () => {
    if (!tamagotchiEnabled) return;
    if (hunger < 40 && hunger <= energy && hunger <= happiness) {
      handleAction("FEED");
    } else if (energy < 40 && energy <= happiness) {
      handleAction("SLEEP");
    } else if (happiness < 40) {
      handleAction("PLAY");
    } else {
      setHappiness((h) => Math.min(100, h + 10));
    }
  };

  const widgetPhrases = phrases
    .filter((p) => p.text.trim().length > 0)
    .map((p) => ({ text: p.text, timeMs: p.timeSec * 1000 }));

  return (
    <div className={`min-h-screen relative overflow-hidden flex flex-col font-sans transition-colors duration-500 ${isDarkMode ? "bg-transparent" : "bg-transparent"}`}>
      {/* Top Header - Just a simple transparent header with setting button */}
      <header className="absolute top-0 right-0 p-6 z-20">
        <button
          onClick={() => setShowSettings(true)}
          className={`p-3 rounded-2xl shadow-sm backdrop-blur-md transition-all duration-300 cursor-pointer ${isDarkMode ? "bg-slate-800/80 text-amber-400 hover:bg-slate-700" : "bg-white/80 text-amber-500 hover:bg-white"}`}
          title="Kedi Ayarları ve Görevler"
        >
          <Settings className="w-6 h-6" />
        </button>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 md:p-8">
          <div className="bg-white rounded-[2rem] w-full max-w-5xl shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 pointer-events-auto flex flex-col max-h-[90vh] overflow-hidden border border-slate-100">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-6">
                <h2 className="text-2xl font-extrabold text-slate-800 flex items-center gap-2">
                  <Cat className="w-7 h-7 text-amber-500" />
                  Kedi Dashboard
                </h2>
                
                {/* Tabs */}
                <div className="hidden md:flex bg-slate-200/50 p-1 rounded-xl">
                  <button 
                    onClick={() => setActiveTab('todo')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'todo' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <ListTodo className="w-4 h-4" /> Görevler
                  </button>
                  <button 
                    onClick={() => setActiveTab('cat')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'cat' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <Heart className="w-4 h-4" /> Görünüm
                  </button>
                  <button 
                    onClick={() => setActiveTab('settings')}
                    className={`px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                  >
                    <SlidersHorizontal className="w-4 h-4" /> Ayarlar
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 px-3 py-1.5 bg-amber-50 rounded-xl border border-amber-100">
                  <span className="text-xs font-bold text-amber-800">Aktif</span>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isCatActive}
                    onClick={() => setIsCatActive(!isCatActive)}
                    className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isCatActive ? 'bg-amber-500' : 'bg-slate-300'}`}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isCatActive ? 'translate-x-4' : 'translate-x-0'}`}
                    />
                  </button>
                </div>
                <button
                  onClick={() => setShowSettings(false)}
                  className="p-2 bg-slate-100 text-slate-400 rounded-full hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Mobile Tabs */}
            <div className="md:hidden flex bg-slate-50 border-b border-slate-100 p-2 overflow-x-auto">
              <button 
                onClick={() => setActiveTab('todo')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'todo' ? 'bg-white text-amber-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <ListTodo className="w-4 h-4" /> Görevler
              </button>
              <button 
                onClick={() => setActiveTab('cat')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'cat' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <Heart className="w-4 h-4" /> Görünüm
              </button>
              <button 
                onClick={() => setActiveTab('settings')}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${activeTab === 'settings' ? 'bg-white text-amber-500 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <SlidersHorizontal className="w-4 h-4" /> Ayarlar
              </button>
            </div>

            {/* Modal Body */}
            <div className="flex-1 overflow-y-auto p-8 bg-slate-50/30">
              
              {/* Tab 1: TODO */}
              {activeTab === 'todo' && (
                <div className="max-w-3xl mx-auto flex flex-col h-full animate-in fade-in duration-300">
                  <form onSubmit={addTodo} className="flex flex-col sm:flex-row gap-3 mb-6 bg-white p-4 rounded-2xl shadow-sm border border-slate-100 items-center">
                    <input
                      type="text"
                      value={newTodo}
                      onChange={(e) => setNewTodo(e.target.value)}
                      placeholder="Yeni görev ekle..."
                      className="flex-1 w-full sm:w-auto px-4 h-14 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 transition-colors text-slate-800 placeholder:text-slate-400"
                    />
                    
                    <div className="flex gap-3 w-full sm:w-[280px] shrink-0">
                      <CustomTimePicker value={newTodoTime} onChange={setNewTodoTime} />
                      
                      <button
                        type="submit"
                        className="flex-1 h-14 bg-amber-500 text-white rounded-xl font-bold hover:bg-amber-600 transition-colors cursor-pointer shadow-sm active:scale-95 flex items-center justify-center"
                      >
                        Ekle
                      </button>
                    </div>
                  </form>

                  <div className="flex-1 overflow-y-auto space-y-3 pr-2 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-slate-200 [&::-webkit-scrollbar-thumb]:rounded-full">
                    {todos.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <ListTodo className="w-16 h-16 mb-4 text-slate-300" />
                        <p className="text-xl font-bold text-slate-400">Henüz görev yok</p>
                        <p className="text-sm text-slate-400 mt-2">Yukarıdan yeni bir görev ekleyerek başlayın.</p>
                      </div>
                    ) : (
                      todos.map(todo => (
                        <div 
                          key={todo.id} 
                          className={`flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300 group ${todo.completed ? 'bg-slate-50 border-slate-200 opacity-60' : 'bg-white border-slate-200 shadow-sm hover:border-amber-500/50 hover:shadow-md'}`}
                        >
                          <button
                            onClick={() => toggleTodo(todo.id)}
                            className={`shrink-0 flex items-center justify-center transition-colors cursor-pointer ${todo.completed ? 'text-emerald-500' : 'text-slate-300 hover:text-amber-500'}`}
                          >
                            {todo.completed ? <CheckCircle2 className="w-8 h-8" /> : <Circle className="w-8 h-8" />}
                          </button>
                          <div className="flex-1 flex flex-col">
                            <span className={`font-bold text-lg transition-all ${todo.completed ? 'line-through text-slate-500' : 'text-slate-800'}`}>
                              {todo.text}
                            </span>
                            {todo.time && (
                              <span className={`text-sm flex items-center gap-1.5 mt-0.5 font-medium ${todo.completed ? 'text-slate-400' : 'text-amber-600'}`}>
                                <Clock className="w-3.5 h-3.5" /> {todo.time}
                              </span>
                            )}
                          </div>
                          <button
                            onClick={() => deleteTodo(todo.id)}
                            className="p-3 rounded-xl text-slate-300 hover:bg-red-50 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: CAT STATE & CUSTOMIZATION */}
              {activeTab === 'cat' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in duration-300">
                  {/* Tamagotchi Panel */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full -translate-y-20 translate-x-20 pointer-events-none"></div>
                    <div className="flex items-center justify-between mb-8">
                      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800">
                        <Heart className="w-6 h-6 text-amber-500" /> Kedi İhtiyaçları
                      </h3>
                      <button
                        type="button"
                        role="switch"
                        aria-checked={tamagotchiEnabled}
                        onClick={() => setTamagotchiEnabled(!tamagotchiEnabled)}
                        className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${tamagotchiEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}
                      >
                        <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${tamagotchiEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                      </button>
                    </div>

                    <div className={`space-y-6 transition-opacity duration-300 ${!tamagotchiEnabled ? 'opacity-40 pointer-events-none' : 'opacity-100'}`}>
                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="flex items-center gap-2 text-slate-700">
                            <Utensils className="w-4 h-4 text-amber-500" /> Tokluk
                          </span>
                          <span className={hunger < 30 ? "text-red-500" : "text-slate-500"}>{Math.round(hunger)}%</span>
                        </div>
                        <div className="h-4 w-full rounded-full overflow-hidden bg-slate-100">
                          <div className={`h-full transition-all duration-1000 ${hunger < 30 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${hunger}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleAction("FEED")}
                          className={`mt-1 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${hunger === 100 ? "bg-slate-50 text-slate-300" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                          disabled={hunger === 100}
                        >Yemek Ver</button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="flex items-center gap-2 text-slate-700">
                            <Zap className="w-4 h-4 text-amber-500" /> Enerji
                          </span>
                          <span className={energy < 30 ? "text-red-500" : "text-slate-500"}>{Math.round(energy)}%</span>
                        </div>
                        <div className="h-4 w-full rounded-full overflow-hidden bg-slate-100">
                          <div className={`h-full transition-all duration-1000 ${energy < 30 ? "bg-red-500" : "bg-amber-500"}`} style={{ width: `${energy}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleAction("SLEEP")}
                          className={`mt-1 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${energy === 100 ? "bg-slate-50 text-slate-300" : "bg-amber-100 text-amber-700 hover:bg-amber-200"}`}
                          disabled={energy === 100}
                        >Uyut</button>
                      </div>

                      <div className="flex flex-col gap-2">
                        <div className="flex justify-between items-center text-sm font-bold">
                          <span className="flex items-center gap-2 text-slate-700">
                            <Gamepad2 className="w-4 h-4 text-emerald-500" /> Mutluluk
                          </span>
                          <span className={happiness < 30 ? "text-red-500" : "text-slate-500"}>{Math.round(happiness)}%</span>
                        </div>
                        <div className="h-4 w-full rounded-full overflow-hidden bg-slate-100">
                          <div className={`h-full transition-all duration-1000 ${happiness < 30 ? "bg-red-500" : "bg-emerald-500"}`} style={{ width: `${happiness}%` }}></div>
                        </div>
                        <button
                          onClick={() => handleAction("PLAY")}
                          className={`mt-1 py-2 rounded-xl text-sm font-bold transition-colors cursor-pointer ${happiness === 100 ? "bg-slate-50 text-slate-300" : "bg-emerald-100 text-emerald-700 hover:bg-emerald-200"}`}
                          disabled={happiness === 100}
                        >Oyun Oyna</button>
                      </div>
                    </div>
                  </div>

                  {/* Visual Customization Panel */}
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col gap-8">
                    
                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 mb-6">
                        <Cat className="w-6 h-6 text-amber-500" /> Kedi Tipi
                      </h3>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: 'default', name: 'Klasik' },
                          { id: 'garfield', name: 'Şişman (Garfield)' },
                          { id: 'cute', name: 'Minnoş' },
                        ].map(type => (
                          <button
                            key={type.id}
                            onClick={() => setCatType(type.id)}
                            className={`flex flex-col items-center justify-center p-3 rounded-xl border-2 transition-all cursor-pointer ${catType === type.id ? 'border-amber-500 bg-amber-50/50 scale-105 text-amber-700' : 'border-slate-100 hover:border-slate-200 text-slate-600'}`}
                          >
                            <span className="font-bold">{type.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-xl font-bold flex items-center gap-2 text-slate-800 mb-6">
                        <Palette className="w-6 h-6 text-amber-500" /> Renk Seçimi
                      </h3>
                      <div className="grid grid-cols-5 gap-3">
                        {[
                          { id: 'orange', name: 'Sarı', color: '#F48B29', bg: 'bg-orange-400' },
                          { id: 'calico', name: 'Benekli', color: '#E69C30', bg: 'bg-amber-600' },
                          { id: 'gray', name: 'Gri', color: '#8A94A0', bg: 'bg-slate-400' },
                          { id: 'black', name: 'Siyah', color: '#2A2A2A', bg: 'bg-slate-800' },
                          { id: 'white', name: 'Beyaz', color: '#F0F0F0', bg: 'bg-slate-200' },
                        ].map(theme => (
                          <button
                            key={theme.id}
                            onClick={() => setColorTheme(theme.id)}
                            className={`flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all cursor-pointer ${colorTheme === theme.id ? 'border-amber-500 bg-amber-50/50 scale-105' : 'border-slate-100 hover:border-slate-200'}`}
                            title={theme.name}
                          >
                            <div className={`w-10 h-10 rounded-full shadow-inner ${theme.bg}`} style={{ backgroundColor: theme.color }}></div>
                            <span className="text-[11px] font-bold text-slate-600">{theme.name}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    
                  </div>
                </div>
              )}

              {/* Tab 3: SETTINGS */}
              {activeTab === 'settings' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-in fade-in duration-300">
                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xl font-bold text-slate-800 border-b border-slate-100 pb-4">Genel Ayarlar</h3>
                    
                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">Kedi Büyüklüğü</label>
                        <span className="text-sm font-bold text-amber-500">{catScale.toFixed(1)}x</span>
                      </div>
                      <input
                        type="range"
                        min="0.5" max="2.5" step="0.1"
                        value={catScale}
                        onChange={(e) => setCatScale(parseFloat(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between mb-2">
                        <label className="text-sm font-bold text-slate-700">Maksimum Hız</label>
                        <span className="text-sm font-bold text-amber-500">{catSpeed}</span>
                      </div>
                      <input
                        type="range"
                        min="300" max="2500" step="100"
                        value={catSpeed}
                        onChange={(e) => setCatSpeed(parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-amber-500"
                      />
                    </div>

                    <div className="pt-4 flex flex-col gap-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-bold text-slate-700 block">El Sallama (Oyun)</label>
                          <p className="text-xs text-slate-500">Fare yanına geldiğinde oynar</p>
                        </div>
                        <button
                          type="button" role="switch" aria-checked={swattingEnabled}
                          onClick={() => setSwattingEnabled(!swattingEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${swattingEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${swattingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <label className="text-sm font-bold text-slate-700 block">Serbest Dolaşma</label>
                          <p className="text-xs text-slate-500">Uzun süre boşta kalınca gezinir</p>
                        </div>
                        <button
                          type="button" role="switch" aria-checked={roamingEnabled}
                          onClick={() => setRoamingEnabled(!roamingEnabled)}
                          className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${roamingEnabled ? 'bg-amber-500' : 'bg-slate-300'}`}
                        >
                          <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${roamingEnabled ? 'translate-x-5' : 'translate-x-0'}`} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                      <h3 className="text-xl font-bold text-slate-800">Sözler ve Süreler</h3>
                      <button onClick={addPhrase} className="px-3 py-1.5 bg-amber-50 text-amber-600 rounded-lg text-sm flex items-center gap-1 font-bold hover:bg-amber-100 transition-colors cursor-pointer">
                        <Plus className="w-4 h-4" /> Ekle
                      </button>
                    </div>
                    
                    <div className="space-y-3 flex-1 overflow-y-auto max-h-[300px] pr-2">
                      {phrases.map((phrase) => (
                        <div key={phrase.id} className="flex gap-2 items-center bg-slate-50 p-2 rounded-xl border border-slate-100">
                          <input
                            type="text"
                            value={phrase.text}
                            onChange={e => updatePhrase(phrase.id, 'text', e.target.value)}
                            className="flex-1 bg-white p-2.5 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-amber-500 rounded-lg border border-slate-200"
                            placeholder="Söz"
                          />
                          <div className="flex items-center gap-1 bg-white rounded-lg border border-slate-200 px-2 py-1">
                            <input
                              type="number"
                              value={phrase.timeSec}
                              onChange={e => updatePhrase(phrase.id, 'timeSec', parseInt(e.target.value) || 0)}
                              className="w-10 bg-transparent text-sm font-bold focus:outline-none text-center"
                              min="1"
                            />
                            <span className="text-xs font-bold text-slate-400">sn</span>
                          </div>
                          <button
                            onClick={() => removePhrase(phrase.id)}
                            className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Widget Layer */}
      <div className="pointer-events-none absolute inset-0 z-10 overflow-hidden">
        <CatWidget
          isActive={isCatActive}
          setIsActive={setIsCatActive}
          scale={catScale}
          speed={catSpeed}
          phrases={widgetPhrases}
          swattingEnabled={swattingEnabled}
          roamingEnabled={roamingEnabled}
          isDarkMode={isDarkMode}
          tamagotchiEnabled={tamagotchiEnabled}
          hunger={hunger}
          energy={energy}
          happiness={happiness}
          actionTrigger={actionTrigger}
          onInteract={handleCatInteract}
          colorTheme={colorTheme}
          accessory={accessory}
          todoWarning={todoWarning}
          catType={catType}
        />
      </div>
    </div>
  );
}
