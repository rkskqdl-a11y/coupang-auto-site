// functions/api.js
// 이 코드는 Cloudflare Pages Functions가 쿠팡파트너스 API를 호출할 준비를 하는 거야.

export async function onRequest(context) {
  // 쿠팡파트너스 API를 호출할 기본 URL
  const COUPANG_API_BASE_URL = "https://api.coupang.com";

  // 요청 경로 추출 (예: /api/v2/...). 나중에 실제 API 경로로 쓸 거야.
  const path = context.request.url.replace(context.request.basePath, "");

  // API 키와 비밀 키는 나중에 '환경 변수'에 안전하게 저장할 거야.
  // 지금은 'TODO: 여기에 실제 키 가져오는 로직'이라고 적어둘게.
  const ACCESS_KEY = "TODO: 여기에 실제 Access Key 가져오는 로직 (환경변수)";
  const SECRET_KEY = "TODO: 여기에 실제 Secret Key 가져오는 로직 (환경변수)";

  // 만약 실제 API 키가 없다면 에러 메시지를 반환
  if (ACCESS_KEY.startsWith("TODO") || SECRET_KEY.startsWith("TODO")) {
    return new Response(JSON.stringify({ error: "API Keys are not configured." }), {
      headers: { "Content-Type": "application/json" },
      status: 500, // 서버 에러
    });
  }

  // 이제부터 실제 쿠팡파트너스 API 호출 로직이 들어갈 곳이야.
  // 이 부분은 다음에 더 자세히 알려줄게!

  // 지금은 그냥 테스트 메시지를 반환해 보자.
  return new Response("준비 완료! 이제 쿠팡 API 연동 로직을 넣을 거야!", {
    headers: { "Content-Type": "text/plain" },
  });
}
