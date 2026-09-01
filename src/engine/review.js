export function nextReview(cards,progress){const failed=(progress.review||[]).map(id=>cards.find(c=>c.id===id)).filter(Boolean);if(!failed.length)return null;return failed[Math.floor(Math.random()*failed.length)]}
export function recoveryState(progress,cardId){const attempts=progress.attempts?.[cardId]||0;return{active:attempts>=3,attempts,mode:attempts>=3?'recovery/reteach':'retry'}}
