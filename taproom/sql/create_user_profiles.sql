-- 创建用户配置文件表
create table public.user_profiles (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references auth.users(id) on delete cascade,
  username text,
  role text check (role in ('SUPER_ADMIN', 'STORE_ADMIN', 'STORE_EMPLOYEE')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- 创建更新时间触发器
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_user_profiles_updated_at
  before update on user_profiles
  for each row
  execute function update_updated_at_column();

-- 设置RLS策略
alter table public.user_profiles enable row level security;

-- 创建策略
create policy "Users can view their own profile"
  on public.user_profiles for select
  using (auth.uid() = user_id);

create policy "Super admins can view all profiles"
  on public.user_profiles for select
  using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'SUPER_ADMIN'
    )
  );

create policy "Super admins can insert profiles"
  on public.user_profiles for insert
  with check (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'SUPER_ADMIN'
    )
  );

create policy "Super admins can update profiles"
  on public.user_profiles for update
  using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'SUPER_ADMIN'
    )
  );

create policy "Super admins can delete profiles"
  on public.user_profiles for delete
  using (
    exists (
      select 1 from public.user_profiles
      where user_id = auth.uid() and role = 'SUPER_ADMIN'
    )
  ); 