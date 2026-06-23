복원 우선순위 분석 결과 페이지 수정 프롬프트

Create only one desktop frame.
This frame is the “복원 우선순위 분석 결과” dashboard page.
Do not create the candidate detail page, report page, loading page, or email page in this frame.

Language: Korean

Service name:
산림 복원 AI

Page context:
This is the main restoration priority analysis result page.
The system analyzed wildfire-damaged forest areas and selected the No.1 restoration priority candidate.
For this prototype, the No.1 candidate is 경상북도 의성군 복원 후보지 #1.

User flow from this page:
The user reviews the restoration priority result.
Then the user clicks “상세 분석 보기” on the No.1 candidate card or right-side panel.
After clicking it, the user moves to the candidate detail analysis page.

Design style:
Modern Korean government AI dashboard.
Professional, trustworthy, public-sector environmental monitoring platform.
Use forest green accents, white cards, soft shadows, clean grid layout, restrained rounded corners.
Do not make it look like a startup service.

Top navigation:

Logo: 산림 복원 AI
Menu: 대시보드, TOP 후보지, 분석 방법
Highlight current menu: 대시보드

Hero section:
Title:
경상북도 산림 복원 우선순위 분석 결과

Subtitle:
2025년 산불 피해지역을 대상으로 AI 기반 복원 우선순위를 산정한 결과입니다.

Main layout:
Left column:

분석 조건 card
지역: 경상북도
연도: 2025년
위험요인: 전체
AI 분석 결과 요약 card
분석 후보지: 1,842개
1등급: 126개
2등급: 248개
3등급: 517개
등급 범례 card
1등급: 즉시 복원 필요
2등급: 우선 복원 권장
3등급: 복원 검토 대상
4등급: 지속 관찰 대상
5등급: 자연 회복 가능

Center area:
Large map-style visualization titled:
경상북도 복원 후보지 분포

Show map markers:

#1 경상북도 의성군, red marker, 1등급
#2, #3, #4, #5 markers in different priority colors

Right panel:
Candidate detail summary card for the No.1 candidate.

Card title:
복원 후보지 #1

Content:

지역: 경상북도 의성군
복원 우선순위: 1등급
AI 종합 점수: 92.4점
산불 발생 연도: 2025
피해 면적: 8,200ha
복원 필요성: 매우 높음

Mini risk bars:

산불 피해도: 95%
산사태 위험도: 89%
토사유출 위험도: 84%
민가 노출도: 72%
자연 회복 가능성: 32%
생태 복원 효과: 91%

AI summary text:
산불 피해 규모가 크고, 산사태 및 토사유출 위험이 높으며, 자연 회복 가능성이 낮아 우선 복원이 필요한 지역으로 분석되었습니다.

Primary button at bottom of right panel:
상세 분석 보기

Button behavior note:
Clicking “상세 분석 보기” moves to the candidate detail analysis page for 경상북도 의성군 복원 후보지 #1.

Do not place the “AI 정책 보고서 생성” button on this dashboard page.
That button belongs to the next candidate detail analysis page.

[PAGE 2] 후보지 상세 분석 페이지 수정 프롬프트

Create only one desktop frame.
This frame is the “후보지 상세 분석” page.
Do not create the dashboard page, loading page, policy report page, or email draft page in this frame.

Language: Korean

Service name:
산림 복원 AI

Page context:
The user came from the restoration priority dashboard by clicking “상세 분석 보기” on the No.1 candidate.
This page explains why 경상북도 의성군 복원 후보지 #1 was selected as the top restoration priority.
After reviewing the detailed analysis, the user can click “AI 정책 보고서 생성” to create a policy report.

Important UX instruction:
Add a clear “AI 정책 보고서 생성” button on this candidate detail analysis page.
This button should not appear on the main dashboard page.
This button should move the user to the AI policy report loading page.

Design style:
Modern Korean government AI dashboard.
Professional, formal, trustworthy.
Use forest green, white cards, soft shadows, clean grid, restrained rounded corners.
Do not make it look like a startup service.

Top navigation:

Logo: 산림 복원 AI
Back link: 대시보드로 돌아가기

Hero section:
Dark forest-green hero banner.

Title:
후보지 상세 분석

Subtitle:
AI가 선정한 복원 우선순위 후보지에 대한 상세 분석 결과입니다.

Candidate identity row:

경상북도 의성군
복원 후보지 #1
전국 분석 결과 1순위
복원 우선순위 1등급

Add a top-right CTA button in the hero section:
AI 정책 보고서 생성

Button style:
Primary forest-green button with document icon.
Place it clearly on the right side of the hero or directly below the summary cards.
This is the main action button of the page.

Top summary cards:

복원 우선등급: 1등급
AI 종합 점수: 92.4점
피해 면적: 8,200ha
복원 시급성: 매우 높음

Below the summary cards, add a CTA card:
Title:
정책 실행 지원

Description:
상세 분석 결과를 바탕으로 정책 담당자용 AI 보고서를 생성할 수 있습니다.

Button:
AI 정책 보고서 생성

Main content sections:

위성영상 비교 분석
산불 전·후 위성영상 비교
Before / After comparison visual
Text labels: 산불 발생 전, 산불 발생 후
주요 위험요인 분석
Display risk factor cards:
산사태 위험: 높음
토사유출 위험: 높음
집중호우 위험: 높음
민가 노출 위험: 중간
급경사 위험: 중간
세부 위험도 평가
Show horizontal progress bars:
산불 피해도: 95%
산사태 위험도: 89%
토사유출 위험도: 84%
민가 노출도: 72%
도로 노출도: 68%
자연 회복 가능성: 32%
생태 복원 효과: 91%
AI 분석 결과
Use a large formal white card.
Paragraph:
해당 지역은 2025년 대형 산불로 인해 광범위한 식생 훼손이 발생한 지역으로 분석되었습니다. AI 모델 분석 결과, 산불 피해도와 산사태 위험도, 토사유출 위험도가 모두 높게 나타났으며, 자연 회복 가능성은 낮게 분석되었습니다. 이에 따라 해당 지역은 복원 우선순위 1등급 지역으로 선정되었습니다.

At the bottom of this AI analysis card, add another primary button:
AI 정책 보고서 생성

AI 기반 복원 권장 조치
Use vertical timeline:
1단계 응급 복원 단계
2단계 재해 예방 단계
3단계 생태 복원 단계
4단계 사후 관리 단계
복원 효과 시뮬레이션
Show cards:
산사태 위험도: 89 → 54, 39% 감소
토사유출 위험도: 84 → 48, 43% 감소
민가 피해 위험: 72 → 41, 43% 감소
예상 복원 기간: 5~7년
생태 복원 지수: +35%
탄소흡수량 증가: +18%
위치 및 주변 환경
Show simplified map-style diagram:
복원 후보지 marker
민가
도로
하천
산사태 위험지역
Distance list:
민가까지 거리: 1.2km
주요 도로까지 거리: 850m
하천까지 거리: 620m
2차 재해 발생 가능성: 높음

Button behavior note:
Clicking “AI 정책 보고서 생성” moves to the separate loading page:
AI 정책 보고서 생성 중