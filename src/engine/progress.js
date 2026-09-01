const KEY='fogle-unlimited-academy-v1';
const empty={currentCard:1,trainingDay:1,mastered:{},attempts:{},scores:{},failed:{},bookmarks:{},review:[],checkpoints:{}};
export function loadProgress(){try{return {...empty,...JSON.parse(localStorage.getItem(KEY)||'{}')}}catch{return {...empty}}}
export function saveProgress(p){localStorage.setItem(KEY,JSON.stringify(p));return p}
export function recordAttempt(p,cardId,result){const next={...p,attempts:{...p.attempts,[cardId]:(p.attempts[cardId]||0)+1},scores:{...p.scores,[cardId]:result.score}};if(result.passed){next.mastered={...next.mastered,[cardId]:true};next.failed={...next.failed,[cardId]:false};next.review=(next.review||[]).filter(x=>x!==cardId)}else{next.failed={...next.failed,[cardId]:true};if(!(next.review||[]).includes(cardId))next.review=[...(next.review||[]),cardId];if(next.attempts[cardId]>=3)next.bookmarks={...next.bookmarks,[cardId]:true}}return next}
export function advanceCard(p,total){return {...p,currentCard:Math.min(total,p.currentCard+1)}}
export function setDay(p,day){return {...p,trainingDay:Math.min(90,Math.max(1,day))}}
export function checkpoint(p,n,passed){return {...p,checkpoints:{...p.checkpoints,[n]:passed}}}
export function resetProgress(){localStorage.removeItem(KEY);return {...empty}}
