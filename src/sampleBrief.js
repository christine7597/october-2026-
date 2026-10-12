// 하드코딩 샘플 (월요일 실제 케이스). 키가 없어도 화면/연습을 확인할 수 있다.
// 2026-10-10: docs/quadbe-moldwork-reference.md 의 확인된 사실을 참고 자료로 넣고 Gemini로 생성한 결과.
export const sampleInput = {
  "company": "쿼드비 (Quad.BE)",
  "topic": "화장품 패키징 플랫폼 MOLDWORK 관련 미팅",
  "direction": "ko-en",
  "reference": "[언론 보도로 확인된 사실]\n- 회사: ㈜쿼드비 (Quad.BE Co., Ltd.), 대표 박성민. 원래 XR/3D 시각화 기술 회사로 소개됨 (2024.11 인천 XR·메타버스 투자 IR 데모데이 참가, 2025 XR & Metaverse Fair Tokyo 참가).\n- 제품: MOLDWORK(몰드웍) — 화장품 패키징 개발을 디지털로 옮기는 \"패키징 DX 플랫폼\". 회사 표현: \"마지막 아날로그(the last analog sector)를 디지털로\".\n- 기능 흐름: 전 세계 화장품 용기 패키징 검색 → 부품 조합 → 3D 시뮬레이션 → 제조 사양서(technical specification) 전달까지 하나의 워크플로우.\n- 핵심 기술: 제조사가 서로 다른 이기종 부품(용기·캡·펌프 등)의 결합 가능성(호환성)을 자동 분석·추천.\n- 해결하려는 문제: 기존 협업은 이메일·문서·실물 샘플 중심 → 반복 수정, 샘플 제작, 제조사 소통 비효율.\n- 2025.6.24 아모레퍼시픽과 MOLDWORK 정식 공급 계약 (2025.7.10 발표). 신제품 기획, 용기 디자인, 마케팅 시각화에 활용 계획. 제품 기획 → 3D 시뮬레이션 실시간 검증 → 생산 연계 → 디지털 커머스까지의 협업 모델.\n- 2026.6.17~20 파리 VIVATECH 2026 출품. 로레알, 샤넬, LVMH 관계자 부스 방문 (회사 측/언론 보도). 로레알 공급 용기 기반 \"MOLDWORK 데모 버전\" 제공해 로레알 본사와 프로젝트 가능성 논의 계획. 프랑스에서 PoC 추진 계획 (명희상 책임 인터뷰).\n- 한 프랑스 기사: 리드타임 50% 이상 단축(회사 주장 수치), 2026.5부터 아모레퍼시픽 브랜드 전반에 도입, LG생활건강 포함 국내 고객 17곳 (단일 기사 — 확인 필요).\n\n[확인 안 된 것]\n- 설립 연도, 투자 금액/투자사, 계약 금액, 과금 방식(수수료/구독), 로레알 PoC 진행 결과, 이번 미팅 상대방과 목적."
};

export const sampleBrief = {
  "summary": "쿼드비(Quad.BE)는 화장품 패키징 개발 프로세스를 3D 시뮬레이션 및 부품 호환성 분석 기술로 디지털 전환(DX)하는 플랫폼 'MOLDWORK(몰드웍)'을 개발한 기업이다.",
  "background": [
    "㈜쿼드비(대표 박성민)는 XR 및 3D 시각화 기술 기반으로 출발하여, 아날로그 중심의 화장품 패키징 시장을 디지털화하는 플랫폼 MOLDWORK를 선보였다.",
    "MOLDWORK의 핵심 기술은 제조사가 서로 다른 용기·캡·펌프 등 이기종 부품의 결합 호환성을 자동으로 분석하고 추천하는 기능이다.",
    "2025년 아모레퍼시픽과 정식 공급 계약을 체결하여 제품 기획, 용기 디자인, 실시간 검증 등 전 과정에 걸친 협업 모델을 구축했다.",
    "VIVATECH 2026 참가를 계기로 로레알 등 글로벌 뷰티 브랜드와의 PoC 추진 계획을 밝혔으나, 실제 진행 결과는 확인 필요하다.",
    "회사의 설립 연도, 누적 투자 금액, 과금 모델(구독형/수수료형), LG생활건강 포함 17개 고객사 확보 여부 및 이번 미팅 상대방은 확인 필요하다."
  ],
  "glossary": [
    {
      "en": "Quad.BE",
      "ko": "쿼드비",
      "note": "MOLDWORK를 개발한 3D/XR 기술 기반 스타트업"
    },
    {
      "en": "MOLDWORK",
      "ko": "몰드웍",
      "note": "쿼드비의 화장품 패키징 DX 플랫폼"
    },
    {
      "en": "packaging DX",
      "ko": "패키징 디지털 전환",
      "note": "아날로그 패키징 개발 전 과정을 디지털로 전환하는 것"
    },
    {
      "en": "heterogeneous parts",
      "ko": "이기종 부품",
      "note": "제조사나 규격이 서로 다른 부품군"
    },
    {
      "en": "compatibility analysis",
      "ko": "호환성 분석",
      "note": "용기, 캡, 펌프 등 부품 간 결합 가능 여부를 분석하는 기술"
    },
    {
      "en": "technical specification",
      "ko": "제조 사양서",
      "note": "금형 및 패키징 제작에 필요한 세부 규격 문서"
    },
    {
      "en": "physical sample",
      "ko": "실물 샘플",
      "note": "패키징 검증을 위해 실제로 제작하는 견본"
    },
    {
      "en": "lead time",
      "ko": "리드타임",
      "note": "제품 기획부터 실물 생산까지 소요되는 총 기간"
    },
    {
      "en": "container / bottle",
      "ko": "용기",
      "note": "내용물을 담는 본체 용기"
    },
    {
      "en": "pump dispenser",
      "ko": "펌프",
      "note": "내용물을 토출하는 펌프형 부속품"
    },
    {
      "en": "cap / closure",
      "ko": "캡",
      "note": "용기 입구를 밀폐하는 뚜껑 부품"
    },
    {
      "en": "3D simulation",
      "ko": "3D 시뮬레이션",
      "note": "가상 공간에서 패키징 결합 및 외관을 검증하는 기술"
    },
    {
      "en": "rendering",
      "ko": "렌더링",
      "note": "3D 모델을 실제 질감과 조명에 맞춰 시각화하는 과정"
    },
    {
      "en": "mold",
      "ko": "금형",
      "note": "플라스틱 용기 및 부품을 사출 성형하기 위한 틀"
    },
    {
      "en": "injection molding",
      "ko": "사출 성형",
      "note": "용융 플라스틱을 금형에 주입해 부품을 만드는 공정"
    },
    {
      "en": "proof of concept (PoC)",
      "ko": "개념 검증",
      "note": "도입 전 기술의 실현 가능성과 효과를 검증하는 단계"
    },
    {
      "en": "pilot project",
      "ko": "파일럿 프로젝트",
      "note": "정식 도입 전 소규모로 시험 적용하는 프로젝트"
    },
    {
      "en": "workflow",
      "ko": "워크플로우",
      "note": "검색부터 사양서 전달까지 이어지는 작업 흐름"
    },
    {
      "en": "tolerance",
      "ko": "공차",
      "note": "부품 결합 시 허용되는 물리적 오차 범위"
    },
    {
      "en": "primary packaging",
      "ko": "1차 포장",
      "note": "화장품 내용물과 직접 닿는 용기 및 펌프"
    },
    {
      "en": "secondary packaging",
      "ko": "2차 포장",
      "note": "단상자 등 1차 용기를 감싸는 외부 포장재"
    },
    {
      "en": "extended reality (XR)",
      "ko": "확장현실",
      "note": "가상현실과 증강현실을 아우르는 쿼드비의 기반 기술"
    }
  ],
  "flow": [
    {
      "stage": "회사 및 플랫폼 개요 소개",
      "detail": "쿼드비 기업 배경, MOLDWORK 개발 취지, 아날로그 화장품 패키징 시장의 비효율 개선 목적 설명"
    },
    {
      "stage": "핵심 기술 및 솔루션 시연",
      "detail": "글로벌 용기 검색, 이기종 부품 호환성 자동 분석, 실시간 3D 결합 시뮬레이션 및 제조 사양서 추출 과정 시연"
    },
    {
      "stage": "도입 레퍼런스 및 기대 효과 공유",
      "detail": "아모레퍼시픽 공급 사례 소개, 리드타임 단축 및 실물 샘플 제작 비용 절감 효과 논의"
    },
    {
      "stage": "협업 모델 및 질의응답",
      "detail": "플랫폼 도입 방식, 데모 버전 제공, PoC 추진 일정 및 과금 체계 등 기술/사업적 질문 답변"
    },
    {
      "stage": "향후 일정 및 다음 단계 조율",
      "detail": "실무 검토 일정, PoC 대상 프로젝트 선정, 후속 미팅 일정 확정"
    }
  ],
  "phrases": [
    {
      "ko": "MOLDWORK는 아날로그 방식에 머물러 있던 화장품 패키징 개발 프로세스를 디지털로 전환하는 플랫폼입니다.",
      "en": "MOLDWORK is a platform that digitalizes the cosmetics packaging development process, which has traditionally remained analog.",
      "when": "플랫폼 핵심 소개"
    },
    {
      "ko": "저희 핵심 기술은 제조사가 서로 다른 용기, 캡, 펌프 등 이기종 부품의 결합 호환성을 자동으로 분석하는 것입니다.",
      "en": "Our core technology automatically analyzes the compatibility of heterogeneous parts, such as bottles, caps, and pumps from different manufacturers.",
      "when": "핵심 기술 설명"
    },
    {
      "ko": "3D 시뮬레이션을 통해 실물 샘플 제작 횟수와 개발 리드타임을 대폭 단축할 수 있습니다.",
      "en": "Through 3D simulation, we can significantly reduce physical sample production and overall development lead time.",
      "when": "도입 효과 설명"
    },
    {
      "ko": "부품 검색부터 3D 검증, 제조 사양서 전달까지 단일 워크플로우로 지원합니다.",
      "en": "We support a single, seamless workflow from part discovery and 3D validation to technical specification delivery.",
      "when": "워크플로우 기능 설명"
    },
    {
      "ko": "기존 공급업체의 CAD 데이터나 부품 사양도 플랫폼에 연동할 수 있습니까?",
      "en": "Can CAD data or part specifications from our existing suppliers also be integrated into the platform?",
      "when": "상대측 호환성 질의"
    },
    {
      "ko": "본격적인 도입에 앞서 특정 브랜드 제품군을 대상으로 PoC를 먼저 진행하고 싶습니다.",
      "en": "Prior to full-scale adoption, we would like to conduct a PoC on a specific brand product line first.",
      "when": "협력 방식 제안"
    },
    {
      "ko": "방금 말씀하신 수치를 다시 한번 확인해 주시겠습니까?",
      "en": "Could you please confirm the figure you just mentioned once more?",
      "when": "수치 재확인 시"
    },
    {
      "ko": "통역을 위해 말씀 속도를 조금만 늦춰 주시면 감사하겠습니다.",
      "en": "Could you please slow down a little bit for the interpretation?",
      "when": "발화 속도 조절"
    },
    {
      "ko": "고유명사 확인을 위해 스펠링을 다시 말씀해 주시겠습니까?",
      "en": "Could you please spell out that proper noun so I can ensure accuracy?",
      "when": "고유명사 확인 시"
    },
    {
      "ko": "원활한 통역 전달을 위해 잠시 끊어서 말씀해 주시겠습니까?",
      "en": "Could you please pause for a moment so I can interpret accurately?",
      "when": "발화 끊김 요청"
    }
  ]
};
