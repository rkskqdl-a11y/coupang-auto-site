// functions/api.js
export async function onRequest(context) {
  // 이 친구는 /api 라는 주소로 찾아오면 응답할 거야.
  // 나중에 쿠팡파트너스 아저씨랑 통화하는 방법을 알려줄게!

  return new Response("Hello from Functions!", {
    headers: { "Content-Type": "text/plain" },
  });
}
