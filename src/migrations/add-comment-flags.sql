-- 添加评论标记功能所需的字段
-- 执行此脚本以支持评论管理功能

-- 1. 添加标记相关字段到user_comments表
ALTER TABLE user_comments 
ADD COLUMN IF NOT EXISTS flagged BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS flag_reason TEXT,
ADD COLUMN IF NOT EXISTS flagged_at TIMESTAMP;

-- 2. 添加注释说明字段用途
COMMENT ON COLUMN user_comments.flagged IS '是否被标记为不当内容';
COMMENT ON COLUMN user_comments.flag_reason IS '标记原因';
COMMENT ON COLUMN user_comments.flagged_at IS '标记时间';

-- 3. 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_user_comments_flagged 
ON user_comments(flagged) 
WHERE flagged = TRUE;

CREATE INDEX IF NOT EXISTS idx_user_comments_flagged_at 
ON user_comments(flagged_at DESC) 
WHERE flagged = TRUE;

-- 4. 更新现有数据（如果有的话）
UPDATE user_comments 
SET flagged = FALSE 
WHERE flagged IS NULL;

-- 5. 验证字段已添加
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns
WHERE table_name = 'user_comments'
AND column_name IN ('flagged', 'flag_reason', 'flagged_at');

-- 6. 显示成功消息
DO $$
BEGIN
    RAISE NOTICE '评论标记功能字段已成功添加！';
    RAISE NOTICE '现在可以使用标记和删除评论功能了。';
END $$;
