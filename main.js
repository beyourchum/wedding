function openEnv(){
  const flap=document.getElementById('topFlap');
  if(flap)flap.style.transform='rotateX(180deg)';
  setTimeout(()=>{
    document.getElementById('envelopeScene').style.display='none';
    document.getElementById('cardScene').style.display='flex';
    window.scrollTo(0,0);
  },650);
}
function doRSVP(){
  const name=document.getElementById('guestName').value.trim();
  const sel=document.querySelector('input[name="attend"]:checked');
  if(!name){
    const el=document.getElementById('guestName');
    el.style.borderColor='#e8659a';el.focus();
    setTimeout(()=>el.style.borderColor='',1500);return;
  }
  if(!sel){
    const ag=document.querySelector('.attend-grid');
    ag.style.outline='3px solid #e8659a';
    setTimeout(()=>ag.style.outline='',1500);return;
  }
  const msg=document.getElementById('guestMsg').value.trim();
  const yes=sel.value==='yes';
  const attendVal=yes?'我會到！':'線上祝福';

  const base='https://docs.google.com/forms/d/e/1FAIpQLSdlxZuThkPHJhaAO8ZQf0bejq_VZd6GTiw_jdKNKGyl0HPM4g/formResponse';
  const body=new URLSearchParams();
  body.set('entry.1357166799', name);
  body.set('entry.1167612043', attendVal);
  if(msg) body.set('entry.1741352301', msg);
  fetch(base,{method:'POST',mode:'no-cors',body});

  document.getElementById('rsvpForm').style.display='none';
  document.getElementById('successBox').style.display='block';
  document.getElementById('sTitle').textContent=yes?`${name}，我們等你！`:`${name} 的回覆收到了`;
  document.getElementById('sText').textContent=yes
    ?`太好了！期待 5/20 與你相見，一起見證這個時刻。${msg?'\n\n「'+msg+'」':''}`
    :`謝謝你的回覆！雖然這次無法到場，心意我們都收到了。${msg?'\n\n「'+msg+'」':''}`;
  setTimeout(()=>document.getElementById('expFill').style.width='100%',300);
}
