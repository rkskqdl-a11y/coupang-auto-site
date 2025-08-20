// functions/api.js
// 이 파일은 Cloudflare Pages Functions로 동작하며, 쿠팡파트너스 API 요청을 처리할 준비를 합니다.

export async function onRequest(context) {
  // 쿠팡파트너스 API 호출의 기본 URL입니다.
  const COUPANG_API_BASE_URL = "https://api.coupang.com";

  // 요청 경로를 추출합니다. 예를 들어, /api/v2/... 와 같은 경로를 사용하게 됩니다.
  const path = context.request.url.replace(context.request.basePath, "");

  // Cloudflare Pages 환경 변수에서 Access Key와 Secret Key를 가져옵니다.
  // 이 변수들은 반드시 Cloudflare Pages 설정에서 COUPANG_ACCESS_KEY 와 COUPANG_SECRET_KEY 로 정의되어 있어야 합니다.
  const ACCESS_KEY = context.env.COUPANG_ACCESS_KEY;
  const SECRET_KEY = context.env.COUPANG_SECRET_KEY;

  // 만약 API 키가 설정되지 않았다면 에러 메시지를 반환합니다.
  // 이 메시지는 Cloudflare Pages 환경 변수가 올바르게 설정되었는지 확인하는 용도입니다.
  if (!ACCESS_KEY || !SECRET_KEY) { // <-- 이제 TODO 검사 대신 실제 값이 있는지 검사합니다.
    return new Response(JSON.stringify({ error: "API Keys are not configured. Please check Cloudflare Pages Environment Variables." }), {
      headers: { "Content-Type": "application/json" },
      status: 500, // 서버 내부 에러를 나타냅니다.
    });
  }

  // **** 중요: 여기에 실제 쿠팡파트너스 API 호출 로직이 들어갈 예정입니다. ****
  // 지금은 단순히 환경 변수가 잘 로드되는지 확인하는 단계입니다.

  // 모든 설정이 정상적으로 되었다면 이 메시지가 출력됩니다.
  return new Response("API 키 설정 성공! 이제 쿠팡파트너스 API 로직을 여기에 추가할 수 있습니다.", {
    headers: { "Content-Type": "text/plain" },
  });
}
