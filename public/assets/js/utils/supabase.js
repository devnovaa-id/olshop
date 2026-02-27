import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const supabaseUrl = 'https://sqzmpawdwxfsijyqnuyx.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNxem1wYXdkd3hmc2lqeXFudXl4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyNjg0MDIsImV4cCI6MjA3Nzg0NDQwMn0.TLZhwArg7llazNiz2t3tXTNZj-BooDkZNuySnZWu8tk';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function uploadImage(file, bucket, folder = 'public') {
  const fileName = `${folder}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`;
  const { data, error } = await supabase.storage.from(bucket).upload(fileName, file);
  if (error) throw error;
  const { data: { publicUrl } } = supabase.storage.from(bucket).getPublicUrl(fileName);
  return publicUrl;
}