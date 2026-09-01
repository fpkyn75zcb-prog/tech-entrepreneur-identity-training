import {gradeResponse,MASTERY} from './grading';
export const checkpointAt=n=>[10,20,40,60,80,100,120,140,160,180,200].includes(n);
export function checkpointCards(cards,n){return cards.slice(0,n)}
export function gradeCheckpoint(cards,progress){const set=checkpointCards(cards,cards.length);const scores=set.map(c=>progress.scores[c.id]??0);const avg=scores.length?scores.reduce((a,b)=>a+b,0)/scores.length:0;const weak=set.filter(c=>(progress.scores[c.id]??0)<MASTERY).map(c=>c.id);return{score:Math.round(avg),passed:avg>=MASTERY&&weak.length===0,weak}}
export function testCard(card,response){return gradeResponse(card,response)}
