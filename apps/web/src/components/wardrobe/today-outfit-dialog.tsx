'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  Loader2, X, Sparkles, Cloud, Check, AlertTriangle,
  Shirt, Calendar, Star, ThumbsUp, ThumbsDown, MessageSquare, ChevronDown, ChevronUp, ShoppingBag,
} from 'lucide-react';
import { generateTodayOutfit, saveOutfit } from '@/lib/today-outfit-api';
import { fetchWardrobeItems } from '@/lib/wardrobe-api';
import { recordFeedback } from '@/lib/memory-api';
import type { WardrobeItem } from '@/lib/wardrobe-types';
import {
  TodayOutfitResponse, OutfitPlan,
  OCCASION_OPTIONS, STYLE_GOAL_OPTIONS, PLAN_TYPE_LABELS, PLAN_TYPE_EMOJI,
} from '@/lib/today-outfit-types';

interface Props { open: boolean; onClose: () => void; }

const CONSTRAINT_PRESETS = [
  '不想穿裙子', '不想穿高跟鞋', '今天要走很多路',
  '不想太暴露', '不想穿深色', '需要方便穿脱',
];

const POSITIVE_REASONS = ['颜色搭配好', '风格适合我', '显瘦显高', '适合今天天气', '舒适度高', '单品选择好'];
const NEGATIVE_REASONS = ['不喜欢颜色', '太正式', '太随意', '不适合我的体型', '不符合场合', '单品不喜欢', '风格不匹配'];

// PlanCard 7 slot 顺序
const SLOT_ORDER = ['hat', 'top', 'bottom', 'outerwear', 'shoes', 'bag', 'accessory'] as const;
const SLOT_LABELS: Record<string, string> = { hat: '帽子', top: '上衣', bottom: '下装', outerwear: '外套', shoes: '鞋子', bag: '包包', accessory: '配饰' };

function fmtDate(d: Date) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
function todayStr() { return fmtDate(new Date()); }
function tomorrowStr() { const d = new Date(); d.setDate(d.getDate()+1); return fmtDate(d); }
function dayAfterStr() { const d = new Date(); d.setDate(d.getDate()+2); return fmtDate(d); }

interface FeedbackState {
  expanded: boolean; rating: number; reaction: 'like'|'dislike'|''; reasons: string[]; comment: string; submitted: boolean; submitting: boolean;
}
const DEF_FB: FeedbackState = { expanded:false, rating:0, reaction:'', reasons:[], comment:'', submitted:false, submitting:false };

export default function TodayOutfitDialog({ open, onClose }: Props) {
  const [city, setCity] = useState('');
  const [occasion, setOccasion] = useState('commute');
  const [styleGoal, setStyleGoal] = useState('comfortable');
  const [constraints, setConstraints] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TodayOutfitResponse|null>(null);
  const [error, setError] = useState<string|null>(null);
  const [itemPhotoMap, setItemPhotoMap] = useState<Map<string,string>>(new Map());
  const [savingPlan, setSavingPlan] = useState<OutfitPlan|null>(null);
  const [saveDate, setSaveDate] = useState(todayStr());
  const [saving, setSaving] = useState(false);
  const [savedPlans, setSavedPlans] = useState<Set<string>>(new Set());
  const [feedbacks, setFeedbacks] = useState<Record<string,FeedbackState>>({});

  useEffect(() => {
    if (open) { fetchWardrobeItems().then(items => {
      const m = new Map<string,string>(); for (const i of items) { if (i.imageUrls?.[0]) m.set(i.id, i.imageUrls[0]); } setItemPhotoMap(m);
    }).catch(()=>{}); }
  }, [open]);

  const handleGenerate = async () => {
    if (!city.trim()) { setError('请输入城市名'); return; }
    setLoading(true); setError(null); setResult(null); setFeedbacks({}); setSavedPlans(new Set());
    try { setResult(await generateTodayOutfit({ city: city.trim(), occasion, styleGoal, constraints })); }
    catch (err) { setError(err instanceof Error ? err.message : '生成失败'); }
    finally { setLoading(false); }
  };

  const startSave = (plan: OutfitPlan) => { setSavingPlan(plan); setSaveDate(todayStr()); };

  const confirmSave = async () => {
    if (!result || !savingPlan) return;
    setSaving(true);
    try {
      const saved = await saveOutfit({ plan: savingPlan, weather: result.weather, occasion, styleGoal });
      for (const slot of SLOT_ORDER) {
        const item = (savingPlan as any)[slot] as { itemId?: string } | null;
      }
      // 构建含 slot 详情 + 照片的 plan 数据
      const slots: Record<string, { itemId: string; imageUrl?: string; description: string } | null> = {};
      for (const s of SLOT_ORDER) {
        const item = (savingPlan as any)[s] as { itemId: string; description: string } | null;
        slots[s] = item ? { itemId: item.itemId, imageUrl: item.itemId ? itemPhotoMap.get(item.itemId) : undefined, description: item.description } : null;
      }
      try {
        const raw = localStorage.getItem('stylemate.plan');
        const plans = raw ? JSON.parse(raw) : {};
        if (plans && typeof plans === 'object' && !Array.isArray(plans)) {
          plans[saveDate] = { outfitId: saved.id, outfitName: savingPlan.title, worn: false, slots };
          localStorage.setItem('stylemate.plan', JSON.stringify(plans));
        } else {
          localStorage.setItem('stylemate.plan', JSON.stringify({ [saveDate]: { outfitId: saved.id, outfitName: savingPlan.title, worn: false, slots } }));
        }
      } catch {}
      setSavedPlans(prev => new Set(prev).add(savingPlan.type));
      setSavingPlan(null);
    } catch (err) { setError(err instanceof Error ? err.message : '保存失败'); }
    finally { setSaving(false); }
  };

  const updateFeedback = (pt: string, p: Partial<FeedbackState>) => setFeedbacks(prev => ({ ...prev, [pt]: { ...(prev[pt]??DEF_FB), ...p } }));
  const submitFeedback = async (plan: OutfitPlan) => {
    const fb = feedbacks[plan.type]??DEF_FB; if (fb.submitted||fb.submitting) return;
    updateFeedback(plan.type, { submitting: true });
    try {
      const allReasons = [...fb.reasons]; if (fb.comment.trim()) allReasons.push(fb.comment.trim());
      await recordFeedback({ feedbackType: fb.reaction==='dislike'?'dislike':'like', reason: allReasons.join('；'), context: { planTitle:plan.title, planType:plan.type, planScore:plan.score, occasion, city, rating:fb.rating, weather:result?.weather, colors:[], styles:[plan.type] } });
      updateFeedback(plan.type, { submitted:true, submitting:false });
    } catch (err) { setError(err instanceof Error?err.message:'反馈失败'); updateFeedback(plan.type,{submitting:false}); }
  };

  const toggleConstraint = (c: string) => setConstraints(p => p.includes(c)?p.filter(x=>x!==c):[...p,c]);
  const handleClose = () => { setResult(null); setError(null); setSavedPlans(new Set()); setFeedbacks({}); setSavingPlan(null); onClose(); };
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-gray-100 bg-white px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900"><Sparkles size={20} className="text-ink-600"/>今天穿什么</h2>
          <button type="button" onClick={handleClose} className="text-gray-400 hover:text-gray-600"><X size={20}/></button>
        </div>
        <div className="px-6 py-5">
          {!result && (
            <div className="space-y-5">
              <div><label className="mb-1.5 block text-sm font-medium text-gray-700">城市</label><input value={city} onChange={e=>setCity(e.target.value)} placeholder="如：北京、上海、深圳" className="w-full rounded-lg border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-ink-400"/></div>
              <div><label className="mb-2 block text-sm font-medium text-gray-700">今天场合</label><div className="flex flex-wrap gap-2">{OCCASION_OPTIONS.map(o=>(<button key={o.value} type="button" onClick={()=>setOccasion(o.value)} className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${occasion===o.value?'bg-ink-900 text-creme-100':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{o.label}</button>))}</div></div>
              <div><label className="mb-2 block text-sm font-medium text-gray-700">风格目标</label><div className="flex flex-wrap gap-2">{STYLE_GOAL_OPTIONS.map(o=>(<button key={o.value} type="button" onClick={()=>setStyleGoal(o.value)} className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${styleGoal===o.value?'bg-ink-900 text-creme-100':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{o.label}</button>))}</div></div>
              <div><label className="mb-2 block text-sm font-medium text-gray-700">限制条件（可选）</label><div className="flex flex-wrap gap-2">{CONSTRAINT_PRESETS.map(c=>(<button key={c} type="button" onClick={()=>toggleConstraint(c)} className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${constraints.includes(c)?'bg-amber-100 text-amber-700':'bg-gray-50 text-gray-600 hover:bg-gray-100'}`}>{constraints.includes(c)?'✓ ':''}{c}</button>))}</div></div>
              {error&&<p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
              <button type="button" onClick={handleGenerate} disabled={loading} className="flex w-full items-center justify-center gap-2 rounded-full bg-ink-900 py-3 font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:opacity-60">{loading?<><Loader2 size={18} className="animate-spin"/>AI 正在搭配中…</>:<><Sparkles size={18}/>生成今日穿搭</>}</button>
            </div>
          )}
          {result && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-xl bg-blue-50 px-4 py-3"><Cloud size={20} className="text-blue-500"/><div className="flex-1"><span className="text-sm font-medium text-gray-700">{result.weather.city}</span><span className="ml-2 text-sm text-gray-600">{result.weather.condition} {result.weather.temperature}°C（体感{result.weather.apparentTemperature}°C）</span></div>{result.weather.isRaining&&<span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-600">🌧️有雨</span>}</div>
              {result.isStarter && (
                <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <ShoppingBag size={18} className="mt-0.5 shrink-0 text-amber-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-amber-800">衣橱还是空的 · 起步方案</p>
                    <p className="mt-0.5 text-xs leading-5 text-amber-700">
                      {result.starterMessage ?? '以下单品均为购买建议，照着买就能穿。'}
                    </p>
                    <Link href="/wardrobe" className="mt-2 inline-flex items-center gap-1 rounded-full bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
                      去衣橱拍照添加单品 →
                    </Link>
                  </div>
                </div>
              )}
              {result.plans.map(plan=>(<PlanCard key={plan.type} plan={plan} photoMap={itemPhotoMap} saved={savedPlans.has(plan.type)} isStarter={!!result.isStarter} feedback={feedbacks[plan.type]??DEF_FB} onSave={()=>startSave(plan)} onUpdateFeedback={p=>updateFeedback(plan.type,p)} onSubmitFeedback={()=>submitFeedback(plan)}/>))}
              <button type="button" onClick={()=>setResult(null)} className="w-full rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400">重新选择条件</button>
              {error&&<p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>}
            </div>
          )}
        </div>
      </div>
      {savingPlan&&(
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6 shadow-2xl">
            <h3 className="font-semibold text-ink-900 mb-4">选择穿搭日期</h3><p className="text-sm text-ink-500 mb-4">将「{savingPlan.title}」安排到哪一天？</p>
            <div className="flex gap-2 mb-4">{[{label:'今天',val:todayStr()},{label:'明天',val:tomorrowStr()},{label:'后天',val:dayAfterStr()}].map(d=>(<button key={d.val} type="button" onClick={()=>setSaveDate(d.val)} className={`flex-1 rounded-full py-2 text-xs font-medium transition-colors ${saveDate===d.val?'bg-ink-900 text-creme-100':'border border-ink-900/10 text-ink-600 hover:border-ink-900/30'}`}>{d.label}<br/><span className="opacity-60 text-[10px]">{d.val}</span></button>))}</div>
            <div className="mb-5"><label className="block text-xs text-ink-400 mb-1">自定义日期</label><input type="date" value={saveDate} onChange={e=>setSaveDate(e.target.value)} className="w-full rounded-lg border border-ink-900/10 px-3 py-2 text-sm outline-none focus:border-ink-900/30"/></div>
            <div className="flex gap-3"><button type="button" onClick={()=>setSavingPlan(null)} className="flex-1 rounded-full border border-gray-300 py-2.5 text-sm text-gray-600 hover:border-gray-400">取消</button><button type="button" onClick={confirmSave} disabled={saving} className="flex-1 rounded-full bg-ink-900 py-2.5 text-sm font-medium text-creme-100 hover:bg-ink-700 disabled:opacity-60 flex items-center justify-center gap-1.5">{saving?<Loader2 size={16} className="animate-spin"/>:<Check size={16}/>}{saving?'保存中…':'确认保存'}</button></div>
          </div>
        </div>
      )}
    </div>
  );
}

// ===================================================================
function PlanCard({ plan, photoMap, saved, isStarter, feedback, onSave, onUpdateFeedback, onSubmitFeedback }: {
  plan: OutfitPlan; photoMap: Map<string,string>; saved: boolean; isStarter: boolean;
  feedback: FeedbackState; onSave: ()=>void; onUpdateFeedback: (p:Partial<FeedbackState>)=>void; onSubmitFeedback: ()=>void;
}) {
  const toggleReason = (r:string) => onUpdateFeedback({ reasons: feedback.reasons.includes(r)?feedback.reasons.filter(x=>x!==r):[...feedback.reasons,r] });

  return (
    <div className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2"><span className="text-xl">{PLAN_TYPE_EMOJI[plan.type]}</span><div><p className="text-xs text-gray-400">{PLAN_TYPE_LABELS[plan.type]}</p><h3 className="text-sm font-bold text-gray-900">{plan.title}</h3></div></div>
        <div className="flex items-center gap-1 rounded-full bg-ink-50 px-2.5 py-1"><span className="text-xs font-semibold text-ink-600">{plan.score}</span><span className="text-xs text-ink-400">分</span></div>
      </div>
      {/* 7 slot 照片 */}
      <div className="mt-3 grid grid-cols-7 gap-1.5 sm:gap-2">
        {SLOT_ORDER.map(slotKey => {
          const item = (plan as any)[slotKey] as { itemId: string; description: string; isSuggestion?: boolean; budgetHint?: string } | null;
          const photo = item?.itemId ? photoMap.get(item.itemId) : undefined;
          return (
            <div key={slotKey} className="flex flex-col items-center rounded-lg bg-gray-50 p-1.5">
              {photo ? <img src={photo} alt={SLOT_LABELS[slotKey]} className="size-10 sm:size-12 object-cover rounded-md"/>
                : item?.isSuggestion ? <div className="flex size-10 sm:size-12 items-center justify-center rounded-md bg-amber-100"><ShoppingBag size={14} className="text-amber-600"/></div>
                : <Shirt size={14} className="text-gray-300"/>}
              <span className="mt-0.5 text-[9px] text-gray-400">{SLOT_LABELS[slotKey]}</span>
              {item ? <span className="mt-0.5 line-clamp-1 text-center text-[9px] sm:text-[10px] text-gray-700">{item.description}</span>
                : <span className="mt-0.5 text-[9px] text-gray-300">—</span>}
              {item?.isSuggestion && item.budgetHint && <span className="mt-0.5 line-clamp-1 text-center text-[9px] text-amber-600">{item.budgetHint}</span>}
            </div>
          );
        })}
      </div>
      <p className="mt-3 text-sm text-gray-600">{plan.reason}</p>
      <div className="mt-2 flex flex-wrap gap-2"><span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs text-emerald-600">{plan.scene}</span>{plan.riskWarning&&plan.riskWarning!=='无'&&<span className="flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-0.5 text-xs text-amber-600"><AlertTriangle size={11}/>{plan.riskWarning}</span>}</div>
      {isStarter ? (
        <p className="mt-3 rounded-full bg-gray-50 py-2 text-center text-xs text-gray-400">补充衣橱后即可保存到穿搭计划</p>
      ) : (
        <button type="button" onClick={onSave} disabled={saved} className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2 text-xs font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:cursor-not-allowed disabled:opacity-60">{saved?<><Check size={14}/>已保存</>:<><Calendar size={14}/>选择日期并保存</>}</button>
      )}
      {/* 评分建议 */}
      <div className="mt-2 border-t border-gray-100 pt-2">
        <button type="button" onClick={()=>onUpdateFeedback({expanded:!feedback.expanded})} className="flex w-full items-center justify-between text-xs text-ink-400 hover:text-ink-600 py-1"><span className="flex items-center gap-1.5"><MessageSquare size={14}/>评分建议{feedback.submitted&&<span className="text-green-600">✓已提交</span>}</span>{feedback.expanded?<ChevronUp size={14}/>:<ChevronDown size={14}/>}</button>
        {feedback.expanded&&!feedback.submitted&&(
          <div className="mt-3 space-y-3 bg-gray-50 rounded-xl p-4">
            <div><p className="text-xs text-gray-500 mb-1.5">整体评分</p><div className="flex gap-1">{[1,2,3,4,5].map(n=>(<button key={n} type="button" onClick={()=>onUpdateFeedback({rating:n})} className={`transition-colors ${feedback.rating>=n?'text-amber-400':'text-gray-300 hover:text-amber-300'}`}><Star size={22} fill={feedback.rating>=n?'currentColor':'none'}/></button>))}</div></div>
            <div><p className="text-xs text-gray-500 mb-1.5">你的感受</p><div className="flex gap-2"><button type="button" onClick={()=>onUpdateFeedback({reaction:feedback.reaction==='like'?'':'like'})} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${feedback.reaction==='like'?'bg-green-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-green-300'}`}><ThumbsUp size={14}/>喜欢这套</button><button type="button" onClick={()=>onUpdateFeedback({reaction:feedback.reaction==='dislike'?'':'dislike'})} className={`flex items-center gap-1.5 rounded-full px-4 py-1.5 text-xs font-medium transition-colors ${feedback.reaction==='dislike'?'bg-red-600 text-white':'bg-white border border-gray-200 text-gray-600 hover:border-red-300'}`}><ThumbsDown size={14}/>不喜欢这套</button></div></div>
            {feedback.reaction&&(<div><p className="text-xs text-gray-500 mb-1.5">{feedback.reaction==='like'?'为什么喜欢？（可多选）':'为什么不满意？（可多选）'}</p><div className="flex flex-wrap gap-1.5">{(feedback.reaction==='like'?POSITIVE_REASONS:NEGATIVE_REASONS).map(r=>(<button key={r} type="button" onClick={()=>toggleReason(r)} className={`rounded-full px-2.5 py-1 text-[11px] transition-colors ${feedback.reasons.includes(r)?'bg-ink-900 text-creme-100':'bg-white border border-gray-200 text-gray-600 hover:border-ink-300'}`}>{feedback.reasons.includes(r)?'✓ ':''}{r}</button>))}</div></div>)}
            <div><p className="text-xs text-gray-500 mb-1.5">更多想法（选填）</p><textarea value={feedback.comment} onChange={e=>onUpdateFeedback({comment:e.target.value})} placeholder="比如：裤子可以换成深色的…" className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs outline-none focus:border-ink-300 resize-none h-16"/></div>
            <button type="button" onClick={onSubmitFeedback} disabled={!feedback.reaction||feedback.submitting} className="flex w-full items-center justify-center gap-1.5 rounded-full bg-ink-900 py-2 text-xs font-medium text-creme-100 transition-colors hover:bg-ink-700 disabled:opacity-50 disabled:cursor-not-allowed">{feedback.submitting?<Loader2 size={14} className="animate-spin"/>:<MessageSquare size={14}/>}{feedback.submitting?'提交中…':'提交反馈→优化记忆'}</button>
          </div>
        )}
        {feedback.expanded&&feedback.submitted&&(<div className="mt-3 rounded-xl bg-green-50 p-4 text-center"><Check size={20} className="mx-auto text-green-600 mb-1"/><p className="text-sm font-medium text-green-700">反馈已提交</p><p className="text-xs text-green-500 mt-0.5">AI会根据你的偏好持续优化推荐</p></div>)}
      </div>
    </div>
  );
}
