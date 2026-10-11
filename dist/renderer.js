'use strict';
// Shared by the static build and browser. Edit content/site.json, then rebuild.
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.siteRenderer=api;
})(typeof globalThis==='object'?globalThis:this,function(){
 const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const localized=(value,language)=>typeof value==='string'?value:(value?.[language]??'');
 const paperURL=paper=>paper.doi?`https://doi.org/${encodeURI(paper.doi)}`:(paper.url||'');
 function create(content){
  const translations={};
  for(const language of ['en','zh'])translations[language]={...content.labels[language],aboutStatus:content.profile.status[language],aboutBio:content.profile.bio[language],heroStatement:content.profile.heroLines[language].map(line=>`<span class="hero-line">${escapeHTML(line)}</span>`).join('')};
  function renderResearchHTML(language='en'){
   const t=translations[language];
   return content.research.map((item,index)=>{
    const c=item[language],figure=item.figure,layout=figure?(item.layout||'wide'):'wide';
    const url=item.paper?`https://doi.org/${encodeURI(item.paper)}`:item.url;
    const paper=url?`<a class="text-link chapter-paper" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(t.paper)}<span aria-hidden="true">↗</span></a>`:'';
    const image=figure?`<figure class="chapter-figure reveal" data-motion="figure"><a class="figure-preview" data-figure="${escapeHTML(item.id)}" href="${escapeHTML(figure.original||figure.preview)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeHTML(t.viewFigure)}: ${escapeHTML(c.title)}"><img src="${escapeHTML(figure.preview)}" alt="${escapeHTML(c.alt)}" width="${figure.width}" height="${figure.height}" loading="lazy" decoding="async"></a></figure>`:'';
    return `<article class="research-chapter chapter--${layout}${figure?'':' chapter--text'}" id="project-${escapeHTML(item.id)}" tabindex="-1"><div class="chapter-heading reveal"><div class="chapter-meta"><span class="chapter-number">${String(index+1).padStart(2,'0')}</span>${item.ongoing?`<span class="research-status">${escapeHTML(t.ongoing)}</span>`:''}</div><h3>${escapeHTML(c.title)}</h3><p class="chapter-summary">${escapeHTML(c.summary)}</p>${paper}</div>${image}</article>`;
   }).join('\n');
  }
  function renderPublicationsHTML(language='en'){
   const t=translations[language];
   return content.publications.map(p=>{
    const title=localized(p.title,language),url=paperURL(p),authors=p.authors||[];
    const heading=url?`<a href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(title)}</a>`:escapeHTML(title);
    const authorHTML=authors.length?`<p class="publication-authors">${authors.map(a=>a===content.profile.name.en?`<strong>${escapeHTML(a)}</strong>`:escapeHTML(a)).join(', ')}.</p>`:'';
    const journal=localized(p.journal,language),details=localized(p.details,language);
    const journalHTML=journal||details||p.first?`<p class="publication-journal">${journal?`<em>${escapeHTML(journal)}</em>`:''}${journal&&details?' · ':''}${escapeHTML(details)}${p.first?`<span class="first-badge">${escapeHTML(t.firstAuthor)}</span>`:''}</p>`:'';
    const link=url?`<a class="doi-link" href="${escapeHTML(url)}" target="_blank" rel="noopener noreferrer" aria-label="${p.doi?'DOI':'Paper'}: ${escapeHTML(title)}">${escapeHTML(t.paper)}<span aria-hidden="true">↗</span></a>`:'';
    return `<article class="publication-item reveal" data-first-author="${Boolean(p.first)}"><span class="publication-year">${p.year}</span><div><h3>${heading}</h3>${authorHTML}${journalHTML}</div>${link}</article>`;
   }).join('\n');
  }
  function renderEducationHTML(language='en'){return content.education.map(item=>`<article class="education-item reveal"><div class="education-date">${escapeHTML(item.date[language])}</div><div><h3>${escapeHTML(item.degree[language])}</h3><p>${escapeHTML(item.school[language])}</p></div>${item.current?`<span class="current-label">${escapeHTML(translations[language].current)}</span>`:''}</article>`).join('\n');}
  function linkHTML(link,language){return `<a class="text-link" href="${escapeHTML(link.url)}" target="_blank" rel="noopener noreferrer">${escapeHTML(link.label[language])} <span aria-hidden="true">↗</span></a>`;}
  function renderContactHTML(language='en'){
   const c=content.contact;
   return `${c.email?`<a class="email-link" href="mailto:${escapeHTML(c.email)}">${escapeHTML(c.email)} <span aria-hidden="true">↗</span></a>`:''}${c.links?.length?`<div class="social-links">${c.links.map(link=>linkHTML(link,language)).join('')}</div>`:''}`;
  }
  function renderScholarHTML(language='en'){return content.contact.scholar?linkHTML(content.contact.scholar,language):'';}
  const publicationCount=(count,language='en')=>language==='zh'?`${count} 篇论文`:`${count} ${count===1?'paper':'papers'}`;
  return {translations,renderResearchHTML,renderPublicationsHTML,renderEducationHTML,renderContactHTML,renderScholarHTML,publicationCount};
 }
 return {create,escapeHTML,localized};
});
