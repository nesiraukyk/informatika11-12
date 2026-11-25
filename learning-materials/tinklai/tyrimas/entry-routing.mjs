// Resolve reference links from this module, so both lesson entry URLs work.
export function theoryHref(lesson){
 const target=new URL('../../kompiuteriu-tinklai-atmintine.html',import.meta.url);
 target.hash='pamoka-'+lesson;
 return target.href;
}

const legacySections=new Set(['ivadas','turinys','teorija','praktika','laboratorijos','pasitikrink','saltiniai','tinklo-esme','iranga','paketai','ip','dns','protokolai','sauga','diagnostika','veiklos','savikontrole','atmintine','lab-a','lab-b','lab-c']);
export function legacyTheoryDestination(href){
 const current=new URL(href);
 if(!current.pathname.endsWith('/learning-materials/kompiuteriu-tinklai-teorija.html'))return null;
 let fragment;try{fragment=decodeURIComponent(current.hash.slice(1))}catch{return null}
 if(!legacySections.has(fragment)&&!/^pamoka-[1-6]$/.test(fragment)&&!/^praktika-[1-6]-[1-3]$/.test(fragment)&&!/^klausimas-\d+$/.test(fragment))return null;
 const target=new URL('kompiuteriu-tinklai-atmintine.html',current);
 target.hash=current.hash;
 return target.href;
}
