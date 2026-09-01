export const MASTERY=80;
const norm=s=>String(s??'').toLowerCase().replace(/[^a-z0-9\s]/g,' ').replace(/\s+/g,' ').trim();
export function gradeResponse(card,response){
 const text=norm(response); const req=card.test.required.map(norm); const keys=card.test.keywords.map(norm);
 const requiredHits=req.filter(r=>text.includes(r)).length; const keywordHits=keys.filter(k=>text.includes(k)).length;
 const base=req.length?requiredHits/req.length:0; const support=keys.length?keywordHits/keys.length:0;
 const score=Math.round(Math.min(100,base*75+support*25));
 const passed=score>=MASTERY;
 return {score,passed,requiredHits,requiredTotal:req.length,keywordHits,keywordTotal:keys.length,feedback:passed?'Mastery standard met.':`Below ${MASTERY}%. Missing required material. Review the card, then retry.`,missing:req.filter(r=>!text.includes(r))};
}
export function gradeScenario(card,response){return gradeResponse(card,{test:{...card.test,required:[...card.test.required,...card.test.keywords]}}.test,response)}
