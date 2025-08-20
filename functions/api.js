// functions/api.js
// 이 파일은 Cloudflare Pages Functions로 동작하며, 쿠팡파트너스 API 요청을 처리합니다.
// 이제 외부 라이브러리 없이 직접 AWS Signature V4 서명 로직을 구현합니다.

// Node.js 기본 crypto 모듈을 사용합니다.
import { createHmac, createHash } from 'crypto';

export async function onRequest(context) {
  // 쿠팡파트너스 API 호출의 기본 URL입니다.
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

  // --- AWS Signature V4 서명 로직 시작 ---
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = datetime.substring(0, 8);
  const service = 'execute-api';
  const region = 'ap-northeast-2'; // 쿠팡 API는 보통 이 리전을 사용

  function sign(key, msg) {
      return createHmac('sha256', key).update(msg).digest();
  }

  function getSignatureKey(key, dateStamp, regionName, serviceName) {
      let kDate = sign('AWS4' + key, dateStamp);
      let kRegion = sign(kDate, regionName);
      let kService = sign(kRegion, serviceName);
      let kSigning = sign(kService, 'aws4_request');
      return kSigning;
  }

  const method = 'GET';
  // 검색할 키워드와 limit 설정
  const SEARCH_KEYWORD = "2024년 롱테일 키워드 테스트";
  const SEARCH_LIMIT = 5;
  const canonicalUri = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search`;
  const queryString = `keyword=${encodeURIComponent(SEARCH_KEYWORD)}&limit=${SEARCH_LIMIT}`;

  const canonicalQueryString = queryString; // 쿼리 스트링은 이미 정렬된 상태로 가정
  const canonicalHeaders = 'host:' + new URL(COUPANG_API_BASE_URL).host + '\nx-amz-date:' + datetime + '\n';
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = createHash('sha256').update('').digest('hex'); // GET 요청이라 payload는 비어있음

  const canonicalRequest =
      method + '\n' +
      canonicalUri + '\n' +
      canonicalQueryString + '\n' +
      canonicalHeaders + '\n' +
      signedHeaders + '\n' +
      payloadHash;

  const algorithm = 'AWS4-HMAC-SHA256';
  const credentialScope = date + '/' + region + '/' + service + '/' + 'aws4_request';
  const stringToSign =
      algorithm + '\n' +
      datetime + '\n' +
      credentialScope + '\n' +
      createHash('sha256').update(canonicalRequest).digest('hex');

  const signingKey = getSignatureKey(SECRET_KEY, date, region, service);
  const signature = createHmac('sha256', signingKey).update(stringToSign).digest('hex');

  const authorizationHeader =
      algorithm + ' ' +
      'Credential=' + ACCESS_KEY + '/' + credentialScope + ', ' +
      'SignedHeaders=' + signedHeaders + ', ' +
      'Signature=' + signature;

  const headers = {
      'Content-Type': 'application/json',
      'X-Amz-Date': datetime,
      'Authorization': authorizationHeader,
  };
  // --- AWS Signature V4 서명 로직 끝 ---


  try {
    const finalUrl = COUPANG_API_BASE_URL + canonicalUri + '?' + queryString;
    const response = await fetch(finalUrl, {
      method: method,
      headers: headers,
    });

    const data = await response.json();

    // 받은 데이터를 JSON 형태로 반환
    return new Response(JSON.stringify(data, null, 2), {
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
