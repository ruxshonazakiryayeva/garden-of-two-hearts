import type { Json, Tables } from '@/integrations/supabase/types';
export type Localized = Record<string, string>;
export type Content = { wedding_date?: string; map_url?: string; map_override?:string; languages: {code:string;label:string}[]; schedule: {time:Localized;title:Localized}[]; texts: Record<string,Localized>; ui: Record<string,string> };
export type Settings = {default_language?:string; colors?:Record<string,string>; fonts?:Record<string,string>; section_order:string[]; sections_enabled:Record<string,boolean>};
export type Invitation = Omit<Tables<'invitations'>,'content'|'media'|'settings'> & {content:Content;media:Record<string,string>;settings:Settings};
export function asInvitation(row:Tables<'invitations'>):Invitation {return {...row,content:row.content as unknown as Content,media:row.media as Record<string,string>,settings:row.settings as unknown as Settings};}
export const toJson = (value:unknown) => value as Json;
export function countdown(date:string,now:number) {const seconds=Math.max(0,Math.floor((Date.parse(date)-now)/1000));return [Math.floor(seconds/86400),Math.floor(seconds/3600)%24,Math.floor(seconds/60)%60,seconds%60];}
export const TOKEN_HOURS=2;
export const MAX_ATTEMPTS=5;
export const BLOCK_MINUTES=15;
export function locked(attempts:number) {return attempts>=MAX_ATTEMPTS;}