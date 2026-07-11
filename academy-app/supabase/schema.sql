-- Supabase SQL Editor에서 그대로 실행하세요.

create table if not exists students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  birth_date date,
  phone text not null,
  guardian_phone text,
  email text,
  course text,
  address text,
  notes text,
  created_at timestamptz not null default now()
);

alter table students enable row level security;

-- 등록 폼(익명 사용자)이 새 학생 데이터를 추가할 수 있도록 허용
create policy "Allow public insert" on students
  for insert
  to anon
  with check (true);

-- Manager 화면(익명 anon key + 클라이언트 비밀번호 확인)에서 목록을 읽을 수 있도록 허용
-- 주의: 이 정책은 anon key만 있으면 누구나 조회할 수 있다는 뜻입니다.
-- 더 강한 보안이 필요하면 Supabase Auth를 도입해 select 정책을 authenticated role로 제한하세요.
create policy "Allow public read" on students
  for select
  to anon
  using (true);
