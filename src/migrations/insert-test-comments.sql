-- 插入测试评论数据
-- 用于测试评论显示和管理功能

-- 清除现有测试数据（可选）
-- DELETE FROM user_comments WHERE user_name LIKE '测试用户%';

-- 插入正常评论
INSERT INTO user_comments (user_name, comment_text, created_at)
VALUES 
  ('测试用户1', '这道菜看起来很美味！我也想试试这个做法。', NOW() - INTERVAL '5 minutes'),
  ('测试用户2', '非常详细的教程，步骤清晰，照着做成功了！👍', NOW() - INTERVAL '15 minutes'),
  ('测试用户3', '请问可以用其他调料代替吗？我这里买不到原材料。', NOW() - INTERVAL '30 minutes'),
  ('美食达人', '作为一个厨师，我觉得这个配方很专业，值得推荐！', NOW() - INTERVAL '1 hour'),
  ('小白厨师', '第一次做就成功了，感谢分享！家人都说好吃。', NOW() - INTERVAL '2 hours'),
  ('测试用户4', '图片拍得真好看，让人很有食欲。', NOW() - INTERVAL '3 hours'),
  ('美食爱好者', '这个菜谱收藏了，周末试试看。', NOW() - INTERVAL '4 hours'),
  ('测试用户5', '有视频教程就更好了，文字描述有些地方不太明白。', NOW() - INTERVAL '5 hours'),
  ('资深吃货', '这是我见过最详细的菜谱了，每个步骤都很清楚。', NOW() - INTERVAL '6 hours'),
  ('测试用户6', '做出来的味道和餐厅的一样好！', NOW() - INTERVAL '8 hours');

-- 插入一些长评论（用于测试展开/收起功能）
INSERT INTO user_comments (user_name, comment_text, created_at)
VALUES 
  ('详细评论者', '我按照这个菜谱做了三次，每次都有不同的体会。第一次做的时候火候没掌握好，有点糊了。第二次注意了火候，但是调料放多了，有点咸。第三次终于做出了完美的味道！建议新手一定要注意火候控制，还有就是调料要一点点加，不要一次性放太多。另外，食材的新鲜度也很重要，我用的都是当天买的新鲜食材。总的来说，这是一个很棒的菜谱，值得反复练习！', NOW() - INTERVAL '10 hours'),
  ('经验分享', '作为一个做了十年饭的家庭主妇，我想分享一些经验。这个菜谱的基础很好，但是可以根据家人的口味做一些调整。比如我家孩子不喜欢太辣，所以我会减少辣椒的用量。老人牙口不好，我会把食材切得更小一些，煮的时间也会长一点。每个家庭的情况不同，大家可以灵活调整。最重要的是用心去做，家人一定能感受到你的爱。', NOW() - INTERVAL '12 hours');

-- 插入一些需要标记的评论（用于测试标记功能）
INSERT INTO user_comments (user_name, comment_text, created_at)
VALUES 
  ('广告用户', '加微信XXXXX，专业代购各种食材，价格优惠！', NOW() - INTERVAL '1 day'),
  ('不当言论', '这个菜谱太垃圾了，做出来根本不能吃！', NOW() - INTERVAL '1 day'),
  ('虚假信息', '我是米其林三星厨师，这个做法完全错误！', NOW() - INTERVAL '2 days');

-- 插入一些已标记的评论（用于测试取消标记功能）
INSERT INTO user_comments (user_name, comment_text, created_at, flagged, flag_reason, flagged_at)
VALUES 
  ('已标记用户1', '这是一条已经被标记的评论内容。', NOW() - INTERVAL '3 days', TRUE, '垃圾广告', NOW() - INTERVAL '2 days'),
  ('已标记用户2', '这是另一条已经被标记的评论。', NOW() - INTERVAL '4 days', TRUE, '不当言论', NOW() - INTERVAL '3 days');

-- 显示插入的数据统计
SELECT 
    COUNT(*) as total_comments,
    COUNT(*) FILTER (WHERE flagged = TRUE) as flagged_comments,
    COUNT(*) FILTER (WHERE flagged = FALSE OR flagged IS NULL) as normal_comments
FROM user_comments;

-- 显示最新的10条评论
SELECT 
    id,
    user_name,
    LEFT(content, 50) || '...' as content_preview,
    created_at,
    flagged,
    flag_reason
FROM user_comments
ORDER BY created_at DESC
LIMIT 10;

-- 成功消息
DO $$
BEGIN
    RAISE NOTICE '测试评论数据已成功插入！';
    RAISE NOTICE '现在可以在应用中查看和测试评论管理功能了。';
END $$;
