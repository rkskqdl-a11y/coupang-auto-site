// functions/api.js
// 이 파일은 Cloudflare Pages Functions로 동작하며, 쿠팡파트너스 API 요청을 처리합니다.
// **** 임시: API Key를 코드 내부에 직접 명시하여 테스트 (보안 취약! 성공 후 즉시 환경변수 사용으로 복구해야 함!) ****

export async function onRequest(context) {
  const COUPANG_API_BASE_URL = "https://api.coupang.com";

  // ************ 중요!! 이 부분에 네 실제 Access Key와 Secret Key를 직접 넣어주세요!! ************
  // ************ 예시: const ACCESS_KEY = "내_쿠팡_Access_Key"; ************
  const ACCESS_KEY = "c801a28c-0fe4-4c56-a582-30095af6c0ee"; // !!! 너의 실제 Access Key로 변경 !!!
  const SECRET_KEY = "201818d4435475d09a9c93d4d92486eb753b0df2"; // !!! 너의 실제 Secret Key로 변경 !!!
  // ************************************************************************************************

  // --- API 키 존재 유무 검사는 삭제합니다. ---

  // 검색할 키워드와 limit 설정
  const SEARCH_KEYWORD = "2024년 롱테일 키워드 테스트";
  const SEARCH_LIMIT = 5;

  // AWS Signature V4 서명을 위한 헬퍼 함수 및 로직 (crypto 모듈 사용 없이 직접 구현한 최종 버전)
  const datetime = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const date = datetime.substring(0, 8);
  const service = 'execute-api';
  const region = 'ap-northeast-2'; // 쿠팡 API는 보통 이 리전을 사용

  function sign(key, msg) {
      const hmac = new TextEncoder().encode(msg).reduce((acc, byte) => acc.update(String.fromCharCode(byte)), createHmac('sha256', key));
      return hmac.digest();
  }

  function getSignatureKey(key, dateStamp, regionName, serviceName) {
      let kDate = sign('AWS4' + key, dateStamp);
      let kRegion = sign(kDate, regionName);
      let kService = sign(kRegion, serviceName);
      let kSigning = sign(kService, 'aws4_request');
      return kSigning;
  }

  const method = 'GET';
  const canonicalUri = `/v2/providers/affiliate_open_api/apis/openapi/v1/products/search`;
  const queryString = `keyword=${encodeURIComponent(SEARCH_KEYWORD)}&limit=${SEARCH_LIMIT}`;

  const canonicalQueryString = queryString;
  const canonicalHeaders = 'host:' + new URL(COUPANG_API_BASE_URL).host + '\nx-amz-date:' + datetime + '\n';
  const signedHeaders = 'host;x-amz-date';
  const payloadHash = new TextEncoder().encode('').reduce((acc, byte) => acc.update(String.fromCharCode(byte)), createHash('sha256')).digest('hex');

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
      new TextEncoder().encode(canonicalRequest).reduce((acc, byte) => acc.update(String.fromCharCode(byte)), createHash('sha256')).digest('hex');

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

  // Node.js 'crypto' 모듈 대신 Web 표준 Subitle Crypto API (SHA-256) 사용 (Browser 환경용)
  // Cloudflare Workers/Pages Functions는 Node.js 환경이 아닌 Web 표준 Crypto API를 사용해야 함.
  // 이 부분은 Pages Functions 환경에서 동작하도록 변경된 부분입니다.
  // 만약 createHmac, createHash가 정의되지 않았다고 에러나면 다시 알려주세요.
  async function createHmac(algo, key) {
      const cryptoKey = await crypto.subtle.importKey(
          'raw',
          new TextEncoder().encode(key),
          { name: 'HMAC', hash: 'SHA-256' },
          false,
          ['sign']
      );
      return {
          _buffer: new Uint8Array(),
          update(msg) {
              this._buffer = new Uint8Array([...this._buffer, ...new TextEncoder().encode(msg)]);
              return this;
          },
          async digest(format) {
              const signature = await crypto.subtle.sign(
                  { name: 'HMAC' },
                  cryptoKey,
                  this._buffer
              );
              return format === 'hex' ? Array.from(new Uint8Array(signature)).map(b => b.toString(16).padStart(2, '0')).join('') : new Uint8Array(signature);
          }
      };
  }

  async function createHash(algo) {
      let _buffer = new Uint8Array();
      return {
          update(msg) {
              _buffer = new Uint8Array([..._buffer, ...new TextEncoder().encode(msg)]);
              return this;
          },
          async digest(format) {
              const hashBuffer = await crypto.subtle.digest('SHA-256', _buffer);
              return format === 'hex' ? Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('') : new Uint8Array(hashBuffer);
          }
      };
  }


  try {
    const finalUrl = COUPANG_API_BASE_URL + canonicalUri + '?' + queryString;
    const response = await fetch(finalUrl, {
      method: method,
      headers: headers,
    });

    const data = await response.json();

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
