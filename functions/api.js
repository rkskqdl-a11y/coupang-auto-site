// functions/api.js
// 이 파일은 Cloudflare Pages Functions로 동작하며, 쿠팡파트너스 API 요청을 처리합니다.
// aws4fetch 라이브러리를 사용하여 AWS Signature V4 서명을 처리합니다.

import { AwsClient } from 'aws4fetch'; // aws4fetch 라이브러리 import

export async function onRequest(context) {
  const COUPANG_API_BASE_URL = "https://api.coupang.com";

  // Cloudflare Pages 환경 변수에서 Access Key와 Secret Key를 가져옵니다.
  const ACCESS_KEY = context.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = context.env.COUPANG_SECRET_KEY;

  // 만약 API 키가 설정되지 않았다면 에러 메시지를 반환합니다.
  if (!ACCESS_KEY || !SECRET_KEY) {
    return new Response(JSON.stringify({ error: "API Keys are not configured. Please check Cloudflare Pages Environment Variables." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  // aws4fetch 클라이언트 초기화 (Access Key, Secret Key를 사용)
  // service는 'execute-api'로 설정하며, region은 'ap-northeast-2'로 설정
  const aws = new AwsClient({
    accessKeyId: ACCESS_KEY,
    secretAccessKey: SECRET_KEY,
    service: 'execute-api',
    region: 'ap-northeast-2'
  });

  // **** 중요: 검색할 키워드를 여기에 설정합니다. ****
  // 롱테일 키워드 예시: "2024년 다이슨 무선청소기 V11 부품"
  const SEARCH_KEYWORD = "아이폰 15 pro max 케이스"; // 테스트용 롱테일 키워드!
  const SEARCH_LIMIT = 5; // 검색 결과는 최대 5개만 가져올게.

  // 쿠팡파트너스 검색 API 경로
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(SEARCH_KEYWORD)}&limit=${SEARCH_LIMIT}`;
  const finalUrl = COUPANG_API_BASE_URL + path;

  try {
    // aws4fetch 클라이언트를 사용하여 서명된 요청을 보냅니다.
    const response = await aws.fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
    });

    // 쿠팡 API로부터 받은 응답을 JSON 형태로 파싱합니다.
    const data = await response.json();

    // 받은 데이터를 웹 브라우저에 JSON 형태로 반환합니다.
    return new Response(JSON.stringify(data, null, 2), { // 보기 좋게 들여쓰기해서 반환
      headers: { "Content-Type": "application/json;charset=utf-8" },
      status: response.status,
    });

  } catch (error) {
    console.error("Error calling Coupang API:", error);
    return new Response(JSON.stringify({ error: "Failed to call Coupang API", details: error.message }), {
      headers: { "Content-Type": "application/json;charset=utf-8" },
      status: 500,
    });
  }
}
