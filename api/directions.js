// api/directions.js
export default async function handler(req, res) {
  // CORS 헤더 설정
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { origin, destination } = req.query;
  
  if (!origin || !destination) {
    return res.status(400).json({ error: 'Missing origin or destination' });
  }
  
  // Vercel 환경변수에서 API 키 가져오기
  const KAKAO_API_KEY = process.env.KAKAO_REST_API_KEY;
  
  if (!KAKAO_API_KEY) {
    return res.status(500).json({ error: 'API key not configured' });
  }
  
  try {
    const kakaoUrl = `https://apis-navi.kakaomobility.com/v1/directions?origin=${origin}&destination=${destination}`;
    
    const response = await fetch(kakaoUrl, {
      headers: {
        'Authorization': `KakaoAK ${KAKAO_API_KEY}`
      }
    });
    
    if (!response.ok) {
      throw new Error(`Kakao API returned ${response.status}`);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
    
  } catch (error) {
    console.error('Directions API Error:', error);
    return res.status(500).json({ 
      error: 'Failed to get directions',
      message: error.message 
    });
  }
}
