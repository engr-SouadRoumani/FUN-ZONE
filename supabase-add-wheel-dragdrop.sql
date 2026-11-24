-- FUN ZONE: تفعيل لعبتي «عجلة الحظ» و«اسحب وأفلت».
-- إضافي فقط (لا يعدّل جداول ولا سياسات). نفّذوه مرة واحدة في Supabase SQL Editor بعد supabase.sql.
-- الأحداث الجديدة تحصل على اللعبتين تلقائياً عبر trigger attach_default_games الموجود.
-- الصيغة آمنة للتكرار (on conflict do nothing).

insert into public.games(slug, name, description, icon) values
  ('wheel',    'عجلة الحظ',  'أدِر العجلة وواجه سؤالاً أو تحدياً عشوائياً',        '🎡'),
  ('dragdrop', 'اسحب وأفلت', 'رتّب العناصر وطابق المصطلحات مع تعريفاتها',           '🧲')
on conflict (slug) do nothing;

-- تفعيلهما للفعاليات الموجودة سابقاً
insert into public.event_games(event_id, game_id, is_active)
select e.id, g.id, true
from public.events e
cross join public.games g
where g.slug in ('wheel', 'dragdrop')
on conflict (event_id, game_id) do nothing;
