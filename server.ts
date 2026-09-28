import express, { Request, Response } from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
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

  // API endpoint for formalizing Mongolian official document text
  app.post('/api/formalize', async (req: Request, res: Response) => {
    try {
      const {
        mode = 'personal', // 'personal' | 'corporate'
        docType = 'Өргөдөл',
        recipient = '',
        sender = '',
        companyName = '',
        signatoryTitle = '',
        roughText = '',
        duration = '',
        tone = 'standard', // 'government' | 'b2b' | 'respectful' | 'standard'
        action = 'formalize', // 'formalize' | 'shorten' | 'expand' | 'grammar' | 'suggest_title'
      } = req.body;

      if (!roughText || typeof roughText !== 'string' || !roughText.trim()) {
        return res.status(400).json({
          error: 'Ноорог текст оруулна уу.',
        });
      }

      if (!ai) {
        // Fallback rule-based formalization if API key is temporarily unavailable
        let fallbackText = '';
        if (action === 'grammar') {
          fallbackText = roughText.trim();
        } else if (docType.includes('АКТ')) {
          fallbackText = `Монгол Улсын Нягтлан бодох бүртгэлийн хууль тогтоомж болон байгууллагын дотоод журмыг үндэслэн ${sender ? sender + ' нь ' : ''}${roughText.trim()}.\n\nДээр дурдсан эд хөрөнгө, ажил үүргийг шалган бүрэн бүтэн, ажиллагааны доголдолгүй, харилцан маргаангүйгээр хүлээлцсэнийг энэхүү актаар баталгаажуулав.`;
        } else if (docType.includes('ИТГЭМЖЛЭЛ')) {
          fallbackText = `Монгол Улсын Иргэний хуулийн холбогдох зүйлийг үндэслэн ${sender ? sender + ' нь ' : ''}${roughText.trim()}.\n\nЭнэхүү итгэмжлэлийг хуульд заасан үндэслэл, журмын дагуу олгосон бөгөөд хууль зүйн үр дагаврыг бүрэн хариуцна.`;
        } else if (docType.includes('ХУРЛЫН ТЭМДЭГЛЭЛ')) {
          fallbackText = `ХУРЛААР ХЭЛЭЛЦСЭН АСУУДАЛ БА ШИЙДВЭР:\n\n${roughText.trim()}.\n\nХурлаас гарсан шийдвэрийн биелэлтэд хяналт тавьж ажиллахыг холбогдох алба, үүрэг хариуцагч нарт даалгав.`;
        } else if (docType.includes('БАТАЛГАА')) {
          fallbackText = `Талуудын хооронд байгуулсан гэрээ, үүргийн харилцааг үндэслэн ${roughText.trim()}.\n\nТөлбөр төлөх хугацааг чанд баримтлах бөгөөд зөрчсөн тохиолдолд хуулийн дагуу хариуцлага хүлээхийг үүгээр үл маргах журмаар батлан дааж байна.`;
        } else if (mode === 'corporate') {
          fallbackText = `Энэхүү албан бичгээр танай хамт олонд энэ өдрийн амар амгаланг айлтган мэндчилье.\n\n${companyName ? companyName + ' нь ' : ''}${roughText.trim()}.\n\nБидний тавьж буй асуудлыг хүлээн авч, зохих журмын дагуу шийдвэрлэн хамтран ажиллана гэдэгт итгэлтэй байна.\n\nХүндэтгэсэн, ${signatoryTitle || 'Гүйцэтгэх захирал'} ${sender || ''}`;
        } else {
          fallbackText = `Миний бие ${sender ? sender + ' нь ' : ''}${roughText.trim()}.\n\nИймд энэхүү хүсэлтийг минь хүлээн авч, холбогдох журмын дагуу шийдвэрлэж өгнө үү.`;
        }

        return res.json({
          formalizedText: fallbackText,
          formalEnding: 'Шийдвэрлэж өгнө үү.',
          suggestedTitle: docType,
          keyChanges: [
            'Албан хэрэг хөтлөлтийн стандартын дагуу найруулав.',
          ],
        });
      }

      let actionInstruction = '';
      if (action === 'grammar') {
        actionInstruction = 'Үйлдэл: МОНГОЛ ХЭЛНИЙ ЗӨВ БИЧГИЙН ДҮРЭМ, ҮГ ҮСГИЙН АЛДААГ ШАЛГАЖ ЗАСАХ. Текстийн утга санаа, бүтцийг өөрчлөхгүйгээр зөвхөн үг, нөхцөл, цэг таслал, дүрмийн алдааг нямбай засна.';
      } else if (action === 'shorten') {
        actionInstruction = 'Үйлдэл: ТЕКСТИЙГ БОГИНОСГОХ / ТОВЧЛОХ. Илүүц үг хэллэг, нуршсан өгүүлбэрийг хасаж, хамгийн гол агуулга, санал, шаардлагыг товч бөгөөд тодорхой болгоно.';
      } else if (action === 'expand') {
        actionInstruction = 'Үйлдэл: ДЭЛГЭРҮҮЛЭХ. Агуулгын үндэслэл, шалтгаан, үр дагавар, холбогдох зохицуулалтыг мэргэжлийн түвшинд баяжуулан дэлгэрүүлж бичнэ.';
      } else if (action === 'suggest_title') {
        actionInstruction = 'Үйлдэл: Баримт бичгийн агуулгад тохирох оновчтой, албан ёсны гарчиг болон дэд гарчгийг санал болгох.';
      } else {
        actionInstruction = 'Үйлдэл: АЛБАН НАЙРУУЛГА ХИЙХ. Хэрэглэгчийн энгийн, ярианы эсвэл ноорог байдлаар бичсэн текстийг Монгол хэлний албан хэрэг хөтлөлтийн стандартын дагуу мэргэжлийн албан бичгийн найруулгад шилжүүлнэ.';
      }

      let toneInstruction = '';
      if (tone === 'government') {
        toneInstruction =
          'Найруулгын өнгө аяс: ТӨРИЙН БАЙГУУЛЛАГА, ЯАМ, АГЕНТЛАГТ хандсан албан ёсны хатуу, хууль эрх зүйн үндэслэл бүхий өндөр зэрэглэлийн найруулгатай байх.';
      } else if (tone === 'b2b') {
        toneInstruction =
          'Найруулгын өнгө аяс: ТҮНШ БАЙГУУЛЛАГА, ХАРИЛЦАГЧ КОМПАНИД хандсан бизнесийн (B2B) соёлтой, харилцан ашигтай хамтын ажиллагааг эрхэмлэсэн, найрсаг бөгөөд ажил хэрэгч хэлбэртэй байх.';
      } else if (tone === 'respectful') {
        toneInstruction =
          'Найруулгын өнгө аяс: ХҮНДЭТГЭЛТЭЙ, ЗӨӨЛӨН - Дээд албан тушаалтан болон түнш байгууллагад онцгой хүндэтгэл илэрхийлсэн дипломат зөөлөн хэлбэртэй байх.';
      } else {
        toneInstruction =
          'Найруулгын өнгө аяс: Албан хэрэг хөтлөлтийн стандартын дагуу байгууллагын болон иргэний албан ёсны бичгийн ердийн хэв маягтай байх.';
      }

      let structureRequirement = '';
      if (docType.includes('АКТ')) {
        structureRequirement = `
Хүлээлцэх актын бүтэц:
1. Монгол Улсын Нягтлан бодох бүртгэлийн тухай хууль болон холбогдох журмыг үндэслэх.
2. Хүлээлгэн өгсөн тал болон хүлээн авсан талуудын нэр, албан тушаал, хүлээлцсэн зорилго, үндэслэлийг тодорхой дурдах.
3. Эд хөрөнгө, ажил үүргийг бүрэн бүтэн, ажиллагааны доголдолгүй, харилцан маргаангүйгээр шалган хүлээлцсэнийг баталгаажуулах.`;
      } else if (docType.includes('ИТГЭМЖЛЭЛ')) {
        structureRequirement = `
Итгэмжлэлийн бүтэц:
1. Монгол Улсын Иргэний хуулийн 62, 64 дүгээр зүйлийн холбогдох заалтыг үндэслэх.
2. Итгэмжлэгч болон Итгэмжлэгдэгчийн овог нэр, регистрийн дугаарыг дурдах.
3. Олгож буй эрх хэмжээ, гүйцэтгэх үйл ажиллагааг (1, 2, 3 гэх мэтээр) тодорхой заах.
4. Итгэмжлэлийн хүчинтэй байх хугацаа болон бусдад дамжуулан итгэмжлэх эрхтэй эсэхийг тодорхой тусгах.`;
      } else if (docType.includes('ХУРЛЫН ТЭМДЭГЛЭЛ')) {
        structureRequirement = `
Хурлын тэмдэглэлийн бүтэц:
1. Хурлын сэдэв, хэлэлцсэн гол асуудлуудыг нэгтгэн дурдах.
2. Хэлэлцүүлгийн гол санаа, гаргасан тодорхой шийдвэрүүдийг (1, 2, 3 гэсэн дугаарлалтаар) албаны хэлбэрээр эмх цэгцтэй бичих.`;
      } else if (docType.includes('БАРАГДУУЛАХ') || docType.includes('ШААРДАХ') || docType.includes('БАТАЛГАА')) {
        structureRequirement = `
Төлбөрийн шаардлага / Баталгааны хуудасны бүтэц:
1. Талуудын хоорондын гэрээ, үүргийн үндэслэлийг заах.
2. Төлбөрийн үлдэгдэл дүн, төлөх эцсийн хугацааг тодорхой заах.
3. Хугацаа хэтрүүлбэл тооцох хариуцлага, алданги болон хууль ёсны эрх зүйн үр дагаврыг дурдах.`;
      } else if (mode === 'corporate') {
        structureRequirement = `
Компанийн албан бичгийн бүтэц:
1. Эхлэлийн мэндчилгээ: "Энэхүү албан бичгээр танай хамт олонд энэ өдрийн мэндийг дэвшүүлье..." эсвэл "Танай байгууллагын хамт олонд энэ өдрийн амар амгаланг айлтган мэндчилье..." гэсэн албан ёсны мэндчилгээгээр эхлэх.
2. Үндэслэл, агуулга: Хамтын ажиллагааны үндэслэл, гэрээний нөхцөл, бизнесийн шаардлага, шалтгааныг тодорхой дурдах.
3. Гол санал / Хүсэлт: Тавьж буй санал, шаардлага эсвэл хүсэлтийг маш тодорхой (шаардлагатай бол 1, 2, 3 гэсэн дугаарлалтаар) томьёолох.
4. Төгсгөлийн хэллэг: "Бидний хүсэлтийг судалж шийдвэрлэнэ гэдэгт итгэлтэй байна. Хамтран ажилласанд талархал илэрхийлье." гэх мэт албаны ёсны хүндэтгэлээр өндөрлөх.`;
      } else {
        structureRequirement = `
Иргэн / Ажилтны өргөдөл, хүсэлтийн бүтэц:
1. "Миний бие [Овог нэр, албан тушаал] нь..." гэсэн албан хэллэгээр эхлэх.
2. Чөлөө, хүсэлт гаргах болсон бодит шалтгаан, нөхцөл байдал, холбогдох хугацаа, ажлаа хэнд хүлээлгэн өгсөн эсэхийг тодорхой дурдах.
3. Төгсгөлд нь "Иймд миний хүсэлтийг хүлээн авч, зохих журмын дагуу шийдвэрлэж өгнө үү." гэж ёсчлон төгсгөх.`;
      }

      const prompt = `Чи бол Монгол хэлний албан хэрэг хөтлөлт, байгууллагын захиргааны бичиг хэргийн найруулгын мэргэжилтэн.
Монгол Улсад мөрдөгдөж буй албан хэрэг хөтлөлтийн стандартын дагуу төгс найруулгатай албан бичвэр боловсруулна.

${actionInstruction}

Хэлбэр: ${mode === 'corporate' ? 'Компани / ААН-ийн албан бичиг' : 'Иргэн / Ажилтны өргөдөл хүсэлт'}
Баримт бичгийн төрөл: ${docType}
Хүлээн авагч (Хэнд): ${recipient || 'Тодорхойгүй'}
${companyName ? `Илгээгч байгууллага: ${companyName}` : ''}
Гаргагч / Хариуцагч (Хэнээс): ${sender || 'Тодорхойгүй'}
${signatoryTitle ? `Албан тушаал: ${signatoryTitle}` : ''}
${duration ? `Холбогдох хугацаа: ${duration}` : ''}
${toneInstruction}

${structureRequirement}

Хэрэглэгчийн эх бичвэр:
"""
${roughText}
"""

Тавигдах шаардлага:
1. Монгол хэлний зөв бичих дүрэм, найруулга зүйн дагуу албан ёсны үг хэллэгээр найруулах.
2. Хэрэглэгчийн утга санааг дур мэдэн өөрчлөхгүй, найруулгын түвшинг сайжруулна.
3. Хариуг ЗААВАЛ дараах JSON форматаар буцаана уу. JSON-оос өөр ямар ч текст бичиж болохгүй.

{
  "formalizedText": "Шинэчилсэн их бие текст...",
  "formalEnding": "Төгсгөлийн албан хэллэг",
  "suggestedTitle": "${docType}",
  "keyChanges": [
    "Хэрэгжүүлсэн сайжруулалт 1",
    "Хэрэгжүүлсэн сайжруулалт 2"
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          temperature: 0.3,
        },
      });

      const rawResult = response.text || '';
      let parsed;
      try {
        parsed = JSON.parse(rawResult.trim());
      } catch (e) {
        // In case JSON parsing is slightly off, clean and recover
        const jsonMatch = rawResult.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[0]);
        } else {
          parsed = {
            formalizedText: rawResult.trim(),
            formalEnding: 'Шийдвэрлэж өгнө үү.',
            keyChanges: ['Найруулгыг сайжруулав'],
          };
        }
      }

      return res.json(parsed);
    } catch (error: any) {
      console.error('Error formalizing text with Gemini:', error);
      return res.status(500).json({
        error:
          'Албан найруулга хийх явцад алдаа гарлаа. Та дахин оролдоно уу.',
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
