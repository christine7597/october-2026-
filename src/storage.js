// 저장은 브라우저 localStorage만 사용. (시크릿 창 등에서 막혀도 앱은 동작)
const KEY = 'brief-buddy:v1';

export function loadState() {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || null;
  } catch {
    return null;
  }
}

export function saveState(state) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    // 저장 실패해도 무시
  }
}
