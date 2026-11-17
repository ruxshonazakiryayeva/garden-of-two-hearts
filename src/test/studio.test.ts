import { describe,it,expect } from 'vitest';
import { displayDate,mapFromAddress,moveSchedule,prepareInvitation,publicLanguages,setUzbek } from '@/lib/studio';
import type {Content,Invitation} from '@/lib/invitation';
const content:Content={languages:[{code:'uz',label:'UZ'},{code:'ru',label:'RU'},{code:'en',label:'EN'}],ui:{},texts:{groom:{uz:'Ali',ru:'Али',en:'Ali'},bride:{uz:'Nila',ru:'Нила',en:'Nila'},address:{uz:'Toshkent'},date_display:{uz:'old',ru:'27.09.26',en:'27.09.26'}},schedule:[{time:{uz:'17:00',ru:'17:00',en:'5 PM'},title:{uz:'Kelish',ru:'Сбор',en:'Arrival'}},{time:{uz:'18:00'},title:{uz:'Nikoh'}}]};
describe('simple Uzbek studio',()=>{
 it('derives 27.09.26 from the single date-time value',()=>{expect(displayDate('2026-09-27T17:00:00')).toBe('27.09.26');});
 it('saves one countdown target and matching displayed date',()=>{const d={content:{...content,wedding_date:'2027-09-27T18:30:00'},settings:{},media:{}} as Invitation;const r=prepareInvitation(d);expect(r.content.wedding_date).toBe('2027-09-27T18:30:00');expect(r.content.texts['date_display']).toEqual({uz:'27.09.27',ru:'27.09.26',en:'27.09.26'});});
 it('changes Uzbek without overwriting Russian or English',()=>{expect(setUzbek(content,'groom','Olim').texts['groom']).toEqual({uz:'Olim',ru:'Али',en:'Ali'});});
 it('automatically builds a map from the address',()=>{expect(mapFromAddress('Toshkent, Amir Temur 1')).toBe('https://www.google.com/maps?q=Toshkent%2C%20Amir%20Temur%201&output=embed');});
 it('uses an explicit optional map override',()=>{expect(mapFromAddress('Toshkent','https://maps.google.com/custom')).toBe('https://maps.google.com/custom');});
 it('only shows Uzbek when other invitation languages are empty',()=>{expect(publicLanguages({...content,texts:{groom:{uz:'Ali',ru:'',en:''}}}).map(l=>l.code)).toEqual(['uz']);});
 it('retains language switching for seeded multilingual invitations',()=>{expect(publicLanguages(content).map(l=>l.code)).toEqual(['uz','ru','en']);});
 it('reorders complete schedule rows while preserving translations',()=>{const moved=moveSchedule(content,0,1);expect(moved.schedule[1]).toEqual(content.schedule[0]);expect(moved.schedule[0]).toEqual(content.schedule[1]);});
 it('clears optional notes without modifying other translations',()=>{expect(setUzbek({...content,texts:{gift_text:{uz:'Sovg‘a',en:'Gifts',ru:'Подарки'}}},'gift_text','').texts['gift_text']).toEqual({uz:'',en:'Gifts',ru:'Подарки'});});
});