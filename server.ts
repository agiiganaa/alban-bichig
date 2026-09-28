import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json({ limit: '10mb' }));

  // Initialize Gemini client strictly with User-Agent header as required
  const apiKey = process.env.GEMINI_API_KEY;
  let ai: GoogleGenAI | null = null;
  if (apiKey) {
    ai = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  } else {
    console.warn('GEMINI_API_KEY is not set in environment variables.');
  }

  // API endpoint for formalizing selected Mongolian official document text
  app.post('/api/formalize', async (req: Request, res: Response) => {
    try {
      const {
        text = '',
        roughText = '',
        action = 'formalize', // 'formalize' | 'grammar' | 'shorten' | 'expand'
        tone = 'standard', // 'government' | 'b2b' | 'respectful' | 'standard'
      } = req.body;

      const inputContent = (text || roughText || '').trim();

      if (!inputContent) {
        return res.status(400).json({
          error: 'Эхлээд засах текстээ оруулна уу.',
        });
      }

      if (!ai) {
        // Fallback rule-based formalization if API is temporarily unavailable
        let fallbackResult = inputContent;

        if (action === 'formalize') {
          if (fallbackResult.includes('би энэ машинаа өөр хүнд шилжүүлэх хүсэлтэй байна')) {
            fallbackResult = fallbackResult.replace(
              'би энэ машинаа өөр хүнд шилжүүлэх хүсэлтэй байна',
              'Миний эзэмшлийн тээврийн хэрэгслийг бусдад шилжүүлэх хүсэлттэй байна.'
            );
          } else {
            fallbackResult = fallbackResult
              .replace(/машинаа/gi, 'тээврийн хэрэгслээ')
              .replace(/машин/gi, 'тээврийн хэрэгсэл')
              .replace(/(^|\s)би(\s|$)/gi, '$1миний бие$2')
              .replace(/ажлаас гармаар байна/gi, 'үүрэгт ажлаас чөлөөлөгдөх хүсэлтэй байна')
              .replace(/амралт авмаар байна/gi, 'ээлжийн амралт эдлэх хүсэлтэй байна')
              .replace(/хүсэлтэй байна/gi, 'хүсэлттэй байна')
              .replace(/өгмөөр байна/gi, 'хүлээлгэн өгөх хүсэлтэй байна');
          }
        } else if (action === 'grammar') {
          fallbackResult = fallbackResult
            .replace(/хүсэлтэй\b/gi, 'хүсэлттэй')
            .replace(/\s{2,}/g, ' ')
            .trim();
        } else if (action === 'shorten') {
          // Shorten by keeping core sentences
          const sentences = fallbackResult.split(/[.!?]\s+/).filter(Boolean);
          fallbackResult = sentences.slice(0, Math.max(1, Math.ceil(sentences.length / 2))).join('. ');
          if (fallbackResult && !fallbackResult.endsWith('.')) fallbackResult += '.';
        } else if (action === 'expand') {
          if (!fallbackResult.includes('Иймд')) {
            fallbackResult += ' Иймд дээрх асуудлыг холбогдох хууль тогтоомж, журмын дагуу хянан үзэж, зохих шийдвэр гаргаж өгнө үү.';
          }
        }

        return res.json({
          result: fallbackResult,
          formalizedText: fallbackResult,
        });
      }

      let actionInstruction = '';
      if (action === 'grammar') {
        actionInstruction =
          'ҮЙЛДЭЛ: ҮГ, ҮСЭГ БОЛОН ДҮРМИЙН АЛДААГ ШАЛГАЖ ЗАСАХ. Текстийн утга санаа, бүтцийг өөрчлөхгүйгээр зөвхөн Монгол хэлний зөв бичих дүрмийн алдаа болон цэг таслалыг нямбай засна.';
      } else if (action === 'shorten') {
        actionInstruction =
          'ҮЙЛДЭЛ: БОГИНОСГОХ. Текстийн үндсэн агуулгыг алдагдуулахгүйгээр сунжирсан илүүц үг хэллэгийг хасаж, товч бөгөөд тодорхой найруулгаар хураангуйлна.';
      } else if (action === 'expand') {
        actionInstruction =
          'ҮЙЛДЭЛ: ДЭЛГЭРҮҮЛЭХ. Текстийн үндсэн санааг Монгол хэлний албан хэрэг хөтлөлтийн стандартад нийцүүлэн зохих албан үндэслэл, найруулгаар дэлгэрүүлэн баяжуулж бичнэ.';
      } else {
        actionInstruction =
          'ҮЙЛДЭЛ: НАЙРУУЛГА ЗАСАХ. Хэрэглэгчийн бичсэн текстийг Монгол хэлний төрийн албан бичгийн найруулгын стандартад нийцүүлэн мэргэжлийн албан хэллэгт шилжүүлнэ.';
      }

      let toneInstruction = '';
      if (tone === 'government') {
        toneInstruction =
          'Найруулгын өнгө аяс: Төрийн албан байгууллагад хандсан албан ёсны хатуу, хууль эрх зүйн үндэслэл бүхий найруулга.';
      } else if (tone === 'b2b') {
        toneInstruction =
          'Найруулгын өнгө аяс: Бизнес, түнш байгууллагад хандсан ажил хэрэгч соёлтой, найрсаг найруулга.';
      } else if (tone === 'respectful') {
        toneInstruction =
          'Найруулгын өнгө аяс: Хүндэтгэлтэй, дипломат зөөлөн найруулга.';
      } else {
        toneInstruction =
          'Найруулгын өнгө аяс: Албан хэрэг хөтлөлтийн стандартын дагуу ердийн албан ёсны хэв маяг.';
      }

      const prompt = `Та бол Монгол хэлний албан бичиг хэрэг хөтлөлтийн мэргэшсэн редактор.
ЧУХАЛ ДҮРЭМ:
1. Зөвхөн өгөгдсөн ТУХАЙН НЭГ ХЭСЭГ текстийг боловсруулна.
2. Шинэ догол мөр, шинэ гарчиг, мэндчилгээ, өргөдлийн эхлэл, төгсгөл, гарын үсэг ОГТ НЭМЭХГҮЙ.
3. Өмнөх текстийг давтаж давхар бичихгүй.
4. Ямар нэг тайлбар үг (жишээ нь: "Мэдээж", "Зассан хувилбар:", "Энд байна:") ОГТ НЭМЭХГҮЙ.
5. Зөвхөн зассан FINAL TEXT-ийг "result" утганд буцаана.

${actionInstruction}
${toneInstruction}

Эх бичвэр:
"""
${inputContent}
"""`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              result: {
                type: Type.STRING,
                description: 'Боловсруулж зассан эцсийн албан бичвэр',
              },
            },
            required: ['result'],
          },
          temperature: 0.1,
        },
      });

      const rawResult = response.text || '';
      let resultText = inputContent;
      try {
        const parsed = JSON.parse(rawResult.trim());
        resultText = parsed.result || rawResult.trim();
      } catch (e) {
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsed = JSON.parse(jsonMatch[0]);
            resultText = parsed.result || inputContent;
          } catch {
            resultText = rawResult.trim();
          }
        } else {
          resultText = rawResult.replace(/^["']|["']$/g, '').trim();
        }
      }

      // Clean any conversational introductory text if any slipped through
      resultText = resultText
        .replace(/^(Мэдээж|Энд зассан|Зассан хувилбар|Албан найруулга)[^:]*:\s*/i, '')
        .replace(/^"""|"""$/g, '')
        .trim();

      return res.json({
        result: resultText,
        formalizedText: resultText,
      });
    } catch (error: any) {
      console.error('Error in /api/formalize:', error);
      return res.status(500).json({
        error: 'AI боловсруулах үед алдаа гарлаа. Дахин оролдоно уу.',
        details: error?.message || String(error),
      });
    }
  });

  // Health check
  app.get('/api/health', (_req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Vite middleware in development vs Static serving in production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
