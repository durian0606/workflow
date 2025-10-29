// api/directions.js (Vercel Serverless function)
export default async function handler(req, res) {
  try {
    const K = process.env.KAKAO_REST_KEY;
    if (!K) return res.status(500).json({ error: 'Missing KAKAO_REST_KEY' });

    const origin = req.query.origin;       // "lng,lat"
    const destination = req.query.destination; // "lng,lat"
    if (!origin || !destination) {
      return res.status(400).json({ error: 'origin and destination required' });
    }

    const url = `https://apis-navi.kakaomobility.com/v1/directions?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&priority=RECOMMEND`;

    const r = await fetch(url, {
      method: 'GET',
      headers: { Authorization: `KakaoAK ${K}` }
    });

    const data = await r.text(); // 텍스트로 가져와 그대로 전달 (JSON 또는 에러 메시지)
    res.status(r.ok ? 200 : 500).setHeader('Content-Type', 'application/json').send(data);
  } catch (e) {
    res.status(500).json({ error: e.message || 'server error' });
  }
}
