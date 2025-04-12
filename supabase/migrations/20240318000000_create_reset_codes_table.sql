-- Create reset_codes table
CREATE TABLE IF NOT EXISTS public.reset_codes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    CONSTRAINT fk_user_email
        FOREIGN KEY (email)
        REFERENCES auth.users(email)
        ON DELETE CASCADE
);

-- Add RLS policies
ALTER TABLE public.reset_codes ENABLE ROW LEVEL SECURITY;

-- Allow users to read their own reset codes
CREATE POLICY "Users can read their own reset codes"
    ON public.reset_codes
    FOR SELECT
    USING (auth.jwt() ->> 'email' = email);

-- Allow users to create reset codes for their own email
CREATE POLICY "Users can create reset codes for their own email"
    ON public.reset_codes
    FOR INSERT
    WITH CHECK (auth.jwt() ->> 'email' = email);

-- Allow users to delete their own reset codes
CREATE POLICY "Users can delete their own reset codes"
    ON public.reset_codes
    FOR DELETE
    USING (auth.jwt() ->> 'email' = email);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_reset_codes_email ON public.reset_codes(email);
CREATE INDEX IF NOT EXISTS idx_reset_codes_expires_at ON public.reset_codes(expires_at);

-- Add function to clean up expired codes
CREATE OR REPLACE FUNCTION cleanup_expired_reset_codes()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM public.reset_codes
    WHERE expires_at < NOW();
END;
$$;

-- Create a scheduled job to clean up expired codes every hour
SELECT cron.schedule(
    'cleanup-expired-reset-codes',
    '0 * * * *',  -- Run every hour
    'SELECT cleanup_expired_reset_codes()'
); 