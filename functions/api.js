// functions/api.js
// 이 파일은 Cloudflare Pages Functions로 동작하며, 쿠팡파트너스 API 요청을 처리합니다.
// **** 서명(Signature) 없이 API 호출을 시도합니다. (빌드 테스트용) ****

export async function onRequest(context) {
  const COUPANG_API_BASE_URL = "https://api.coupang.com";

  const ACCESS_KEY = context.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = context.env.COANG_SECRET_KEY; // 이 값은 실제 사용되지 않습니다.

  // API 키 설정이 안 되었으면 에러 메시지
  if (!ACCESS_KEY || !SECRET_KEY) {
    return new Response(JSON.stringify({ error: "API Keys are not configured. Please check Cloudflare Pages Environment Variables." }), {
      headers: { "Content-Type": "application/json" },
      status: 500,
    });
  }

  // **** 중요: 검색할 키워드를 여기에 설정합니다. ****
  const SEARCH_KEYWORD = "아무 키워드나 테스트"; // 테스트용
  const SEARCH_LIMIT = 5;

  // 쿠팡파트너스 검색 API 경로 (서명 없이 단순 호출 시도)
  const path = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search?keyword=${encodeURIComponent(SEARCH_KEYWORD)}&limit=${SEARCH_LIMIT}`;
  const finalUrl = COUPANG_API_BASE_URL + path;

  try {
    // 서명 없이 쿠팡파트너스 API로 요청을 보냅니다.
    // 이 요청은 아마 실패할 것입니다. (보안 서명이 없기 때문)
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
        // 'Authorization' 헤더가 없습니다. 이것 때문에 실패할 것입니다.
      },
    });

    const data = await response.json();

    // 받은 데이터를 JSON 형태로 반환
    return new Response(JSON.stringify({
        message: "API 호출은 시도됨 (서명 없음).",
        api_response: data
    }, null, 2), {
      headers: { "Content-Type": "application/json;charset=utf-8" },
      status: response.status,
    });

  } catch (error) {
    console.error("Error calling Coupang API without signature:", error);
    return new Response(JSON.stringify({ error: "API 호출 중 오류 발생 (서명 없음)", details: error.message }), {
      headers: { "Content-Type": "application/json;charset=utf-8" },
      status: 500,
    });
  }
}
