'use client';

import { useState, useEffect, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Plus, X, Shirt, Check, Pencil, Trash2 } from 'lucide-react';
import { fetchSavedOutfits } from '@/lib/today-outfit-api';
import { fetchWardrobeItems } from '@/lib/wardrobe-api';
import type { WardrobeItem } from '@/lib/wardrobe-types';

type SavedOutfit = Awaited<ReturnType<typeof fetchSavedOutfits>>[number];

interface PlanSlot { itemId: string; imageUrl?: string; description: string; }
interface DayPlan { outfitId: string; outfitName: string; worn: boolean; slots?: Record<string, PlanSlot | null>; }

const WEEKDAYS = ['一','二','三','四','五','六','日'];
// 垂直展示顺序
const DISPLAY_ORDER = ['hat','top','bottom','outerwear','shoes','bag','accessory'] as const;
const DISPLAY_LABELS: Record<string, string> = { hat:'帽子', top:'上衣', bottom:'裤子', outerwear:'外套', shoes:'鞋', bag:'背包', accessory:'配饰' };
const DISPLAY_EMOJI: Record<string, string> = { hat:'🎩', top:'👕', bottom:'👖', outerwear:'🧥', shoes:'👟', bag:'🎒', accessory:'💍' };
// 用于品类筛选器
const CAT_OPTIONS = [
  { key:'hat', cat:'hat', label:'帽子' }, { key:'top', cat:'top', label:'上衣' },
  { key:'bottom', cat:'bottom', label:'裤子' }, { key:'outerwear', cat:'outerwear', label:'外套' },
  { key:'shoes', cat:'shoes', label:'鞋' }, { key:'bag', cat:'bag', label:'包' },
  { key:'accessory', cat:'accessory', label:'配饰' },
];

function getWeekStart(date: Date): Date { const d=new Date(date); const day=d.getDay(); d.setDate(d.getDate()+(day===0?-6:1-day)); d.setHours(0,0,0,0); return d; }
function formatDateStr(d: Date): string { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }

export default function PlanPage() {
  const [weekStart, setWeekStart] = useState<Date>(()=>getWeekStart(new Date()));
  const [savedOutfits, setSavedOutfits] = useState<SavedOutfit[]>([]);
  const [plans, setPlans] = useState<Record<string,DayPlan>>({});
  const [pickerDay, setPickerDay] = useState<string|null>(null);
  const [loading, setLoading] = useState(true);
  // 衣橱物品（用于编辑时选择单品）
  const [wardrobeItems, setWardrobeItems] = useState<WardrobeItem[]>([]);
  const [itemPhotoMap, setItemPhotoMap] = useState<Map<string,string>>(new Map());
  // 编辑状态
  const [editDay, setEditDay] = useState<string|null>(null);     // 当前编辑的日期
  const [editSlot, setEditSlot] = useState<string|null>(null);   // 当前编辑的 slot key
  const [pickerItems, setPickerItems] = useState<WardrobeItem[]>([]);

  const loadAll = useCallback(async () => {
    try { setSavedOutfits(await fetchSavedOutfits()); } catch {}
    try {
      const items = await fetchWardrobeItems();
      setWardrobeItems(items);
      const m = new Map<string,string>(); for (const i of items) { if (i.imageUrls?.[0]) m.set(i.id,i.imageUrls[0]); }
      setItemPhotoMap(m);
    } catch {}
  }, []);

  useEffect(() => {
    setLoading(true); loadAll().finally(()=>setLoading(false));
    try { const s=localStorage.getItem('stylemate.plan'); if(s){ const p=JSON.parse(s); if(p&&typeof p==='object'&&!Array.isArray(p)) setPlans(p as Record<string,DayPlan>); } } catch {}
  }, [loadAll]);

  const savePlans = useCallback((u: Record<string,DayPlan>) => { setPlans(u); localStorage.setItem('stylemate.plan',JSON.stringify(u)); }, []);

  const weekDays = useMemo(()=>Array.from({length:7},(_,i)=>{const d=new Date(weekStart);d.setDate(d.getDate()+i);return d;}),[weekStart]);
  const today = new Date(); today.setHours(0,0,0,0);
  const prevWeek=()=>{const d=new Date(weekStart);d.setDate(d.getDate()-7);setWeekStart(d);};
  const nextWeek=()=>{const d=new Date(weekStart);d.setDate(d.getDate()+7);setWeekStart(d);};
  const weekEnd=new Date(weekStart);weekEnd.setDate(weekEnd.getDate()+6);
  const monthLabel = weekStart.getMonth()===weekEnd.getMonth()?`${weekStart.getFullYear()}年${weekStart.getMonth()+1}月`:`${weekStart.getFullYear()}年${weekStart.getMonth()+1}-${weekEnd.getMonth()+1}月`;

  const scheduleOutfit = (dateStr: string, outfit: SavedOutfit) => {
    // 从 outfit items 构建 slot 信息
    const slots: Record<string, PlanSlot|null> = {};
    for (const s of DISPLAY_ORDER) slots[s] = null;
    if (outfit.items) {
      for (const it of outfit.items) {
        // 通过 position 推断 slot（简化逻辑：根据品类映射）
        // 实际上需要更完整的 item 信息，这里给基础版
      }
    }
    savePlans({...plans,[dateStr]:{outfitId:outfit.id,outfitName:outfit.title||outfit.name||'未命名',worn:plans[dateStr]?.worn??false,slots}});
    setPickerDay(null);
  };

  const toggleWorn = (dateStr: string) => {
    if (!plans[dateStr]) return;
    savePlans({...plans,[dateStr]:{...plans[dateStr],worn:!plans[dateStr].worn}});
  };

  const removePlan = (dateStr: string) => { const u={...plans}; delete u[dateStr]; savePlans(u); };

  // 编辑：打开单品选择器
  const openEditSlot = (day: string, slotKey: string) => {
    setEditDay(day); setEditSlot(slotKey);
    const opt = CAT_OPTIONS.find(c=>c.key===slotKey);
    if (opt) { setPickerItems(wardrobeItems.filter(i=>i.category===opt.cat)); }
    else { setPickerItems(wardrobeItems); }
  };

  // 确认编辑：放入单品
  const confirmEditSlot = (item: WardrobeItem) => {
    if (!editDay || !editSlot) return;
    const plan = plans[editDay] ?? { outfitId:'', outfitName:'', worn:false, slots:{} };
    const slots = { ...(plan.slots ?? {}) };
    slots[editSlot] = { itemId: item.id, imageUrl: item.imageUrls?.[0], description: item.subCategory || item.category };
    savePlans({...plans,[editDay]:{...plan,slots}});
    setEditSlot(null); setEditDay(null); setPickerItems([]);
  };

  // 移除单品
  const removeSlot = (dateStr: string, slotKey: string) => {
    const plan = plans[dateStr]; if (!plan?.slots) return;
    const slots = {...plan.slots}; slots[slotKey] = null;
    savePlans({...plans,[dateStr]:{...plan,slots}});
  };

  return (
    <main className="min-h-screen bg-[#f4f1ea] pb-24">
      <div className="sticky top-0 z-30 border-b border-ink-900/10 bg-[#f4f1ea]/85 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-10">
          <Link href="/" className="text-sm text-ink-500 hover:text-ink-900">← 返回首页</Link>
          <p className="font-display text-lg tracking-wide">STYLEMATE</p>
          <p className="text-sm text-ink-900 font-medium">计划</p>
        </div>
      </div>

      <section className="mx-auto max-w-7xl px-4 pt-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <button type="button" onClick={prevWeek} aria-label="上一周" className="flex items-center justify-center size-10 rounded-full border border-ink-900/10 bg-white hover:border-ink-900/30"><ChevronLeft size={18} className="text-ink-600"/></button>
          <div className="text-center"><h1 className="text-xs tracking-[0.2em] text-ink-400 uppercase mb-1">{monthLabel}</h1><p className="text-sm text-ink-500">{formatDateStr(weekStart)} — {formatDateStr(weekEnd)}</p></div>
          <button type="button" onClick={nextWeek} aria-label="下一周" className="flex items-center justify-center size-10 rounded-full border border-ink-900/10 bg-white hover:border-ink-900/30"><ChevronRight size={18} className="text-ink-600"/></button>
        </div>

        {loading ? (<div className="text-center py-20 text-ink-400">加载中…</div>) : (
          <div className="grid grid-cols-7 gap-2 lg:gap-3">
            {weekDays.map((day,idx)=>{
              const dateStr=formatDateStr(day); const isToday=day.getTime()===today.getTime(); const plan=plans[dateStr];
              const hasDetailedSlots = plan?.slots && Object.values(plan.slots).some(s=>s);
              return (
                <div key={dateStr} className={`rounded-xl border min-h-[180px] lg:min-h-[260px] flex flex-col ${isToday?'border-ink-900/30 bg-white shadow-sm':'border-ink-900/10 bg-white/60'}`}>
                  <div className={`px-2 py-2 border-b text-center ${isToday?'bg-ink-900 text-creme-100':'bg-ink-50/50 border-ink-900/5'}`}>
                    <p className="text-[10px] lg:text-xs opacity-70">周{WEEKDAYS[idx]}</p>
                    <p className={`text-lg lg:text-xl font-bold ${isToday?'':'text-ink-900'}`}>{day.getDate()}</p>
                  </div>
                  <div className="flex-1 p-1.5 lg:p-2 space-y-1 overflow-y-auto">
                    {plan ? (
                      <div className="space-y-1">
                        {/* 如果有详细 slot → 垂直展示照片 */}
                        {hasDetailedSlots ? (
                          <div className="space-y-1">
                            {DISPLAY_ORDER.map(slotKey=>{
                              const s=plan.slots?.[slotKey];
                              if (!s) return null; // 空槽不展示
                              const photoUrl = s.imageUrl || (s.itemId ? itemPhotoMap.get(s.itemId) : undefined);
                              return (
                                <div key={slotKey} className="flex items-center gap-1.5 bg-white rounded-lg p-1 group">
                                  <span className="text-xs shrink-0">{DISPLAY_EMOJI[slotKey]}</span>
                                  {photoUrl ? <img src={photoUrl} alt="" className="size-8 object-cover rounded"/>:<Shirt size={12} className="text-gray-300 shrink-0"/>}
                                  <span className="text-[9px] lg:text-[10px] text-ink-700 truncate flex-1">{s.description}</span>
                                  <button type="button" onClick={()=>removeSlot(dateStr,slotKey)} aria-label="移除" className="shrink-0 opacity-0 group-hover:opacity-100 text-ink-300 hover:text-red-500"><X size={10}/></button>
                                </div>
                              );
                            })}
                            {/* 添加/编辑按钮 */}
                            <div className="flex gap-1">
                              {DISPLAY_ORDER.filter(sk=>!plan.slots?.[sk]).map(sk=>(
                                <button key={sk} type="button" onClick={()=>openEditSlot(dateStr,sk)} className="text-[9px] text-ink-300 hover:text-ink-500 bg-ink-50 rounded px-1.5 py-0.5">+{DISPLAY_LABELS[sk]}</button>
                              ))}
                            </div>
                          </div>
                        ) : (
                          /* 无详细 slot → 显示名称 */
                          <button type="button" onClick={()=>openEditSlot(dateStr,'top')} className="w-full text-left bg-ink-100/60 hover:bg-ink-100 rounded-lg p-1.5 transition-colors">
                            <span className="text-[10px] lg:text-xs text-ink-700 truncate block">{plan.outfitName}</span>
                          </button>
                        )}
                        <div className="flex items-center gap-1">
                          <button type="button" onClick={()=>removePlan(dateStr)} aria-label="删除" className="shrink-0 text-ink-300 hover:text-red-500"><Trash2 size={12}/></button>
                          <button type="button" onClick={()=>toggleWorn(dateStr)} className={`flex-1 text-[10px] lg:text-xs py-0.5 rounded-full transition-colors ${plan.worn?'bg-green-100 text-green-700 font-medium':'text-ink-300 hover:text-ink-500'}`}>{plan.worn?'✓已穿':'标记已穿'}</button>
                        </div>
                      </div>
                    ) : (
                      <button type="button" onClick={()=>setPickerDay(dateStr)} className="w-full flex items-center justify-center gap-0.5 text-[10px] lg:text-xs text-ink-300 hover:text-ink-500 py-2"><Plus size={12}/>添加</button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* 无穿搭方案提示 */}
        {savedOutfits.length===0&&!loading&&(
          <div className="mt-8 text-center py-12 border border-dashed border-ink-900/10 rounded-2xl">
            <p className="text-sm text-ink-500 mb-3">还没有保存的穿搭方案</p>
            <Link href="/wardrobe" className="inline-flex items-center gap-1.5 bg-ink-900 text-creme-100 px-5 py-2.5 text-sm rounded-full hover:bg-ink-800">去衣橱生成穿搭</Link>
          </div>
        )}

        {/* 选择穿搭方案弹窗 */}
        {pickerDay&&(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[60vh] overflow-y-auto pb-6">
              <div className="sticky top-0 bg-white border-b border-ink-900/10 px-5 py-3 flex items-center justify-between"><h3 className="font-semibold text-ink-900">选择穿搭 — {pickerDay}</h3><button type="button" onClick={()=>setPickerDay(null)} aria-label="关闭" className="text-ink-400 hover:text-ink-600"><X size={20}/></button></div>
              <div className="p-3 space-y-2">
                {savedOutfits.length===0?<p className="text-sm text-ink-400 text-center py-8">暂无穿搭方案</p>:savedOutfits.map(o=>(
                  <button key={o.id} type="button" onClick={()=>scheduleOutfit(pickerDay,o)} className="w-full text-left p-3 rounded-xl border border-ink-900/10 hover:border-ink-900/30"><p className="font-medium text-sm text-ink-900">{o.title||o.name||'未命名'}</p><div className="flex items-center gap-2 mt-1">{o.occasion?.map(oc=><span key={oc} className="text-[10px] text-ink-400 bg-ink-50 px-1.5 py-0.5 rounded">{oc}</span>)}{o.score&&<span className="text-[10px] text-ink-400">评分{o.score}</span>}</div></button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 编辑单品弹窗 */}
        {editSlot&&editDay&&(
          <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-t-2xl sm:rounded-2xl w-full sm:max-w-md max-h-[60vh] overflow-y-auto pb-6">
              <div className="sticky top-0 bg-white border-b border-ink-900/10 px-5 py-3 flex items-center justify-between">
                <h3 className="font-semibold text-ink-900">选择{DISPLAY_LABELS[editSlot]}</h3>
                <button type="button" onClick={()=>{setEditSlot(null);setEditDay(null);}} aria-label="关闭" className="text-ink-400 hover:text-ink-600"><X size={20}/></button>
              </div>
              <div className="p-3 space-y-2">
                {pickerItems.length===0?<p className="text-sm text-ink-400 text-center py-8">衣橱中没有此类单品</p>:pickerItems.map(item=>(
                  <button key={item.id} type="button" onClick={()=>confirmEditSlot(item)} className="w-full flex items-center gap-3 p-2.5 rounded-xl border border-ink-900/10 hover:border-ink-900/30 text-left">
                    {item.imageUrls?.[0]?<img src={item.imageUrls[0]} alt="" className="size-10 object-cover rounded"/>:<Shirt size={16} className="text-gray-300"/>}
                    <div className="flex-1 min-w-0"><p className="text-sm font-medium text-ink-900 truncate">{item.subCategory||item.category}</p><p className="text-[10px] text-ink-400">{item.color}{item.material?'·'+item.material:''}</p></div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
