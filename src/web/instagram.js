(function() {
  'use strict';
  let dialog,elementos,peca=null,posicoes=[],indice=0,acionador=null,origemAtualizacao=null,gesto=null;
  function el(tag,id,texto) {
    const node=document.createElement(tag);
    if(id)node.id=id;
    if(texto!==undefined)node.textContent=texto;
    return node;
  }
  function botao(texto,nome) {
    const node=el('button',null,texto);node.type='button';node.setAttribute('aria-label',nome);return node;
  }
  function nomePerfil() {
    const nome=globalThis.CrmPerfil?.nomePerfil;
    if(typeof nome!=='string'||!nome.trim()||nome.trim().length>80||/[\u0000-\u001f\u007f]/.test(nome))return 'Perfil não configurado';
    return nome.trim();
  }
  function iniciarGesto(tipo,ponto,id) {gesto={tipo,id,x:ponto.clientX,y:ponto.clientY};}
  function terminarGesto(tipo,ponto,id) {
    if(!gesto||gesto.tipo!==tipo||gesto.id!==id)return;
    const dx=ponto.clientX-gesto.x,dy=ponto.clientY-gesto.y;gesto=null;
    if(Math.abs(dx)>=40&&Math.abs(dx)>Math.abs(dy))selecionar(indice+(dx<0?1:-1));
  }
  function gestos(midia) {
    midia.addEventListener('pointerdown',event=>{
      if(event.button!==0)return;
      iniciarGesto('pointer',event,event.pointerId);
      if(event.isTrusted)midia.setPointerCapture(event.pointerId);
    });
    midia.addEventListener('pointerup',event=>terminarGesto('pointer',event,event.pointerId));
    midia.addEventListener('pointercancel',()=>{gesto=null;});
    // Touch também permite os testes sintéticos; eventos compatíveis não navegam duas vezes.
    midia.addEventListener('touchstart',event=>{
      const ponto=event.touches[0];if(ponto)iniciarGesto('touch',ponto,ponto.identifier);
    },{passive:true});
    midia.addEventListener('touchend',event=>{
      const ponto=event.changedTouches[0];if(ponto)terminarGesto('touch',ponto,ponto.identifier);
    },{passive:true});
    midia.addEventListener('touchcancel',()=>{gesto=null;});
  }
  function conterFoco(event) {
    const focaveis=[...dialog.querySelectorAll('button:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')]
      .filter(node=>node.getClientRects().length&&!node.closest('[hidden]'));
    const primeiro=focaveis[0],ultimo=focaveis.at(-1);
    if((event.shiftKey&&document.activeElement===primeiro)||(!event.shiftKey&&document.activeElement===ultimo)) {
      event.preventDefault();(event.shiftKey?ultimo:primeiro).focus();
    }
  }
  function teclado(event) {
    if(event.key==='ArrowLeft'||event.key==='ArrowRight') {
      event.preventDefault();selecionar(indice+(event.key==='ArrowRight'?1:-1));
    } else if(event.key==='Tab')conterFoco(event);
  }
  function criar() {
    if(dialog)return;
    dialog=el('dialog','instagram');dialog.className='instagram-preview';
    dialog.setAttribute('aria-modal','true');dialog.setAttribute('aria-labelledby','instagram-titulo');
    const topo=el('header');topo.className='instagram-top';
    const titulo=el('h2','instagram-titulo','Prévia do Instagram'),fecharBotao=botao('×','Fechar prévia');
    fecharBotao.addEventListener('click',fechar);topo.append(titulo,fecharBotao);
    const atualizacao=el('div','instagram-atualizacao'),perfil=el('strong','instagram-perfil');
    const midia=el('div','instagram-midia'),controles=el('div');controles.className='instagram-controls';
    const anterior=botao('‹','Página anterior'),proximo=botao('›','Próxima página');
    const contador=el('span','instagram-contador');contador.setAttribute('role','status');contador.setAttribute('aria-live','polite');
    anterior.addEventListener('click',()=>selecionar(indice-1));proximo.addEventListener('click',()=>selecionar(indice+1));
    controles.append(anterior,contador,proximo);
    const pontos=el('div','instagram-pontos');pontos.setAttribute('role','group');pontos.setAttribute('aria-label','Páginas da prévia');
    const textos=el('div','instagram-textos'),legenda=el('p','instagram-legenda'),hashtags=el('p','instagram-hashtags');textos.append(legenda,hashtags);
    dialog.append(topo,atualizacao,perfil,midia,controles,pontos,textos);document.body.append(dialog);
    elementos={atualizacao,perfil,midia,anterior,proximo,contador,pontos,legenda,hashtags,fecharBotao};
    dialog.addEventListener('keydown',teclado);
    dialog.addEventListener('cancel',event=>{event.preventDefault();fechar();});
    dialog.addEventListener('close',limpar);gestos(midia);
  }
  function moverAtualizacao() {
    if(origemAtualizacao)return;
    origemAtualizacao=[];
    for(const seletor of ['.capture-actions','#resultado-atualizacao','#erro']) {
      const node=document.querySelector(seletor);if(!node)continue;
      const marcador=document.createComment('Local do topo da consulta');node.before(marcador);
      origemAtualizacao.push({node,marcador});elementos.atualizacao.append(node);
    }
  }
  function liberarImagem() {
    const img=elementos.midia.querySelector('img');if(img)img.removeAttribute('src');
    elementos.midia.replaceChildren();
  }
  function indisponivel() {elementos.midia.append(el('p','instagram-indisponivel','prévia indisponível'));}
  function mostrarImagem() {
    liberarImagem();const posicao=posicoes[indice];
    if(!posicao?.arquivo){indisponivel();return;}
    const img=el('img');img.alt=posicao.contexto+' · '+(peca.titulo||peca.formato);img.decoding='async';
    img.addEventListener('error',()=>{
      if(!elementos.midia.contains(img))return;img.removeAttribute('src');img.remove();indisponivel();
    },{once:true});
    elementos.midia.append(img);img.src='/api/midia/'+encodeURIComponent(posicao.arquivo.arquivo_id);
  }
  function rotuloPosicao(novo,prefixo,original) {
    const posicao=posicoes[Math.max(0,Math.min(novo,posicoes.length-1))];
    return posicao.contexto.startsWith('Cena ')?prefixo+posicao.contexto:original;
  }
  function marcarPosicao() {
    elementos.contador.textContent=(indice+1)+'/'+posicoes.length;
    elementos.anterior.disabled=indice===0;elementos.proximo.disabled=indice===posicoes.length-1;
    elementos.anterior.setAttribute('aria-label',rotuloPosicao(indice-1,'Anterior: ','Página anterior'));
    elementos.proximo.setAttribute('aria-label',rotuloPosicao(indice+1,'Próxima: ','Próxima página'));
    elementos.pontos.setAttribute('aria-label',peca.formato==='Reels'?'Cenas da prévia':'Páginas da prévia');
    [...elementos.pontos.children].forEach((ponto,i)=>{
      ponto.setAttribute('aria-label',rotuloPosicao(i,'Ir para ','Ir para página '+(i+1)));
      ponto.classList.toggle('active',i===indice);
      if(i===indice)ponto.setAttribute('aria-current','true');else ponto.removeAttribute('aria-current');
    });
  }
  function selecionar(novo) {
    if(!peca)return;
    const escolhido=Math.max(0,Math.min(novo,posicoes.length-1));
    if(escolhido===indice)return;indice=escolhido;marcarPosicao();mostrarImagem();
  }
  function criarPontos() {
    if(elementos.pontos.children.length===posicoes.length)return;
    const foco=document.activeElement,restaurar=elementos.pontos.contains(foco);elementos.pontos.replaceChildren();
    posicoes.forEach((_,i)=>{const ponto=botao('●',rotuloPosicao(i,'Ir para ','Ir para página '+(i+1)));ponto.addEventListener('click',()=>selecionar(i));elementos.pontos.append(ponto);});
    if(restaurar)elementos.pontos.children[indice].focus({preventScroll:true});
  }
  function apresentar() {
    posicoes=globalThis.CrmLayout.posicoesInstagram(peca);
    indice=Math.min(indice,posicoes.length-1);
    elementos.perfil.textContent=nomePerfil();elementos.legenda.textContent=peca.legenda||'';elementos.hashtags.textContent=peca.hashtags||'';
    criarPontos();marcarPosicao();mostrarImagem();
  }
  function abrir({peca:nova,acionador:origem}) {
    criar();peca=nova;acionador=origem;indice=0;apresentar();moverAtualizacao();
    if(!dialog.open)dialog.showModal();elementos.fecharBotao.focus({preventScroll:true});
  }
  function atualizar(nova) {
    if(!dialog?.open)return;
    if(!nova||nova.producao_id!==peca.producao_id){fechar();return;}
    peca=nova;apresentar();
  }
  function limpar() {
    if(!peca||dialog.open)return;
    liberarImagem();peca=null;posicoes=[];gesto=null;
    if(origemAtualizacao){origemAtualizacao.forEach(({node,marcador})=>marcador.replaceWith(node));origemAtualizacao=null;}
    const foco=acionador?.isConnected?acionador:document.querySelector('#titulo');acionador=null;
    if(foco){if(!foco.hasAttribute('tabindex')&&foco.tagName==='H1')foco.tabIndex=-1;foco.focus({preventScroll:true});}
  }
  function fechar() {if(!dialog?.open)return;dialog.close();limpar();}
  globalThis.CrmInstagram={abrir,atualizar,fechar,get pecaId(){return peca?.producao_id||null;}};
})();
