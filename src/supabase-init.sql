-- ============================================
-- AI美食大师 - Supabase数据库初始化脚本
-- ============================================
-- 用途: 创建美食社区所需的数据库表和策略
-- 执行方式: 在Supabase SQL Editor中执行此脚本
-- ============================================

-- 1. 创建用户菜品表
-- ============================================
CREATE TABLE IF NOT EXISTS user_dishes (
                                           id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    recipe_id TEXT NOT NULL,
    recipe_name TEXT NOT NULL,
    cuisine TEXT,
    ingredients JSONB NOT NULL DEFAULT '[]'::jsonb,
    steps JSONB NOT NULL DEFAULT '[]'::jsonb,
    cooking_tips TEXT,
    difficulty TEXT,
    cooking_time TEXT,
    user_notes TEXT,
    user_name TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

-- 2. 创建用户评论表
-- ============================================
CREATE TABLE IF NOT EXISTS user_comments (
                                             id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_name TEXT NOT NULL,
    comment_text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
    );

-- 3. 创建索引以提高查询性能
-- ============================================
CREATE INDEX IF NOT EXISTS idx_user_dishes_created_at ON user_dishes(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_dishes_cuisine ON user_dishes(cuisine);
CREATE INDEX IF NOT EXISTS idx_user_dishes_recipe_name ON user_dishes(recipe_name);
CREATE INDEX IF NOT EXISTS idx_user_dishes_user_name ON user_dishes(user_name);
CREATE INDEX IF NOT EXISTS idx_user_comments_created_at ON user_comments(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_user_comments_user_name ON user_comments(user_name);

-- 4. 启用行级安全策略（RLS）
-- ============================================
ALTER TABLE user_dishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_comments ENABLE ROW LEVEL SECURITY;

-- 5. 删除旧策略（如果存在）
-- ============================================
DROP POLICY IF EXISTS "Allow public read access on user_dishes" ON user_dishes;
DROP POLICY IF EXISTS "Allow public insert access on user_dishes" ON user_dishes;
DROP POLICY IF EXISTS "Allow public update access on user_dishes" ON user_dishes;
DROP POLICY IF EXISTS "Allow public delete access on user_dishes" ON user_dishes;

DROP POLICY IF EXISTS "Allow public read access on user_comments" ON user_comments;
DROP POLICY IF EXISTS "Allow public insert access on user_comments" ON user_comments;
DROP POLICY IF EXISTS "Allow users to delete their own comments" ON user_comments;

-- 6. 创建新的RLS策略
-- ============================================

-- 用户菜品表策略
CREATE POLICY "Allow public read access on user_dishes"
ON user_dishes FOR SELECT
                                                                 USING (true);

CREATE POLICY "Allow public insert access on user_dishes"
ON user_dishes FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow public update access on user_dishes"
ON user_dishes FOR UPDATE
                                     USING (true);

CREATE POLICY "Allow public delete access on user_dishes"
ON user_dishes FOR DELETE
USING (true);

-- 用户评论表策略
CREATE POLICY "Allow public read access on user_comments"
ON user_comments FOR SELECT
                                USING (true);

CREATE POLICY "Allow public insert access on user_comments"
ON user_comments FOR INSERT
WITH CHECK (true);

CREATE POLICY "Allow users to delete their own comments"
ON user_comments FOR DELETE
USING (true);

-- 7. 创建更新时间戳的触发器函数
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
RETURN NEW;
END;
$$ language 'plpgsql';

-- 8. 为表创建触发器
-- ============================================

-- 删除旧触发器（如果存在）
DROP TRIGGER IF EXISTS update_user_dishes_updated_at ON user_dishes;
DROP TRIGGER IF EXISTS update_user_comments_updated_at ON user_comments;

-- 创建新触发器
CREATE TRIGGER update_user_dishes_updated_at
    BEFORE UPDATE ON user_dishes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_comments_updated_at
    BEFORE UPDATE ON user_comments
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- 9. 插入示例数据（可选）
-- ============================================

-- 示例菜品
INSERT INTO user_dishes (recipe_id, recipe_name, cuisine, ingredients, steps, cooking_tips, difficulty, cooking_time, user_notes, user_name)
VALUES
    (
        'demo_001',
        '西红柿炒鸡蛋',
        '家常菜',
        '["西红柿 2个", "鸡蛋 3个", "葱花 适量", "盐 适量", "糖 少许", "食用油 适量"]'::jsonb,
        '["鸡蛋打散，加少许盐", "西红柿切块", "热锅凉油，炒鸡蛋至金黄盛出", "锅中加油，炒西红柿至出汁", "加入鸡蛋翻炒均匀", "加盐和糖调味，撒葱花出锅"]'::jsonb,
        '炒鸡蛋时火不要太大，保持嫩滑。西红柿要炒出汁才好吃。',
        '简单',
        '15分钟',
        '这是我最拿手的家常菜，简单又美味！',
        'AI美食大师'
    )
    ON CONFLICT DO NOTHING;

-- 示例评论
INSERT INTO user_comments (user_name, comment_text)
VALUES
    (
        'AI美食大师',
        '欢迎来到美食社区！在这里分享你的拿手好菜，与大家交流烹饪心得。让我们一起探索美食的无限可能！'
    )
    ON CONFLICT DO NOTHING;

-- 10. 验证表结构
-- ============================================
-- 查看user_dishes表结构
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_dishes'
ORDER BY ordinal_position;

-- 查看user_comments表结构
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'user_comments'
ORDER BY ordinal_position;

-- 11. 验证RLS策略
-- ============================================
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename IN ('user_dishes', 'user_comments')
ORDER BY tablename, policyname;

-- ============================================
-- 初始化完成！
-- ============================================
-- 接下来的步骤：
-- 1. 在.env文件中配置VITE_SUPABASE_URL和VITE_SUPABASE_ANON_KEY
-- 2. 重启开发服务器: npm run dev
-- 3. 访问美食社区页面测试功能
-- ============================================


-- 用户食材表
create table public.foods (
                              id serial not null,
                              user_id uuid not null,
                              food_name character varying(100) not null,
                              quantity integer not null default 1,
                              unit character varying(20) not null default '个'::character varying,
                              expiration_date date not null,
                              storage_suggestion text null,
                              created_at timestamp without time zone null default CURRENT_TIMESTAMP,
                              updated_at timestamp without time zone null default CURRENT_TIMESTAMP,
                              constraint foods_pkey primary key (id),
                              constraint fk_user foreign KEY (user_id) references users (id) on delete CASCADE,
                              constraint chk_expiration_date check ((expiration_date > CURRENT_DATE))
) TABLESPACE pg_default;

create index IF not exists idx_foods_user_id on public.foods using btree (user_id) TABLESPACE pg_default;

create index IF not exists idx_foods_expiration_date on public.foods using btree (expiration_date) TABLESPACE pg_default;

create index IF not exists idx_foods_created_at on public.foods using btree (created_at) TABLESPACE pg_default;

create trigger update_foods_updated_at BEFORE
    update on foods for EACH row
    execute FUNCTION update_updated_at_column ();

-- 过期食材表
create view public.expiring_foods as
select
    f.id,
    f.user_id,
    f.food_name,
    f.quantity,
    f.unit,
    f.expiration_date,
    f.storage_suggestion,
    f.created_at,
    f.updated_at,
    u.user_name,
    f.expiration_date - CURRENT_DATE as days_remaining
from
    foods f
        join users u on f.user_id = u.id
where
    f.expiration_date <= (CURRENT_DATE + '7 days'::interval)
order by
    f.expiration_date;
