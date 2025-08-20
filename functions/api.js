// functions/api.js
// 이 파일은 Cloudflare Pages Functions로 동작합니다.

export async function onRequest(context) {
  // 간단한 테스트 메시지를 반환합니다.
  return new Response("Functions is running! (No API call yet)", {
    headers: { "Content-Type": "text/plain;charset=utf-8" },
  });
}
