'use strict';
(() => {
  const root=document.documentElement;
  const system=matchMedia('(prefers-color-scheme: dark)');
  let stored;
  try {stored=localStorage.getItem('crm-theme');} catch { /* Preferência do sistema sem armazenamento. */ }
  let chosen=stored==='dark'||stored==='light';
  root.dataset.theme=chosen?stored:system.matches?'dark':'light';

  function refreshButton() {
    const button=document.querySelector('#theme-toggle');
    if(!button)return;
    const dark=root.dataset.theme==='dark';
    button.textContent=dark?'☀ Claro':'☾ Escuro';
    button.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');
  }
  system.addEventListener('change',event=>{
    if(chosen)return;
    root.dataset.theme=event.matches?'dark':'light';
    refreshButton();
  });
  document.addEventListener('DOMContentLoaded',()=>{
    refreshButton();
    document.querySelector('#theme-toggle').addEventListener('click',()=>{
      root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
      chosen=true;
      try {localStorage.setItem('crm-theme',root.dataset.theme);} catch { /* A escolha permanece nesta página. */ }
      refreshButton();
    });
  });
})();
