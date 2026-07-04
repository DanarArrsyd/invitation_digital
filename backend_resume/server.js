import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const ALLOWED_ORIGINS = [
    'https://resumedanar.vercel.app',
    'http://localhost:3000',
    'http://127.0.0.1:5500',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error(`CORS: origin ${origin} tidak diizinkan`));
        }
    },
    methods: ['GET', 'POST'],
}));
app.use(express.json());

// ══════════════════════════════════════════════════════════════
// ENV VALIDATION
// ══════════════════════════════════════════════════════════════
const REQUIRED_ENV = ['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'GROQ_API_KEY', 'GEMINI_API_KEY'];
const missingEnv   = REQUIRED_ENV.filter(k => !process.env[k]);
if (missingEnv.length > 0) {
    console.error('[Boot] Missing env vars:', missingEnv.join(', '));
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const supabase    = createClient(supabaseUrl, supabaseKey);

// ══════════════════════════════════════════════════════════════
// MODEL CONFIG
// ══════════════════════════════════════════════════════════════
const MODEL_GEMINI      = 'gemini-2.5-flash';      // primary — lebih pinter, gratis 10 RPM / 250 RPD
const MODEL_GEMINI_LITE = 'gemini-2.5-flash-lite'; // fallback 1 — gratis 15 RPM / 1000 RPD
const MODEL_GROQ        = 'llama-3.3-70b-versatile'; // fallback 2 — 70B, jauh lebih pinter dari 8b-instant

// ══════════════════════════════════════════════════════════════
// CONSTANTS
// ══════════════════════════════════════════════════════════════
const MAX_INPUT_CHARS   = 500;
const MAX_OUTPUT_TOKENS = 280;
const GEMINI_TIMEOUT_MS = 12_000;
const GROQ_TIMEOUT_MS   = 15_000;
const CACHE_TTL         = 300_000; // 5 menit
const RATE_LIMIT_MAX    = 20;

// ══════════════════════════════════════════════════════════════
// FORMAT HELPERS
// ══════════════════════════════════════════════════════════════
function formatPhone(phone) {
    if (!phone) return '-';
    const clean = String(phone).replace(/\D/g, '');
    if (clean.startsWith('62')) return `+${clean}`;
    if (clean.startsWith('0'))  return clean;
    return clean;
}

function firstSentence(str) {
    if (!str) return '';
    const s = str.split(/[.!\n]/)[0].trim();
    return s.length > 130 ? s.slice(0, 127) + '...' : s;
}

// ══════════════════════════════════════════════════════════════
// BUILD SYSTEM PROMPT
// ══════════════════════════════════════════════════════════════
function buildSystemPrompt(data) {
    const { profile, education, skills, experience, events, certs, portfolio } = data;

    const now      = new Date();
    const todayStr = now.toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' });

    const birthFmt = profile.birth_date
        ? new Date(profile.birth_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
        : '-';

    let age = '-';
    if (profile.birth_date) {
        const b = new Date(profile.birth_date);
        let a = now.getFullYear() - b.getFullYear();
        if (now.getMonth() < b.getMonth() || (now.getMonth() === b.getMonth() && now.getDate() < b.getDate())) a--;
        age = `${a} tahun`;
    }

    const socials = [
        profile.url_instagram ? `Instagram : ${profile.url_instagram}` : null,
        profile.url_linkedin  ? `LinkedIn  : ${profile.url_linkedin}`  : null,
        profile.url_github    ? `GitHub    : ${profile.url_github}`    : null,
        profile.url_x         ? `X/Twitter : ${profile.url_x}`         : null,
        profile.url_tiktok    ? `TikTok    : ${profile.url_tiktok}`    : null,
        profile.url_behance   ? `Behance   : ${profile.url_behance}`   : null,
    ].filter(Boolean).join('\n');

    const skillByCategory = (() => {
        const g = {};
        skills.forEach(s => {
            if (!g[s.category]) g[s.category] = [];
            g[s.category].push(s.skill_name);
        });
        return Object.entries(g)
            .map(([cat, items]) => `  [${cat}] ${items.join(', ')}`)
            .join('\n');
    })();

    const expList = experience.map(x => {
        const end = x.is_active ? 'sekarang' : (x.period_end || '-');
        return `  - [PEKERJAAN] ${x.job_title} @ ${x.company} (${x.period_start} – ${end})`;
    }).join('\n');

    const orgList = events.map(ev => {
        const typeLabel   = ev.type === 'comp' ? 'Kompetisi' : 'Kegiatan';
        const achievement = firstSentence(ev.description);
        return [
            `  - [${typeLabel}] ${ev.name}`,
            `    Role   : ${ev.role || '-'} | Periode: ${ev.period || '-'}`,
            achievement ? `    Result : ${achievement}` : null,
        ].filter(Boolean).join('\n');
    }).join('\n');

    const certList = certs.map(c => [
        `  - "${c.cert_name}" — ${c.issuer} (${c.issued_date || '?'})`,
        c.cert_url ? `    Cek di: ${c.cert_url}` : null,
    ].filter(Boolean).join('\n')).join('\n');

    const pfList = portfolio.map(p => {
        const links = [
            p.url_live    ? `Live    : ${p.url_live}`    : null,
            p.url_github  ? `GitHub  : ${p.url_github}`  : null,
            p.url_behance ? `Behance : ${p.url_behance}` : null,
            p.url_figma   ? `Figma   : ${p.url_figma}`   : null,
        ].filter(Boolean);

        let tagsArr = p.tags;
        if (typeof tagsArr === 'string') {
            try { tagsArr = JSON.parse(tagsArr); } catch { tagsArr = [tagsArr]; }
        }
        const tagsStr   = Array.isArray(tagsArr) ? tagsArr.join(', ') : '-';
        const featured  = p.is_featured ? ' [FEATURED]' : '';
        const shortDesc = firstSentence(p.description);

        return [
            `  - [PROJECT WEB] "${p.title}"${featured} (${p.year || '-'})`,
            `    Tech Stack (HANYA INI yang boleh disebut): ${tagsStr}`,
            shortDesc ? `    Desc : ${shortDesc}` : null,
            links.length
                ? `    Link :\n      ${links.join('\n      ')}`
                : `    Link : (belum ada)`,
        ].filter(Boolean).join('\n');
    }).join('\n\n');

    return `
## IDENTITAS
Kamu adalah "Danar Alter" — persona digital dari ${profile.full_name || 'Eka Danar Arrasyid'}, dipanggil Danar.
Role    : ${profile.role || 'Informatics Engineering Student'}
Kampus  : ${education[0]?.school_name || 'Universitas Pelita Bangsa'}, Bekasi
Bio     : ${profile.bio || '-'}
Hari ini: ${todayStr}

## ATURAN WAJIB — TIDAK BOLEH DILANGGAR

GAYA & BAHASA
- Selalu "gw" (diri sendiri), "lo" hanya kalau natural di tengah kalimat — DILARANG di akhir kalimat sebagai sapaan dan menggunakan kata "Saya/Aku", "Kamu/Anda" dalam bentuk apapun
- Jawab pakai Bahasa Indonesia meskipun user pakai Bahasa Inggris.
- Gaya: santai, tengil dikit, bersubstansi dan jangan kaku banget. Nama diri = "Danar".
- Kalau user terlihat profesional (recruiter, klien) → tetap santai tapi lebih proper.
- Kalau user casual → bisa lebih tengil. Deteksi dari cara user nulis, match formalitasnya.
- Kalau user typo atau pakai bahasa gaul → pahami maksudnya, jawab normal, jangan koreksi.

FORMAT JAWABAN
- WAJIB maksimal 2 kalimat. Kalau butuh list → maks 3 poin, tiap poin maks 4 kata.
- DILARANG: elaborasi, contoh tambahan, basa-basi, kalimat penutup ("semoga membantu", "ada yang mau ditanyain?").
- Maksimal 1 emoji, taruh di akhir saja. Langsung ke inti, jangan ulangi pertanyaan.
- Kalau info sudah disebut di percakapan sebelumnya → jangan ulangi, lanjutkan konteksnya.
- Kalau user bilang "tadi lo bilang..." → acknowledge dan lanjutkan, jangan deny.

PERTANYAAN TIDAK JELAS
- Kalau pertanyaan ambigu → tanya balik SATU hal paling krusial saja.
  Contoh: "Lo bisa apa?" → "Maksudnya skill teknis atau project gw?"
- Jangan jawab dengan asumsi sendiri kalau tidak yakin maksudnya.

IDENTITAS
- JANGAN sebut AI, bot, ChatGPT, atau sejenisnya — lo adalah Danar, versi digital.
- JANGAN refer ke "data", "sistem", "database", "backend" — lo tau semua tentang diri sendiri secara langsung.
- Kalau ditanya "lo AI/bot?" → jawab: "Gw Danar, versi digital. Mau tanya apa soal gw?"

TOPIK & BATASAN
- Topik boleh: tech, web dev, UI/UX, coding, karir IT, desain, bisnis digital, produktivitas, office tools, hal personal Danar.
- Topik general → jawab singkat + arahkan ke sumber terpercaya (MDN, Stack Overflow, dsb).
- Topik di luar itu (politik, SARA, hal sensitif) → "Itu di luar topik gw, coba tanya yang lain 😄"
- Kalau info tidak ada di DATA FAKTA → jawab: "Gw ga punya info itu."
- Kalau user nanya perbandingan tech → jawab objektif, boleh kasih opini singkat dari perspektif Danar.

RESPON SOSIAL
- Kalau user muji → jawab singkat, humble. Contoh: "Thanks, masih banyak yang mau gw improve juga 😄"
- Kalau user bilang "oke", "thanks", "makasih", "udah cukup" → jawab singkat saja, JANGAN tawarin bantuan lagi.
- Kalau user kasar atau spam → "Santai bro, tanya yang bener aja 😄"

KONTEKS PERSONAL (jawab singkat, jangan elaborasi)
- Sosmed: tanya dulu platform mana, kasih link HANYA setelah user sebut platform spesifik.
- Gaji/rate freelance: "Itu urusan DM, gw ga publish angkanya 😄"
- KP: lagi KP di PT. Kenco Manufactur Indonesia, fokus Software Engineering.
- Kuliah sambil kerja: pagi kerja, sore-malam kuliah.
- Organisasi kampus: tidak aktif, tapi pernah ikut beberapa kompetisi (lihat data).
- Device: Macbook Air M1 buat kerja & kuliah, HP buat komunikasi.
- Sumber belajar: Dicoding, YouTube, dokumentasi resmi. Lebih suka belajar dari project langsung.
- Makanan favorit: nasi goreng, olahan ayam, bakso, mie ayam.
- Minuman favorit: Kopi Kenangan Less/Non Sugar, air mineral, es jeruk.
  Kalau ditanya KOPI saja → jawab hanya "Kopi Kenangan Less/Non Sugar", jangan sebut minuman lain.
  Kalau ditanya minuman secara umum → baru sebut semua.

## ANTI-HALUSINASI — KRITIS
- DATA FAKTA di bawah = SATU-SATUNYA sumber kebenaran. Tidak ada yang lain.
- DILARANG KERAS mengarang, mengasumsikan, atau menambahkan info apapun di luar DATA FAKTA.
- SKILLS    : HANYA sebut skill yang ada di list. Zero exception.
- PORTFOLIO : HANYA sebut project yang ada di list.
- TECH STACK: HANYA sebut teknologi yang tertulis di field "Tech Stack" tiap project.
- URL/LINK/WEBSITE: HANYA tulis URL yang tertera PERSIS di DATA FAKTA. DILARANG membuat, menebak, atau mengkonstruksi URL apapun. Project tanpa link → sebut nama saja, TANPA link.

## STACK WEBSITE PORTOFOLIO DANAR
HTML/CSS/JS vanilla | Supabase | Node.js + Express @ Vercel | Gemini API (primary) | Groq API (fallback)

---

## DATA FAKTA

### Profil
Nama     : ${profile.full_name || '-'}
Lahir    : ${birthFmt} (${age})
Kota     : ${profile.city || '-'}
Email    : ${profile.email || '-'}
WhatsApp : ${formatPhone(profile.phone)}

### Sosial Media
${socials || '-'}

### Pendidikan
${education.map(e =>
    `- ${e.school_name} — ${e.major} (${e.year_start}–${e.is_active ? 'sekarang' : e.year_end})`
).join('\n') || '-'}

### Skills — HANYA INI YANG BOLEH DISEBUT
${skillByCategory || '-'}

### Pengalaman Kerja
${expList || '-'}

### Organisasi & Kompetisi
${orgList || '-'}

### Sertifikasi (${certs.length} total)
${certList || '-'}

### Portfolio / Karya Web (${portfolio.length} project)
${pfList || '(belum ada project)'}
`.trim();
}

// ══════════════════════════════════════════════════════════════
// SMART CACHE
// ══════════════════════════════════════════════════════════════
let _cache        = null;
let _cachedPrompt = null;
let _cacheAt      = 0;

const FALLBACK_DATA = {
    profile:    { full_name: 'Eka Danar Arrasyid', role: 'Informatics Engineering Student', city: 'Bekasi', email: 'edanararrasyid@gmail.com' },
    education:  [{ school_name: 'Universitas Pelita Bangsa', major: 'Teknik Informatika', year_start: 2023, is_active: true }],
    skills:     [], experience: [], events: [], certs: [], portfolio: [],
};

async function getSystemPrompt() {
    const now = Date.now();
    if (_cachedPrompt && (now - _cacheAt) < CACHE_TTL) return _cachedPrompt;

    try {
        const [profRes, eduRes, skillRes, expRes, eventRes, certRes, portfolioRes] = await Promise.all([
            supabase.from('profile').select('*').single(),
            supabase.from('education').select('*').order('sort_order'),
            supabase.from('skills').select('*').order('sort_order'),
            supabase.from('experience').select('*').order('sort_order'),
            supabase.from('events').select('*').order('sort_order'),
            supabase.from('certifications').select('*').order('sort_order'),
            supabase.from('portfolio')
                .select('title, type, tags, year, url_live, url_github, url_behance, url_figma, is_featured, description')
                .eq('is_published', true)
                .order('sort_order'),
        ]);

        _cache = {
            profile:    profRes.data    || FALLBACK_DATA.profile,
            education:  eduRes.data     || FALLBACK_DATA.education,
            skills:     skillRes.data   || [],
            experience: expRes.data     || [],
            events:     eventRes.data   || [],
            certs:      certRes.data    || [],
            portfolio:  portfolioRes.data || [],
        };
    } catch (err) {
        console.error('[Cache] Supabase error, using fallback:', err.message);
        _cache = _cache || FALLBACK_DATA;
    }

    _cachedPrompt = buildSystemPrompt(_cache);
    _cacheAt      = now;
    return _cachedPrompt;
}

// ══════════════════════════════════════════════════════════════
// RATE LIMITER
// ══════════════════════════════════════════════════════════════
const rateLimitMap = new Map();

function checkRateLimit(ip) {
    const now    = Date.now();
    const record = rateLimitMap.get(ip) || { count: 0, resetAt: now + 60_000 };
    if (now > record.resetAt) { record.count = 0; record.resetAt = now + 60_000; }
    record.count++;
    rateLimitMap.set(ip, record);
    return record.count <= RATE_LIMIT_MAX;
}

setInterval(() => {
    const now = Date.now();
    for (const [ip, r] of rateLimitMap.entries()) {
        if (now > r.resetAt) rateLimitMap.delete(ip);
    }
}, CACHE_TTL);

// ══════════════════════════════════════════════════════════════
// GEMINI CALLER
// ══════════════════════════════════════════════════════════════
async function callGemini(apiKey, systemPrompt, contents, useStream, model = MODEL_GEMINI) {
    const endpoint  = useStream ? 'streamGenerateContent' : 'generateContent';
    const altParam  = useStream ? '&alt=sse' : '';
    const url       = `https://generativelanguage.googleapis.com/v1beta/models/${model}:${endpoint}?key=${apiKey}${altParam}`;
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), GEMINI_TIMEOUT_MS);
    try {
        return await fetch(url, {
            method:  'POST',
            signal:  controller.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                system_instruction: { parts: [{ text: systemPrompt }] },
                contents,
                generationConfig: {
                    temperature: 0.55,
                    maxOutputTokens: MAX_OUTPUT_TOKENS,
                    // 2.5-flash punya thinking mode default ON — thinking tokens
                    // kepotong dari maxOutputTokens, bisa bikin respons kosong.
                    // Chatbot persona ga butuh reasoning panjang → matikan.
                    thinkingConfig: { thinkingBudget: 0 },
                },
            }),
        });
    } finally {
        clearTimeout(timeout);
    }
}

// ══════════════════════════════════════════════════════════════
// GROQ CALLER
// ══════════════════════════════════════════════════════════════
async function callGroq(apiKey, messages, useStream) {
    const controller = new AbortController();
    const timeout    = setTimeout(() => controller.abort(), GROQ_TIMEOUT_MS);
    try {
        return await fetch('https://api.groq.com/openai/v1/chat/completions', {
            method:  'POST',
            signal:  controller.signal,
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
            body: JSON.stringify({
                model: MODEL_GROQ, messages, temperature: 0.55, max_tokens: MAX_OUTPUT_TOKENS,
                ...(useStream ? { stream: true } : {}),
            }),
        });
    } finally {
        clearTimeout(timeout);
    }
}

// ══════════════════════════════════════════════════════════════
// STREAM HELPERS
// ══════════════════════════════════════════════════════════════
async function streamGeminiToClient(geminiRes, res) {
    const reader   = geminiRes.body.getReader();
    const decoder  = new TextDecoder();
    let buffer     = '';
    let hasContent = false;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
            const t = line.trim();
            if (!t || t === 'data: [DONE]') continue;
            if (t.startsWith('data: ')) {
                try {
                    const json  = JSON.parse(t.slice(6));
                    const delta = json.candidates?.[0]?.content?.parts?.[0]?.text;
                    if (delta) { res.write(`data: ${JSON.stringify({ delta })}\n\n`); hasContent = true; }
                    const finishReason = json.candidates?.[0]?.finishReason;
                    if (finishReason && finishReason !== 'STOP' && finishReason !== 'MAX_TOKENS') {
                        console.warn('[Gemini] Unusual finish reason:', finishReason);
                    }
                } catch (_) {}
            }
        }
    }
    return hasContent;
}

async function streamGroqToClient(groqRes, res) {
    const reader   = groqRes.body.getReader();
    const decoder  = new TextDecoder();
    let buffer     = '';
    let hasContent = false;

    while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();
        for (const line of lines) {
            const t = line.trim();
            if (!t || t === 'data: [DONE]') continue;
            if (t.startsWith('data: ')) {
                try {
                    const json  = JSON.parse(t.slice(6));
                    const delta = json.choices?.[0]?.delta?.content;
                    if (delta) { res.write(`data: ${JSON.stringify({ delta })}\n\n`); hasContent = true; }
                } catch (_) {}
            }
        }
    }
    return hasContent;
}

function toOpenAIMessages(systemPrompt, contents) {
    return [
        { role: 'system', content: systemPrompt },
        ...contents.map(item => ({
            role:    item.role === 'model' ? 'assistant' : 'user',
            content: item.parts[0].text,
        })),
    ];
}

// ══════════════════════════════════════════════════════════════
// INPUT VALIDATOR
// ══════════════════════════════════════════════════════════════
function validateContents(contents) {
    if (!Array.isArray(contents) || contents.length === 0) return 'Request tidak valid.';
    for (const item of contents) {
        if (!item?.role || typeof item?.parts?.[0]?.text !== 'string' || !item.parts[0].text.trim()) {
            return 'Format pesan tidak valid.';
        }
    }
    const lastText = contents[contents.length - 1]?.parts?.[0]?.text || '';
    if (lastText.length > MAX_INPUT_CHARS) return `Pesan terlalu panjang. Maksimal ${MAX_INPUT_CHARS} karakter.`;
    return null;
}

// ══════════════════════════════════════════════════════════════
// GREETING ENDPOINT
// ══════════════════════════════════════════════════════════════
app.get('/api/greeting', async (req, res) => {
    try {
        await getSystemPrompt();
        res.json({
            name:           'Danar', // FIX: selalu "Danar", bukan split nama panjang
            portfolioCount: _cache?.portfolio?.length || 0,
        });
    } catch (err) {
        console.error('[Greeting] error:', err);
        res.json({ name: 'Danar', portfolioCount: 0 });
    }
});

// ══════════════════════════════════════════════════════════════
// MAIN CHAT ENDPOINT
// ══════════════════════════════════════════════════════════════
app.post('/api/chat', async (req, res) => {
    const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim()
        || req.socket?.remoteAddress || 'unknown';

    if (!checkRateLimit(ip)) {
        return res.status(429).json({ error: { message: 'Terlalu banyak request, coba lagi dalam 1 menit.' } });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    const groqApiKey   = process.env.GROQ_API_KEY;

    if (!groqApiKey && !geminiApiKey) {
        return res.status(500).json({ error: { message: 'API key belum disetting.' } });
    }

    const { contents, stream = false } = req.body;
    const validationError = validateContents(contents);
    if (validationError) return res.status(400).json({ error: { message: validationError } });

    try {
        const promptContent = await getSystemPrompt();

        // ── STREAMING ──
        if (stream) {
            res.setHeader('Content-Type',      'text/event-stream; charset=utf-8');
            res.setHeader('Cache-Control',     'no-cache, no-transform');
            res.setHeader('Connection',        'keep-alive');
            res.setHeader('X-Accel-Buffering', 'no');
            res.flushHeaders?.();

            let success = false;

            // 1 & 2. TRY GEMINI — flash dulu, lalu flash-lite
            if (geminiApiKey) {
                for (const model of [MODEL_GEMINI, MODEL_GEMINI_LITE]) {
                    if (success) break;
                    try {
                        console.log(`[Chat] Trying ${model} for IP: ${ip}`);
                        const geminiRes = await callGemini(geminiApiKey, promptContent, contents, true, model);
                        if (geminiRes.ok) {
                            success = await streamGeminiToClient(geminiRes, res);
                            if (success) console.log(`[Chat] ${model} OK for IP: ${ip}`);
                            else console.warn(`[Chat] ${model} empty, trying next`);
                        } else {
                            const errBody = await geminiRes.json().catch(() => ({}));
                            console.warn(`[Chat] ${model} HTTP ${geminiRes.status}:`, errBody?.error?.message || 'unknown');
                        }
                    } catch (err) {
                        console.warn(`[Chat] ${model} failed (${err.name === 'AbortError' ? 'timeout' : err.message}), trying next`);
                    }
                }
            }

            // 3. FALLBACK: GROQ
            if (!success && groqApiKey) {
                try {
                    console.log(`[Chat] Trying Groq fallback for IP: ${ip}`);
                    const groqRes = await callGroq(groqApiKey, toOpenAIMessages(promptContent, contents), true);
                    if (groqRes.ok) {
                        success = await streamGroqToClient(groqRes, res);
                        if (success) console.log(`[Chat] Groq fallback OK for IP: ${ip}`);
                    } else {
                        const errBody = await groqRes.json().catch(() => ({}));
                        console.error(`[Chat] Groq HTTP ${groqRes.status}:`, errBody?.error?.message || 'unknown');
                    }
                } catch (err) {
                    console.error(`[Chat] Groq also failed (${err.name === 'AbortError' ? 'timeout' : err.message})`);
                }
            }

            if (!success) res.write(`data: ${JSON.stringify({ error: 'Semua provider gagal. Coba lagi bentar.' })}\n\n`);
            res.write('data: [DONE]\n\n');
            res.end();
            return;
        }

        // ── NON-STREAMING ──

        // 1 & 2. TRY GEMINI — flash dulu, lalu flash-lite
        if (geminiApiKey) {
            for (const model of [MODEL_GEMINI, MODEL_GEMINI_LITE]) {
                try {
                    const geminiRes  = await callGemini(geminiApiKey, promptContent, contents, false, model);
                    const geminiData = await geminiRes.json();
                    if (geminiRes.ok) {
                        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
                        if (text) return res.json({ candidates: [{ content: { parts: [{ text }] } }], _provider: model });
                        console.warn(`[Chat] ${model} non-stream: empty, trying next`);
                    } else {
                        console.warn(`[Chat] ${model} non-stream HTTP ${geminiRes.status}:`, geminiData?.error?.message);
                    }
                } catch (err) {
                    console.warn(`[Chat] ${model} non-stream failed:`, err.message);
                }
            }
        }

        // 3. FALLBACK: GROQ
        if (groqApiKey) {
            try {
                const groqRes  = await callGroq(groqApiKey, toOpenAIMessages(promptContent, contents), false);
                const groqData = await groqRes.json();
                if (groqRes.ok) {
                    const text = groqData.choices?.[0]?.message?.content;
                    if (text) return res.json({ candidates: [{ content: { parts: [{ text }] } }], _provider: 'groq' });
                }
                return res.status(groqRes.status).json({ error: { message: groqData.error?.message || 'Groq error' } });
            } catch (err) {
                console.error('[Chat] Groq non-stream failed:', err.message);
            }
        }

        return res.status(503).json({ error: { message: 'Semua provider gagal. Coba lagi bentar.' } });

    } catch (err) {
        console.error('[Chat] Unexpected error:', err);
        return res.status(500).json({ error: { message: 'Server error.' } });
    }
});

// ══════════════════════════════════════════════════════════════
// HEALTH CHECK — GET /api/health
// ══════════════════════════════════════════════════════════════
app.get('/api/health', (req, res) => {
    res.json({
        status:    'ok',
        cache:     _cachedPrompt ? 'warm' : 'cold',
        cacheAge:  _cacheAt ? Math.round((Date.now() - _cacheAt) / 1000) + 's' : 'none',
        providers: { gemini: !!process.env.GEMINI_API_KEY, groq: !!process.env.GROQ_API_KEY },
    });
});

// ══════════════════════════════════════════════════════════════
// TEST PROVIDERS — GET /api/test-providers?key=ADMIN_SECRET
// ══════════════════════════════════════════════════════════════
app.get('/api/test-providers', async (req, res) => {
    if (!req.query.key || req.query.key !== process.env.ADMIN_SECRET) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    const testPrompt = 'Jawab dengan tepat 3 kata: modal kamu apa?';
    const results    = {};

    // TEST GEMINI (kedua model)
    const geminiKey = process.env.GEMINI_API_KEY;
    if (!geminiKey) {
        results.gemini = { status: 'skip', reason: 'GEMINI_API_KEY tidak ada' };
    } else {
        for (const model of [MODEL_GEMINI, MODEL_GEMINI_LITE]) {
            const t0 = Date.now();
            try {
                const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${geminiKey}`;
                const r   = await fetch(url, {
                    method: 'POST', headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ contents: [{ role: 'user', parts: [{ text: testPrompt }] }], generationConfig: { maxOutputTokens: 30, thinkingConfig: { thinkingBudget: 0 } } }),
                    signal: AbortSignal.timeout(10_000),
                });
                const data = await r.json();
                const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
                results[model] = { status: r.ok && text ? 'ok' : 'error', http: r.status, latency: Date.now() - t0 + 'ms', reply: text || null, error: !r.ok ? (data.error?.message || 'unknown') : null };
            } catch (err) {
                results[model] = { status: 'error', latency: Date.now() - t0 + 'ms', error: err.name === 'TimeoutError' ? 'timeout 10s' : err.message };
            }
        }
    }

    // TEST GROQ
    const groqKey = process.env.GROQ_API_KEY;
    if (!groqKey) {
        results.groq = { status: 'skip', reason: 'GROQ_API_KEY tidak ada' };
    } else {
        const t0 = Date.now();
        try {
            const r = await fetch('https://api.groq.com/openai/v1/chat/completions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${groqKey}` },
                body: JSON.stringify({ model: MODEL_GROQ, messages: [{ role: 'user', content: testPrompt }], max_tokens: 30 }),
                signal: AbortSignal.timeout(10_000),
            });
            const data = await r.json();
            const text = data.choices?.[0]?.message?.content;
            results.groq = { status: r.ok && text ? 'ok' : 'error', http: r.status, latency: Date.now() - t0 + 'ms', reply: text || null, error: !r.ok ? (data.error?.message || 'unknown') : null };
        } catch (err) {
            results.groq = { status: 'error', latency: Date.now() - t0 + 'ms', error: err.name === 'TimeoutError' ? 'timeout 10s' : err.message };
        }
    }

    res.json({ timestamp: new Date().toISOString(), results });
});

export default app;