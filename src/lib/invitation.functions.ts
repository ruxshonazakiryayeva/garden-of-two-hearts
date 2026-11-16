import { createServerFn } from '@tanstack/react-start';
import { createClient } from '@supabase/supabase-js';
import { getRequest } from '@tanstack/react-start/server';
import { z } from 'zod';
import { asInvitation, toJson, locked, TOKEN_HOURS, BLOCK_MINUTES } from './invitation';
import type { Database } from '@/integrations/supabase/types';

export const getInvitation=createServerFn({method:'GET'}).inputValidator((d:unknown)=>z.object({slug:z.string()}).parse(d)).handler(async({data})=>{
 const key=process.env['SUPABASE_PUBLISHABLE_KEY'];const url=process.env['SUPABASE_URL'];if(!key||!url)throw new Error('Configuration unavailable');
 const client=createClient<Database>(url,key,{auth:{persistSession:false,autoRefreshToken:false},global:{fetch:(input,init)=>{const h=new Headers(init?.headers);if(h.get('Authorization')===`Bearer ${key}`)h.delete('Authorization');h.set('apikey',key);return fetch(input,{...init,headers:h});}}});
 const {data:row,error}=await client.from('invitations').select('*').eq('slug',data.slug).maybeSingle();if(error)throw error;return row?asInvitation(row):null;
});

async function signature(message:string,password:string){const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(password),{name:'HMAC',hash:'SHA-256'},false,['sign']);return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(message))),x=>x.toString(16).padStart(2,'0')).join('');}
async function verified(token:string,password:string|undefined){if(!password)throw new Error('not_configured');const [expires,nonce,sig]=token.split('.');if(!expires||!nonce||!sig||Number(expires)<=Date.now()||Number(expires)>Date.now()+TOKEN_HOURS*3600000)throw new Error('invalid');const expected=await signature(`${expires}.${nonce}`,password);if(sig.length!==expected.length)throw new Error('invalid');let diff=0;for(let i=0;i<sig.length;i++)diff|=sig.charCodeAt(i)^expected.charCodeAt(i);if(diff)throw new Error('invalid');}
export const adminLogin=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({password:z.string().min(1).max(1000)}).parse(d)).handler(async({data})=>{
 const password=process.env['ADMIN_PASSWORD'];if(!password)throw new Error('not_configured');
 const {supabaseAdmin}=await import('@/integrations/supabase/client.server');const ip=getRequest().headers.get('cf-connecting-ip')||'local';
 const {count,error}=await supabaseAdmin.from('admin_login_attempts').select('id',{head:true,count:'exact'}).eq('ip',ip).gte('created_at',new Date(Date.now()-BLOCK_MINUTES*60000).toISOString());if(error)throw error;if(locked(count||0))throw new Error('locked');
 const a=await signature('admin-password-check',data.password);const b=await signature('admin-password-check',password);
 if(a!==b){const result=await supabaseAdmin.from('admin_login_attempts').insert({ip});if(result.error)throw result.error;throw new Error(locked((count||0)+1)?'locked':'invalid');}
 const message=`${Date.now()+TOKEN_HOURS*3600000}.${crypto.randomUUID()}`;return {token:`${message}.${await signature(message,password)}`};
});
export const adminAction=createServerFn({method:'POST'}).inputValidator((d:unknown)=>z.object({token:z.string(),slug:z.string(),action:z.enum(['save','responses','duplicate','upload']),content:z.unknown().optional(),media:z.unknown().optional(),settings:z.unknown().optional(),newSlug:z.string().regex(/^[a-z0-9-]+$/).optional(),filename:z.string().optional()}).parse(d)).handler(async({data})=>{
 await verified(data.token,process.env['ADMIN_PASSWORD']);const {supabaseAdmin}=await import('@/integrations/supabase/client.server');
 if(data.action==='responses'){const result=await supabaseAdmin.from('rsvps').select('*').eq('invitation_slug',data.slug).order('created_at',{ascending:false});if(result.error)throw result.error;return {responses:result.data};}
 if(data.action==='upload'){const path=`${data.slug}/${crypto.randomUUID()}-${(data.filename||'image').replace(/[^a-zA-Z0-9.\-]/g,'')}`;const r=await supabaseAdmin.storage.from('invitation-media').createSignedUploadUrl(path);if(r.error)throw r.error;const read=await supabaseAdmin.storage.from('invitation-media').createSignedUrl(path,31536000);if(read.error)throw read.error;return {upload:r.data.signedUrl,url:read.data.signedUrl};}
 if(data.action==='duplicate'){if(!data.newSlug)throw new Error('slug');const r=await supabaseAdmin.from('invitations').select('*').eq('slug',data.slug).single();if(r.error)throw r.error;const saved=await supabaseAdmin.from('invitations').insert({slug:data.newSlug,content:r.data.content,media:r.data.media,settings:r.data.settings,template:r.data.template});if(saved.error)throw saved.error;return {slug:data.newSlug};}
 const result=await supabaseAdmin.from('invitations').update({content:toJson(data.content),media:toJson(data.media),settings:toJson(data.settings),updated_at:new Date().toISOString()}).eq('slug',data.slug).select('id').single();if(result.error)throw result.error;return {saved:true};
});