import { describe, it, expect } from 'vitest';
import { countdown,locked,TOKEN_HOURS,BLOCK_MINUTES } from '@/lib/invitation';
describe('invitation rules',()=>{
 it('blocks at five wrong attempts',()=>{expect(locked(4)).toBe(false);expect(locked(5)).toBe(true);});
 it('blocks for fifteen minutes',()=>expect(BLOCK_MINUTES).toBe(15));
 it('admin tokens last two hours',()=>expect(TOKEN_HOURS).toBe(2));
 it('counts down to the stored wedding date without negative values',()=>{expect(countdown('2026-09-27T17:00:00Z',Date.parse('2026-09-26T15:58:57Z'))).toEqual([1,1,1,3]);expect(countdown('2026-09-27T17:00:00Z',Date.parse('2026-09-28T17:00:00Z'))).toEqual([0,0,0,0]);});
});