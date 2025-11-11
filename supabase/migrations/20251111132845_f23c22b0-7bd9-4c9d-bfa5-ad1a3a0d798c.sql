-- Update function to prevent duplicate page_views with advisory lock
CREATE OR REPLACE FUNCTION public.prevent_duplicate_page_views()
RETURNS TRIGGER AS $$
DECLARE
  duplicate_count INTEGER;
  unique_id TEXT;
  lock_key BIGINT;
BEGIN
  -- Only apply deduplication to page_view events
  IF NEW.event_type != 'page_view' THEN
    RETURN NEW;
  END IF;

  -- Generate deterministic lock key from tag_id + ip + user_agent
  -- This ensures same "dedup group" uses same lock to prevent race conditions
  lock_key := hashtextextended(
    NEW.tag_id::text || 
    COALESCE(NEW.ip_address::text, '') || 
    COALESCE(NEW.user_agent, ''), 
    0
  );

  -- Acquire advisory lock for this dedup group (auto-released at transaction end)
  PERFORM pg_advisory_xact_lock(lock_key);

  -- Extract unique_id from metadata if available (from cb3 parameter)
  unique_id := NEW.metadata->>'unique_id';
  IF unique_id IS NULL OR unique_id = '' THEN
    unique_id := NEW.metadata->'query_params'->>'cb3';
  END IF;

  -- Check for duplicates within 5 seconds window
  IF unique_id IS NOT NULL AND unique_id != '' AND unique_id NOT IN ('{dclid}', '{click_id}', '{external_data}', '{auction_id}') THEN
    -- Use unique_id for precise deduplication (DV360/Xandr/TTD)
    SELECT COUNT(*) INTO duplicate_count
    FROM events 
    WHERE tag_id = NEW.tag_id 
      AND event_type = 'page_view'
      AND created_at >= NOW() - INTERVAL '5 seconds'
      AND (
        metadata->>'unique_id' = unique_id 
        OR metadata->'query_params'->>'cb3' = unique_id
      );
  ELSE
    -- Fallback: use ip + user_agent for deduplication
    SELECT COUNT(*) INTO duplicate_count
    FROM events 
    WHERE tag_id = NEW.tag_id 
      AND event_type = 'page_view'
      AND ip_address = NEW.ip_address
      AND user_agent = NEW.user_agent
      AND created_at >= NOW() - INTERVAL '5 seconds';
  END IF;

  -- If duplicate found, silently prevent insertion
  IF duplicate_count > 0 THEN
    RETURN NULL; -- Cancel insertion
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create performance index for unique_id lookups
CREATE INDEX IF NOT EXISTS idx_events_metadata_cb3 
ON events ((metadata->'query_params'->>'cb3'))
WHERE event_type = 'page_view' 
  AND metadata->'query_params'->>'cb3' IS NOT NULL;