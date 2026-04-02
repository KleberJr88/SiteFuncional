/* Saint Seiya – Armaduras Esquecidas Aqui é o JavaScrip alterado para mudanças de comentarios */

let ttsAtivo = false;
let ttsUtterance = null;

function lerTexto(texto, btnEl) {
  if (!('speechSynthesis' in window)) {
    alert('Seu navegador não suporta leitura de texto.');
    return;
  }

  if (ttsAtivo) {
    window.speechSynthesis.cancel();
    ttsAtivo = false;
    document.querySelectorAll('.btn-access.tts-btn').forEach(b => b.classList.remove('active'));
    return;
  }

  ttsAtivo = true;
  if (btnEl) btnEl.classList.add('active');

  ttsUtterance = new SpeechSynthesisUtterance(texto);
  ttsUtterance.lang = 'pt-BR';
  ttsUtterance.rate = 0.95;
  ttsUtterance.pitch = 1;

  ttsUtterance.onend = () => {
    ttsAtivo = false;
    document.querySelectorAll('.btn-access.tts-btn').forEach(b => b.classList.remove('active'));
  };
  ttsUtterance.onerror = () => {
    ttsAtivo = false;
  };

  // Prefere voz em português se disponível
  const vozes = window.speechSynthesis.getVoices();
  const vozPT = vozes.find(v => v.lang.startsWith('pt'));
  if (vozPT) ttsUtterance.voice = vozPT;

  window.speechSynthesis.speak(ttsUtterance);
}

function coletarTextoSecao(sectionId) {
  const el = document.getElementById(sectionId);
  if (!el) return '';
  const clone = el.cloneNode(true);


  clone.querySelectorAll('button, .btn-access').forEach(b => b.remove());
  return clone.innerText.trim();
}


//Função de Libras
let librasOverlay = null;

function iniciarLibras() {
  if (!librasOverlay) {
    librasOverlay = document.createElement('div');
    librasOverlay.className = 'libras-overlay visible';
    librasOverlay.innerHTML = `
      <button class="libras-close" onclick="fecharLibras()" title="Fechar">✕</button>
      <div style="font-size:2.5rem">🤟</div>
      <p><strong>Libras</strong></p>
      <p>Integração completa com Libras requer um intérprete virtual (VLibras).<br>
         Acesse: <a href="https://vlibras.gov.br" target="_blank" rel="noopener">vlibras.gov.br</a></p>
      <p style="margin-top:8px;font-size:.78rem;opacity:.7">
        Você pode instalar o plugin VLibras no navegador para traduzir esta página automaticamente.
      </p>
    `;
    document.body.appendChild(librasOverlay);
  } else {
    librasOverlay.classList.toggle('visible');
  }
}

function fecharLibras() {
  if (librasOverlay) librasOverlay.classList.remove('visible');
}


let corAtual = '#a8ccff'; // padrão azul claro (cor da fandom mesmo)

function selecionarCor(cor, el) {
  corAtual = cor;
  document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
  if (el) el.classList.add('active');
}

//Dor de cabeça fazer tanto por voz quanto por texto
function salvarComentario() {
  const nomeEl    = document.getElementById('username');
  const comentEl  = document.getElementById('comment');
  const divComentarios = document.getElementById('comentarios');

  if (!nomeEl || !comentEl || !divComentarios) return;

  const nome     = nomeEl.value.trim();
  const comentario = comentEl.value.trim();

  if (nome && comentario) {
    const item = document.createElement('div');
    item.className = 'comment-item';
    item.innerHTML = `<strong style="color:${corAtual}">${nome}</strong>: <span style="color:${corAtual}">${comentario}</span>`;
    divComentarios.appendChild(item);
    nomeEl.value    = '';
    comentEl.value  = '';
    esconderMensagemVoz();
  } else {
    alert('Por favor, preencha o nome e o comentário.');
  }
}



//Aqui é o reconhecimento de voz
let recognition = null;
let gravando    = false;
let timeoutVoz  = null;

function iniciarVoz() {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

  if (!SpeechRecognition) {
    alert('Seu navegador não suporta reconhecimento de voz.\nTente o Google Chrome.');
    return;
  }

  if (gravando) {
    pararVoz();
    return;
  }

  recognition = new SpeechRecognition();
  recognition.lang = 'pt-BR';
  recognition.continuous = true;
  recognition.interimResults = true;

  const btnVoz    = document.getElementById('btn-voice');
  const msgVoz    = document.getElementById('voice-message');
  const comentEl  = document.getElementById('comment');

  gravando = true;
  if (btnVoz) {
    btnVoz.classList.add('recording');
    btnVoz.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><rect x="6" y="4" width="12" height="16" rx="2"/></svg> Parar voz`;
  }

  recognition.onresult = (event) => {
    clearTimeout(timeoutVoz);

    let transcricao = '';
    for (let i = event.resultIndex; i < event.results.length; i++) {
      transcricao += event.results[i][0].transcript;
    }

    if (/\benviar\b/i.test(transcricao)) {
      const texto = transcricao.replace(/\benviar\b/gi, '').trim();
      if (comentEl) comentEl.value = texto;
      pararVoz();
      salvarComentario();
      return;
    }

    if (comentEl) comentEl.value = transcricao;

    timeoutVoz = setTimeout(() => {
      if (gravando && msgVoz) {
        msgVoz.textContent = '🎙️ Você parou de falar. Diga a palavra "Enviar" para enviar seu comentário.';
        msgVoz.classList.add('visible');
      }
    }, 2000);
  };

  recognition.onerror = (e) => {
    console.warn('Erro de voz:', e.error);
    pararVoz();
  };

  recognition.onend = () => {
    if (gravando) pararVoz();
  };

  recognition.start();
}

function pararVoz() {
  gravando = false;
  clearTimeout(timeoutVoz);
  if (recognition) { try { recognition.stop(); } catch(e){} }
  const btnVoz = document.getElementById('btn-voice');
  if (btnVoz) {
    btnVoz.classList.remove('recording');
    btnVoz.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V5a3 3 0 0 1 3-3zm7 9a7 7 0 0 1-14 0H3a9 9 0 0 0 8 8.94V22h2v-2.06A9 9 0 0 0 21 11h-2z"/></svg> 🎙️ Comentar por voz`;
  }
}

function esconderMensagemVoz() {
  const msgVoz = document.getElementById('voice-message');
  if (msgVoz) msgVoz.classList.remove('visible');
}

if ('speechSynthesis' in window) {
  window.speechSynthesis.onvoiceschanged = () => { window.speechSynthesis.getVoices(); };
}
