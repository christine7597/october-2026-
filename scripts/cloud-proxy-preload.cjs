// 클라우드(Claude Code) 컨테이너 전용. 일반 PC에서는 필요 없음.
// OpenTelemetry 내보내기(neatlogs SDK)는 자체 https.Agent를 만들어 HTTPS_PROXY를 무시하고 직접 나간다.
// 이 컨테이너에서는 프록시를 거쳐야 API 키가 붙으므로, 새로 만드는 Agent에 프록시 설정을 넣어 준다.
const https = require('https');
if (process.env.HTTPS_PROXY && process.env.NODE_USE_ENV_PROXY && !https.Agent.__proxyPatched) {
  const Orig = https.Agent;
  class ProxyEnvAgent extends Orig {
    constructor(opts = {}) {
      super(opts.proxyEnv ? opts : { ...opts, proxyEnv: process.env });
    }
  }
  ProxyEnvAgent.__proxyPatched = true;
  https.Agent = ProxyEnvAgent;
}
