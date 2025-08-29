
-- Corrigir eventos antigos de PIN que foram gravados como 'view'
update public.events e
set event_type = 'pin_click'
from public.tags t
where e.tag_id = t.id
  and t.type = 'pin'
  and e.event_type = 'view';

-- Normalizar eventos antigos de PAGE VIEW gravados como 'view'
update public.events e
set event_type = 'page_view'
from public.tags t
where e.tag_id = t.id
  and t.type = 'page-view'
  and e.event_type = 'view';
