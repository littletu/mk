-- Aggregate leaderboard in DB instead of JS
CREATE OR REPLACE FUNCTION get_knowledge_leaderboard()
RETURNS TABLE (
  worker_id      uuid,
  full_name      text,
  avatar_url     text,
  tip_points     bigint,
  approved_count bigint,
  comment_count  bigint
)
LANGUAGE sql
STABLE
AS $$
  WITH tip_agg AS (
    SELECT
      kt.worker_id,
      COALESCE(SUM(kc.points), 0) AS tip_points,
      COUNT(kt.id)                 AS approved_count
    FROM knowledge_tips kt
    JOIN knowledge_categories kc ON kc.id = kt.category_id
    WHERE kt.status = 'approved'
    GROUP BY kt.worker_id
  ),
  comment_agg AS (
    SELECT worker_id, COUNT(*) AS comment_count
    FROM knowledge_comments
    GROUP BY worker_id
  )
  SELECT
    w.id,
    p.full_name,
    p.avatar_url,
    COALESCE(ta.tip_points, 0),
    COALESCE(ta.approved_count, 0),
    COALESCE(ca.comment_count, 0)
  FROM workers w
  JOIN profiles p ON p.id = w.profile_id
  LEFT JOIN tip_agg    ta ON ta.worker_id = w.id
  LEFT JOIN comment_agg ca ON ca.worker_id = w.id
  WHERE w.is_active = true
    AND (COALESCE(ta.tip_points, 0) > 0 OR COALESCE(ca.comment_count, 0) > 0)
$$;

GRANT EXECUTE ON FUNCTION get_knowledge_leaderboard() TO authenticated;
