import { DEFAULT_CS_GLOSSARY } from '../data/csGlossary';
import { CSTerm, TranslationResult } from '../types';

// Extended Vocabulary & Phrasal Dictionary for Offline Chinese Translation Engine
const OFFLINE_DICTIONARY: Record<string, string> = {
  // Pronouns & Common Words
  "i": "我", "me": "我", "my": "我的", "we": "我们", "us": "我们", "our": "我们的",
  "you": "你/你们", "your": "你的/你们的", "he": "他", "she": "她", "it": "它", "they": "他们",
  "this": "这/这个", "that": "那/那个", "these": "这些", "those": "那些",
  "there": "那里/存在", "here": "这里", "is": "是", "are": "是", "was": "是", "were": "是",
  "be": "是", "been": "已被", "being": "正在", "have": "拥有/已经", "has": "拥有/已经", "had": "拥有/已经",
  "do": "做", "does": "做", "did": "做了", "done": "完成",
  "can": "能够", "could": "能够", "will": "将会", "would": "将会", "should": "应该", "must": "必须",
  "belong": "属于", "belongs": "属于", "belonged": "属于", "belonging": "属于",
  "static": "静态的", "field": "字段/属性", "fields": "字段/属性", "variable": "变量", "variables": "变量",
  "copy": "副本/拷贝", "copies": "副本/拷贝", "copied": "复制了", "change": "改变/修改", "changed": "修改了",
  "only": "只有/仅", "one": "一个", "two": "两个", "three": "三个",
  "default": "默认的", "major": "主要的", "perfect": "完美的", "health": "状态/健康",
  "if": "如果", "and": "并且", "or": "或者", "but": "但是", "because": "因为", "so": "所以",
  "of": "的", "in": "在...中", "on": "在...上", "at": "在", "to": "到/向", "for": "为了/对于",
  "with": "使用/随着", "without": "没有", "by": "通过", "from": "来自", "about": "关于",

  // ML / DL & Distributed Terms Vocab
  "model": "模型", "models": "模型", "layer": "图层/隐层", "layers": "隐层",
  "training": "训练", "train": "训练", "eval": "评估", "test": "测试",
  "predict": "预测", "prediction": "预测结果", "cluster": "集群", "node": "节点", "nodes": "节点",
  "worker": "工作节点", "master": "主节点", "leader": "主节点", "follower": "从节点",
  "token": "词元/Token", "tokens": "Token序列", "batch": "批次", "epoch": "轮次",
  "gradient": "梯度", "loss": "损失值", "weight": "权重", "weights": "权重矩阵",
  "bias": "偏置", "input": "输入", "output": "输出", "feature": "特征", "features": "特征向量"
};

/**
 * Match academic terms from text against all known glossaries (default + custom)
 */
export function matchCSTerms(text: string, customGlossary: CSTerm[] = []): CSTerm[] {
  if (!text) return [];

  const combinedGlossary = [...customGlossary, ...DEFAULT_CS_GLOSSARY];
  const matched: CSTerm[] = [];
  const lowerText = text.toLowerCase();

  combinedGlossary.forEach(item => {
    const termLower = item.term.toLowerCase();
    if (lowerText.includes(termLower)) {
      if (!matched.some(m => m.id === item.id || m.term.toLowerCase() === termLower)) {
        matched.push(item);
      }
    }
  });

  return matched;
}

/**
 * Post-process Chinese translation to protect academic technical terms in English
 */
export function applyCSTermPreservation(chineseText: string, detectedTerms: CSTerm[]): string {
  if (!chineseText) return '';
  let result = chineseText;

  detectedTerms.forEach(term => {
    if (!result.toLowerCase().includes(term.term.toLowerCase())) {
      const cnRegex = new RegExp(`(${term.chinese})`, 'g');
      if (cnRegex.test(result)) {
        result = result.replace(cnRegex, `${term.term} ($1)`);
      } else {
        result += ` [${term.term}]`;
      }
    }
  });

  return result;
}

/**
 * Offline heuristic fallback for translating English sentences to Chinese
 */
export function translateOfflineHeuristic(englishText: string, detectedTerms: CSTerm[] = []): string {
  if (!englishText || !englishText.trim()) return '';

  const words = englishText.split(/\s+/);
  const translatedWords = words.map(w => {
    const cleanWord = w.toLowerCase().replace(/[^a-z0-9]/gi, '');
    if (!cleanWord) return w;

    const matchedTerm = detectedTerms.find(t => t.term.toLowerCase() === cleanWord);
    if (matchedTerm) {
      return `${matchedTerm.term} (${matchedTerm.chinese})`;
    }

    if (OFFLINE_DICTIONARY[cleanWord]) {
      return OFFLINE_DICTIONARY[cleanWord];
    }

    return w;
  });

  return translatedWords.join('')
    .replace(/([a-zA-Z0-9]+)([\u4e00-\u9fa5])/g, '$1 $2')
    .replace(/([\u4e00-\u9fa5])([a-zA-Z0-9]+)/g, '$1 $2')
    .trim();
}

/**
 * Fast synchronous translation getter for zero-lag UI updates
 */
export function translateWithTermPreservation(englishText: string, customGlossary: CSTerm[] = []): TranslationResult {
  if (!englishText || !englishText.trim()) {
    return { original: '', chinese: '正在同传中文字幕...', detectedTerms: [] };
  }

  const detectedTerms = matchCSTerms(englishText, customGlossary);
  const offlineCn = translateOfflineHeuristic(englishText, detectedTerms);

  return {
    original: englishText,
    chinese: offlineCn || '正在生成同传中文字幕...',
    detectedTerms
  };
}

/**
 * Translate English text to Chinese using multi-layer online API + term preservation
 */
export async function fetchOnlineTranslation(englishText: string, customGlossary: CSTerm[] = []): Promise<TranslationResult> {
  if (!englishText || !englishText.trim()) {
    return { original: '', chinese: '', detectedTerms: [] };
  }

  const detectedTerms = matchCSTerms(englishText, customGlossary);

  // 1. Google Translate GTX Free API (Fastest & most accurate English -> Chinese)
  try {
    const gtxUrl = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=${encodeURIComponent(englishText.trim())}`;
    const res = await fetch(gtxUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data[0] && Array.isArray(data[0])) {
        const translatedStr = data[0].map((item: [string]) => item[0]).filter(Boolean).join('');
        if (translatedStr && translatedStr.trim()) {
          const finalCn = applyCSTermPreservation(translatedStr.trim(), detectedTerms);
          return {
            original: englishText,
            chinese: finalCn,
            detectedTerms
          };
        }
      }
    }
  } catch (e) {
    console.warn('Google GTX translate API bypassed, trying MyMemory...', e);
  }

  // 2. MyMemory Translation API Fallback
  try {
    const myMemUrl = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(englishText.trim())}&langpair=en|zh-CN`;
    const res = await fetch(myMemUrl);
    if (res.ok) {
      const data = await res.json();
      if (data && data.responseData && data.responseData.translatedText) {
        const rawText = data.responseData.translatedText;
        if (rawText && rawText !== englishText) {
          const finalCn = applyCSTermPreservation(rawText.trim(), detectedTerms);
          return {
            original: englishText,
            chinese: finalCn,
            detectedTerms
          };
        }
      }
    }
  } catch (e) {
    console.warn('MyMemory translate API bypassed, using local engine...', e);
  }

  // 3. Local Engine Fallback
  const fallbackCn = translateOfflineHeuristic(englishText, detectedTerms);
  return {
    original: englishText,
    chinese: fallbackCn || '【同传字幕】' + englishText,
    detectedTerms
  };
}
