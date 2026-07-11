# 학원 관리 시스템 (신입생 등록)

React(Vite) + Supabase + Notion 연동 웹앱입니다.

- 첫 화면: **Student** / **Manager** 선택
- **Student**: 신입생 정보 입력 → Supabase 저장 + Notion 자동 동기화
- **Manager**: 비밀번호 입력 후 Supabase에 쌓인 신입생 목록 조회/검색

## 폴더 구조

```
academy-app/
  src/
    pages/
      Home.jsx            # 첫 화면 (Student/Manager 선택)
      StudentRegister.jsx # 신입생 등록 폼
      Manager.jsx          # 등록 현황 조회 (비밀번호 보호)
    supabaseClient.js      # Supabase 클라이언트 초기화
    App.jsx / main.jsx / index.css
  supabase/
    schema.sql              # students 테이블 생성 SQL
    functions/notion-sync/  # Notion 저장용 Edge Function (Deno)
  .github/workflows/deploy.yml  # GitHub Pages 자동 배포
  .env.example
```

## 1. Supabase 프로젝트 만들기

1. [supabase.com](https://supabase.com) 가입 후 **New project** 생성
2. 좌측 메뉴 **SQL Editor** → `supabase/schema.sql` 내용을 붙여넣고 실행 (students 테이블 + RLS 정책 생성)
3. **Project Settings > API**에서 `Project URL`, `anon public key`를 확인 → `.env` 파일에 입력

> RLS 정책은 익명(anon) 키로 등록(insert)과 조회(select)를 모두 허용합니다. Manager 화면은 비밀번호로만 막혀 있어 완전한 서버 인증은 아닙니다. 더 강한 보안이 필요하면 Supabase Auth 로그인으로 교체하고 select 정책을 `authenticated` role로 제한하세요.

## 2. Notion 연동 설정

1. [notion.so/my-integrations](https://www.notion.so/my-integrations) 에서 **New integration** 생성 → Internal Integration Secret 복사
2. Notion에 신입생 정보를 저장할 데이터베이스를 새로 만들고, 아래 속성(property)을 **정확히 같은 이름**으로 추가하세요.

   | 속성명 | 타입 |
   |---|---|
   | 이름 | 제목(Title) |
   | 생년월일 | 날짜(Date) |
   | 연락처 | 텍스트 |
   | 보호자 연락처 | 텍스트 |
   | 이메일 | 이메일 |
   | 신청과목 | 텍스트 |
   | 주소 | 텍스트 |
   | 메모 | 텍스트 |

3. 해당 데이터베이스 우측 상단 **"..." > Connections**에서 방금 만든 integration을 연결
4. 데이터베이스 URL에서 32자리 ID를 복사 (Database ID)

## 3. Supabase Edge Function 배포 (Notion 저장 담당)

Notion API 키는 브라우저에 노출되면 안 되므로, Supabase Edge Function에서만 사용합니다.

```bash
npm install -g supabase
supabase login
supabase link --project-ref <your-project-ref>

# Notion 키를 Edge Function의 secret으로 등록 (브라우저에는 노출되지 않음)
supabase secrets set NOTION_API_KEY=secret_xxx
supabase secrets set NOTION_DATABASE_ID=xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

supabase functions deploy notion-sync
```

## 4. 로컬 개발 환경 실행

```bash
cd academy-app
cp .env.example .env   # 값 채워넣기
npm install
npm run dev
```

`.env`에 필요한 값:

```
VITE_SUPABASE_URL=https://xxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
VITE_MANAGER_PASSWORD=change-me
```

## 5. GitHub Pages로 배포

1. GitHub에 새 저장소를 만들고 이 프로젝트를 push
2. 저장소 **Settings > Secrets and variables > Actions**에서 아래 3개 secret 등록:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_MANAGER_PASSWORD`
3. 저장소 **Settings > Pages > Build and deployment > Source**를 **GitHub Actions**로 설정
4. `main` 브랜치에 push하면 `.github/workflows/deploy.yml`이 자동으로 빌드/배포합니다

배포 후 `https://<username>.github.io/<repo>/#/` 형태로 접속됩니다 (HashRouter 사용).

## 참고 사항

- 이 저장소 자체를 실행하려면 `npm install`이 필요합니다 (현재 작업 환경은 외부 npm 레지스트리 접근이 막혀 있어 로컬에서 직접 설치/빌드 확인이 필요합니다).
- Notion 동기화가 실패해도 Supabase 저장은 그대로 성공 처리됩니다 (Supabase가 주 데이터베이스, Notion은 보조 백업/열람용).
