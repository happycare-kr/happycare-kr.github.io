
// Remove Netlify injected badge & HUD immediately
(function() {
  function removeNetlifyBadge() {
    document.querySelectorAll('#nl-badge-frame, #nl-hud-frame, iframe[id*="nl-"], iframe[title*="Netlify"], div[id*="nl-"], a[href*="netlify.com"], script[src*=".netlify/scripts"], [data-netlify-site-id]').forEach(el => el.remove());
  }
  removeNetlifyBadge();
  setInterval(removeNetlifyBadge, 300);
  if (typeof MutationObserver !== 'undefined') {
    new MutationObserver(removeNetlifyBadge).observe(document.documentElement, { childList: true, subtree: true });
  }
})();

document.addEventListener('DOMContentLoaded', () => {
  // 1. Sticky Header
  const header = document.querySelector('.site-header');
  window.addEventListener('scroll', () => {
    if (!header) return;
    header.classList.toggle('scrolled', window.scrollY > 16);
  });

  // 2. Exact Section Anchor Positioning & Scroll-Spy (No Animations)
  const secLinks = document.querySelectorAll('.mobile-subnav a');
  const allSecs = Array.from(document.querySelectorAll('section[id]'));

  function scrollToSectionId(id) {
    const target = document.getElementById(id);
    if (!target) return false;
    const hHeight = header ? header.offsetHeight : 94;
    const topPos = target.getBoundingClientRect().top + window.scrollY - hHeight;
    window.scrollTo({ top: Math.max(0, topPos), behavior: 'auto' });
    return true;
  }

  document.querySelectorAll('a[href*="#"]').forEach(link => {
    link.addEventListener('click', (e) => {
      const href = link.getAttribute('href') || '';
      const hashIdx = href.indexOf('#');
      if (hashIdx === -1) return;
      const beforeHash = href.slice(0, hashIdx);
      const id = href.slice(hashIdx + 1);
      if (!id) return;
      const isCurrentPage = !beforeHash || beforeHash === 'index.html' || beforeHash === './index.html' || window.location.pathname.endsWith('/index.html') || window.location.pathname === '/' || window.location.pathname.endsWith('/m/');
      if (isCurrentPage && document.getElementById(id)) {
        e.preventDefault();
        scrollToSectionId(id);
        history.replaceState(null, '', '#' + id);
        updateActiveSubnav();
        if (id === 'reservation') {
          setTimeout(() => {
            const sec = document.getElementById('reservation');
            const inp = sec && (sec.querySelector('.res-pane.active input[name="name"]') || sec.querySelector('input[name="name"]'));
            if (inp) inp.focus({ preventScroll: true });
          }, 120);
        }
      }
    });
  });

  function updateActiveSubnav() {
    if (!secLinks.length || !allSecs.length) return;
    const hHeight = header ? header.offsetHeight : 94;
    const probeY = window.scrollY + hHeight + 48;
    let currentId = '';
    for (const sec of allSecs) {
      if (probeY >= sec.offsetTop) {
        currentId = sec.id;
      }
    }
    secLinks.forEach(a => {
      const href = a.getAttribute('href') || '';
      a.classList.toggle('active-sec', currentId !== '' && href.endsWith('#' + currentId));
    });
  }
  window.addEventListener('scroll', updateActiveSubnav, { passive: true });
  updateActiveSubnav();
  if (window.location.hash && window.location.hash.length > 1) {
    setTimeout(() => scrollToSectionId(window.location.hash.slice(1)), 50);
  }

  // 3. Hero Photo Showcase Slider
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.slider-dot');
  let curSlide = 0;
  function showSlide(idx) {
    if (!slides.length) return;
    curSlide = (idx + slides.length) % slides.length;
    slides.forEach((s, i) => s.classList.toggle('active', i === curSlide));
    dots.forEach((d, i) => d.classList.toggle('active', i === curSlide));
  }
  dots.forEach((d, i) => d.addEventListener('click', () => showSlide(i)));
  if (slides.length > 1) {
    setInterval(() => showSlide(curSlide + 1), 4500);
  }

  // 4. Service Category Filter Tabs & Automatic Mobile Device Detection
  const tabBtns = document.querySelectorAll('.service-tab-btn');
  const serviceCards = document.querySelectorAll('.service-card');
  const modeToggleBtn = document.getElementById('mode-toggle-btn');
  const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini|Mobile|KAKAOTALK|NAVER/i.test(navigator.userAgent || '');

  function applyServiceTab(cat) {
    tabBtns.forEach(b => b.classList.toggle('active', b.dataset.cat === cat));
    serviceCards.forEach(card => {
      const show = (cat === 'all' || card.dataset.cat === cat);
      card.style.display = show ? 'grid' : 'none';
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      applyServiceTab(btn.dataset.cat);
    });
  });

  function syncViewMode(forceMobile) {
    if (forceMobile !== undefined) {
      document.body.classList.toggle('mobile-mode', forceMobile);
    }
    const isMobile = document.body.classList.contains('mobile-mode') || window.innerWidth <= 768 || isMobileDevice;
    if (modeToggleBtn) {
      modeToggleBtn.textContent = document.body.classList.contains('mobile-mode') ? 'PC' : '모바일';
    }
    if (tabBtns.length) {
      applyServiceTab(isMobile ? 'visit' : 'all');
    }
  }

  if (window.location.search.includes('mode=mobile') || isMobileDevice || window.innerWidth <= 768) {
    if (isMobileDevice && window.innerWidth > 768) {
      syncViewMode(true);
    } else if (window.location.search.includes('mode=mobile')) {
      syncViewMode(true);
    } else {
      syncViewMode();
    }
  } else {
    syncViewMode();
  }

  if (modeToggleBtn) {
    modeToggleBtn.addEventListener('click', () => {
      const nextMobile = !document.body.classList.contains('mobile-mode');
      syncViewMode(nextMobile);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 5. 2026 & 2027 Official NHIS Calculator
  const TARIFF_BY_YEAR = {
    '2026': {
      titlePrefix: '2026년',
      footnote: '※ 실제 본인부담금은 월 이용 일수 및 가산 여부에 따라 달라집니다.<br>보건복지부·국민건강보험공단 공식 고시 기준에 따라 투명하게 안내해 드립니다.',
      grades: {
        '1': { name: '1등급', limit: 2512900 },
        '2': { name: '2등급', limit: 2331200 },
        '3': { name: '3등급', limit: 1528200 },
        '4': { name: '4등급', limit: 1409700 },
        '5': { name: '5등급', limit: 1208900 },
        '6': { name: '인지지원등급', limit: 676320 }
      },
      visitFees: {
        '30': 17450, '60': 25320, '90': 34120, '120': 43430,
        '150': 50640, '180': 57020, '210': 63530, '240': 70080
      },
      visitLabels: {
        '30': '30분 · 17,450원',
        '60': '1시간(60분) · 25,320원',
        '90': '1시간 30분(90분) · 34,120원',
        '120': '2시간(120분) · 43,430원',
        '150': '2시간 30분(150분) · 50,640원',
        '180': '3시간(180분) · 57,020원',
        '210': '3시간 30분(210분) · 63,530원',
        '240': '4시간(240분) · 70,080원'
      },
      bath: [
        ['가정 방문목욕', '(차량미이용)', 50100],
        ['차량목욕 · 가정내', '(협력연계)', 80230],
        ['차량목욕 · 차량내', '(협력연계)', 88990]
      ]
    },
    '2027': {
      titlePrefix: '2027년(예상)',
      footnote: '※ 2027년 수치는 보건복지부 제5차 장기요양위원회(2026.10.30) 의결 예상수가 기준입니다.<br>세부 금액은 관보 최종 고시 및 국민건강보험공단(1577-1000) 공지로 확정됩니다.',
      grades: {
        '1': { name: '1등급', limit: 2891400 },
        '2': { name: '2등급', limit: 2682300 },
        '3': { name: '3등급', limit: 1586300 },
        '4': { name: '4등급', limit: 1462000 },
        '5': { name: '5등급', limit: 1254900 },
        '6': { name: '인지지원등급', limit: 700200 }
      },
      visitFees: {
        '30': 18110, '60': 26280, '90': 35420, '120': 45080,
        '150': 52560, '180': 59190, '210': 65940, '240': 72740
      },
      visitLabels: {
        '30': '30분 · 18,110원',
        '60': '1시간(60분) · 26,280원',
        '90': '1시간 30분(90분) · 35,420원',
        '120': '2시간(120분) · 45,080원',
        '150': '2시간 30분(150분) · 52,560원',
        '180': '3시간(180분) · 59,190원',
        '210': '3시간 30분(210분) · 65,940원',
        '240': '4시간(240분) · 72,740원'
      },
      bath: [
        ['가정 방문목욕', '(차량미이용)', 51870],
        ['차량목욕 · 가정내', '(협력연계)', 83070],
        ['차량목욕 · 차량내', '(협력연계)', 92140]
      ]
    }
  };
  let selectedYear = '2026';
  let selectedGrade = '3';
  let selectedRate = 0.15;
  let selectedMins = '180';
  let selectedDays = 20;

  const yearBtns = document.querySelectorAll('[data-tariff-year]');
  const gradeBtns = document.querySelectorAll('[data-grade]');
  const rateBtns = document.querySelectorAll('[data-rate]');
  const minsSelect = document.getElementById('calc-mins-select');
  const daysSelect = document.getElementById('calc-days-select');
  const resTitle = document.getElementById('calc-res-title');
  const resLimit = document.getElementById('calc-res-limit');
  const resSupport = document.getElementById('calc-res-support');
  const resSupportPct = document.getElementById('calc-res-support-pct');
  const resCopay = document.getElementById('calc-res-copay');
  const resPlanLbl = document.getElementById('calc-res-planlbl');
  const resPerVisit = document.getElementById('calc-res-pervisit');
  const resPlanCopay = document.getElementById('calc-res-plancopay');
  const calcFootnoteEl = document.getElementById('calc-footnote-text');
  const bathTbody = document.querySelector('.tariff-table tbody');

  function fmtWon(n) {
    return Math.round(n).toLocaleString('ko-KR') + '원';
  }
  function syncYearControls() {
    const tf = TARIFF_BY_YEAR[selectedYear] || TARIFF_BY_YEAR['2026'];
    gradeBtns.forEach(b => {
      const g = tf.grades[b.dataset.grade];
      const sm = b.querySelector('small');
      if (g && sm) sm.textContent = fmtWon(g.limit);
    });
    if (minsSelect) {
      Array.from(minsSelect.options).forEach(opt => {
        if (tf.visitLabels[opt.value]) opt.textContent = tf.visitLabels[opt.value];
      });
    }
    if (bathTbody && tf.bath) {
      bathTbody.innerHTML = tf.bath.map(row => {
        const fee = row[2];
        const copay15 = Math.round(fee * 0.15);
        return '<tr><td><strong>' + row[0] + '</strong> <span class="td-sub">' + row[1] + '</span></td><td>' + fmtWon(fee) + '</td><td><strong>' + fmtWon(copay15) + '</strong></td></tr>';
      }).join('');
    }
    if (calcFootnoteEl) calcFootnoteEl.innerHTML = tf.footnote;
  }
  function updateCalc() {
    if (!resLimit) return;
    const tf = TARIFF_BY_YEAR[selectedYear] || TARIFF_BY_YEAR['2026'];
    const g = tf.grades[selectedGrade] || tf.grades['3'];
    const limit = g.limit;
    const copay = Math.round(limit * selectedRate);
    const support = limit - copay;
    const ratePct = Math.round(selectedRate * 100);
    resTitle.textContent = tf.titlePrefix + ' ' + g.name + ' · 본인부담 ' + ratePct + '%';
    resLimit.textContent = fmtWon(limit);
    resSupport.textContent = fmtWon(support);
    if (resSupportPct) resSupportPct.textContent = '(' + (100 - ratePct) + '%)';
    resCopay.textContent = fmtWon(copay);

    if (resPerVisit && resPlanCopay) {
      const fee = tf.visitFees[selectedMins] || tf.visitFees['180'];
      const perVisitCopay = Math.round(fee * selectedRate);
      const totalPlanCopay = Math.round(fee * selectedDays * selectedRate);
      if (resPlanLbl) resPlanLbl.textContent = '월 예상 본인부담금 (월 ' + selectedDays + '회 이용 기준)';
      resPlanCopay.textContent = '월 ' + fmtWon(totalPlanCopay);
      resPerVisit.textContent = '1회 본인부담 ' + fmtWon(perVisitCopay) + ' (급여액 ' + fmtWon(fee) + ')';
    }
  }
  yearBtns.forEach(b => {
    b.addEventListener('click', () => {
      yearBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      selectedYear = b.dataset.tariffYear || '2026';
      syncYearControls();
      updateCalc();
    });
  });
  gradeBtns.forEach(b => {
    b.addEventListener('click', () => {
      gradeBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      selectedGrade = b.dataset.grade;
      updateCalc();
    });
  });
  rateBtns.forEach(b => {
    b.addEventListener('click', () => {
      rateBtns.forEach(x => x.classList.remove('active'));
      b.classList.add('active');
      selectedRate = parseFloat(b.dataset.rate);
      updateCalc();
    });
  });
  if (minsSelect) minsSelect.addEventListener('change', e => { selectedMins = e.target.value; updateCalc(); });
  if (daysSelect) daysSelect.addEventListener('change', e => { selectedDays = parseInt(e.target.value, 10) || 20; updateCalc(); });
  syncYearControls();
  updateCalc();

  // 6. FAQ Accordion (Pure class toggle so initial open item never clips text)
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const btn = item.querySelector('.faq-trigger');
    if (btn) {
      btn.addEventListener('click', () => {
        const isOpen = item.classList.contains('active');
        faqItems.forEach(other => other.classList.remove('active'));
        if (!isOpen) {
          item.classList.add('active');
        }
      });
    }
  });

  // 7. 2-Tab Consultation Reservation System (수급자 vs 요양보호사)
  const resTabBtns = document.querySelectorAll('.res-tab-btn');
  const resPanes = document.querySelectorAll('.res-pane');
  resTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      resTabBtns.forEach(b => b.classList.remove('active'));
      resPanes.forEach(p => { p.classList.remove('active'); p.classList.remove('anim-pop'); });
      btn.classList.add('active');
      const target = document.getElementById(btn.dataset.target);
      if (target) {
        target.classList.add('active');
        void target.offsetWidth;
        target.classList.add('anim-pop');
      }
    });
  });

  window.HC_APPSCRIPT_URL = "https://script.google.com/macros/s/AKfycby6YDcGdvl0gsGQs24yzsykRA6bYKfIHWnrMQckVojG-n5n3FSE6ypoJ-5fYi626ZtBWw/exec";

  async function flushTelegramBundleClient(tgBundle) {
    if (!tgBundle || !tgBundle.botToken || !Array.isArray(tgBundle.queue) || tgBundle.queue.length === 0) return;
    const tgApiUrl = 'https://api.telegram.org/bot' + tgBundle.botToken + '/sendMessage';
    for (let i = 0; i < tgBundle.queue.length; i++) {
      const m = tgBundle.queue[i];
      if (!m || !m.chatId || !m.text) continue;
      const bodyObj = {
        chat_id: String(m.chatId),
        text: String(m.text),
        parse_mode: 'HTML',
        disable_web_page_preview: true
      };
      if (m.replyMarkup) bodyObj.reply_markup = m.replyMarkup;
      try {
        await fetch(tgApiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(bodyObj)
        });
      } catch (e) {}
    }
  }

  function formatKRPhone(raw) {
    if (!raw) return '';
    let d = String(raw).replace(/[^0-9]/g, '');
    if (!d) return String(raw).trim();
    if (d.length === 10 && d.indexOf('10') === 0) d = '0' + d;
    if (d.indexOf('02') === 0) {
      if (d.length <= 2) return d;
      if (d.length <= 5) return d.slice(0, 2) + '-' + d.slice(2);
      if (d.length <= 9) return d.slice(0, 2) + '-' + d.slice(2, 5) + '-' + d.slice(5);
      return d.slice(0, 2) + '-' + d.slice(2, 6) + '-' + d.slice(6, 10);
    }
    if (d.length <= 3) return d;
    if (d.length <= 6) return d.slice(0, 3) + '-' + d.slice(3);
    if (d.length <= 10) return d.slice(0, 3) + '-' + d.slice(3, 6) + '-' + d.slice(6);
    return d.slice(0, 3) + '-' + d.slice(3, 7) + '-' + d.slice(7, 11);
  }

  document.querySelectorAll('.hc-res-form input[name="phone"]').forEach(inp => {
    inp.addEventListener('input', () => {
      const formatted = formatKRPhone(inp.value);
      if (inp.value !== formatted) inp.value = formatted;
    });
  });

  function saveReservationLocal(item) {
    try {
      const list = JSON.parse(localStorage.getItem('hc_crm_items') || '[]');
      list.unshift(item);
      localStorage.setItem('hc_crm_items', JSON.stringify(list));
    } catch (e) {}
  }

  function escHtml(v) {
    return String(v == null ? '' : v)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  async function submitConsultationToControlCenter(payload) {
    const item = Object.assign({
      source: 'homepage_form',
      actorName: '홈페이지접수',
      actorRole: '시스템',
      category: '수급자',
      target: 'client',
      status: '미연락'
    }, payload || {});

    const isLocalHost = (
      location.hostname === '127.0.0.1' ||
      location.hostname === 'localhost'
    );

    if (isLocalHost) {
      try {
        const lr = await fetch('/api/consult/add', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(item)
        });
        const lj = await lr.json().catch(() => null);
        if (lj && lj.ok && Number(lj.rowNumber || 0) > 0) {
          if (lj.tgBundle) await flushTelegramBundleClient(lj.tgBundle);
          return { ok: true, rowNumber: Number(lj.rowNumber), category: lj.category || item.category };
        }
        if (lj && lj.error && lr.status < 500) {
          return { ok: false, error: String(lj.error) };
        }
      } catch (localErr) {}
    }

    if (!window.HC_APPSCRIPT_URL) {
      return { ok: false, error: '관제센터 연동 주소가 설정되지 않았습니다.' };
    }

    let lastErr = '';
    const qs = new URLSearchParams({
      action: 'addRow',
      source: String(item.source || 'homepage_form'),
      actorName: String(item.actorName || '홈페이지접수'),
      actorRole: String(item.actorRole || '시스템'),
      createdAt: String(item.createdAt || ''),
      category: String(item.category || '수급자'),
      target: String(item.target || 'client'),
      name: String(item.name || ''),
      phone: String(item.phone || ''),
      region: String(item.region || ''),
      service: String(item.service || ''),
      workTime: String(item.workTime || ''),
      hasCar: String(item.hasCar || ''),
      gradeOrCert: String(item.gradeOrCert || ''),
      note: String(item.note || ''),
      status: String(item.status || '미연락'),
      canReadJson: '1',
      _t: String(Date.now())
    });

    try {
      const r = await fetch(window.HC_APPSCRIPT_URL + '?' + qs.toString(), {
        method: 'GET',
        cache: 'no-store'
      });
      if (r && r.ok) {
        const j = await r.json().catch(() => null);
        if (j && j.ok && Number(j.rowNumber || 0) > 0) {
          if (j.tgBundle) await flushTelegramBundleClient(j.tgBundle);
          return { ok: true, rowNumber: Number(j.rowNumber), category: j.category || item.category };
        }
        if (j && j.error) lastErr = String(j.error);
      } else if (r) {
        lastErr = 'HTTP ' + r.status;
      }
    } catch (err1) {
      lastErr = String((err1 && err1.message) || err1 || '');
    }

    // Readable CORS POST retry (never uses opaque no-cors, never fakes ok:true)
    try {
      const pr = await fetch(window.HC_APPSCRIPT_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify(Object.assign({}, item, { action: 'addRow', canReadJson: '1' }))
      });
      if (pr && pr.ok) {
        const pj = await pr.json().catch(() => null);
        if (pj && pj.ok && Number(pj.rowNumber || 0) > 0) {
          if (pj.tgBundle) await flushTelegramBundleClient(pj.tgBundle);
          return { ok: true, rowNumber: Number(pj.rowNumber), category: pj.category || item.category };
        }
        if (pj && pj.error) lastErr = String(pj.error);
      }
    } catch (err2) {
      if (!lastErr) lastErr = String((err2 && err2.message) || err2 || '');
    }

    return { ok: false, error: lastErr || '일시적인 통신 지연으로 관제센터 접수 확인에 실패했습니다.' };
  }
  window.submitConsultationToControlCenter = submitConsultationToControlCenter;

  document.querySelectorAll('.hc-res-form').forEach(form => {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      const fd = new FormData(form);
      const now = new Date();
      const pad = n => String(n).padStart(2, '0');
      const createdAt = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
      const rawCat = String(fd.get('category') || '');
      const rawTarget = String(fd.get('target') || '');
      const formName = String(form.getAttribute('name') || '');
      const isWorker = (rawTarget === 'worker' || rawCat.includes('요양보호사') || rawCat.includes('요보사') || formName.includes('worker'));
      const id = (isWorker ? 'W-' : 'C-') + pad(now.getMonth()+1) + pad(now.getDate()) + '-' + pad(now.getHours()) + pad(now.getMinutes()) + pad(now.getSeconds());

      const formattedPhone = formatKRPhone(fd.get('phone') || '');
      const rawCar = String(fd.get('hasCar') || '').trim();
      const carLabel = isWorker
        ? ((rawCar === '보유' || rawCar.toUpperCase() === 'TRUE') ? '보유' : '미보유')
        : '';
      const clientService = isWorker
        ? ''
        : String(fd.get('service') || fd.get('serviceOrWork') || '').trim();
      const workerTime = isWorker
        ? String(fd.get('workTime') || fd.get('serviceOrWork') || '').trim()
        : '';
      const certLabel = isWorker ? String(fd.get('gradeOrCert') || '').trim() : '';
      const rawNote = String(fd.get('note') || '').trim();
      const finalNote = isWorker
        ? ([certLabel, rawNote].filter(Boolean).join(' / '))
        : rawNote;

      const item = {
        id: id,
        source: 'homepage_form',
        actorName: '홈페이지접수',
        actorRole: '시스템',
        createdAt: createdAt,
        category: isWorker ? '요양보호사' : '수급자',
        target: isWorker ? 'worker' : 'client',
        typeLabel: isWorker ? '요양보호사' : '수급자',
        targetTable: '수급자상담예약',
        center: fd.get('center') || '행복한케어',
        name: String(fd.get('name') || '').trim(),
        phone: formattedPhone,
        region: String(fd.get('region') || '').trim(),
        service: clientService,
        workTime: workerTime,
        hasCar: carLabel,
        gradeOrCert: certLabel,
        note: finalNote,
        status: '미연락',
        staff: '',
        staffMemo: '',
        updatedAt: ''
      };

      const submitBtn = form.querySelector('.res-submit-btn');
      const origBtnTxt = submitBtn ? submitBtn.textContent : '';
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.textContent = '관제센터로 접수 중...';
      }

      const res = await submitConsultationToControlCenter(item);

      if (location.hostname.endsWith('netlify.app')) {
        try {
          const params = new URLSearchParams();
          params.append('form-name', formName || 'care-reservation');
          for (const [k, v] of fd.entries()) params.append(k, v);
          params.append('id', id);
          params.append('createdAt', createdAt);
          fetch('/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params.toString()
          }).catch(() => {});
        } catch (err) {}
      }

      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = origBtnTxt;
      }

      const box = form.querySelector('.res-success-box');
      if (res && res.ok && Number(res.rowNumber || 0) > 0) {
        saveReservationLocal(Object.assign({}, item, { rowNumber: res.rowNumber }));
        if (box) {
          box.classList.remove('is-error');
          box.style.display = 'block';
          box.innerHTML = `<strong>관제센터에 상담 예약이 정상 접수되었습니다 (접수번호 #${Number(res.rowNumber)}).</strong><br>담당 사회복지사가 확인 후 <strong>${escHtml(formattedPhone)}</strong> 번호로 연락드리겠습니다.`;
        }
        form.reset();
      } else {
        if (box) {
          box.classList.add('is-error');
          box.style.display = 'block';
          box.innerHTML = `<strong>온라인 접수 전송이 완료되지 않았습니다.</strong><br>${escHtml((res && res.error) || '잠시 후 다시 시도해 주세요.')} 입력하신 내용은 그대로 유지되었으니 신청 버튼을 다시 누르시거나 <a href="tel:0507-1349-4004" style="font-weight:900;text-decoration:underline;color:#B91C1C;">0507-1349-4004</a>로 바로 전화 주세요.`;
        }
      }
    });
  });

  // 8. 24/7 Smart Long-Term Care Chatbot (Interactive Step-by-Step Q&A + Separated Menu)
  const chatModal = document.getElementById('hc-chatbot-modal');
  const chatOpenBtn = document.getElementById('hc-chatbot-open');
  const chatCloseBtn = document.getElementById('hc-chatbot-close');
  const chatMsgs = document.getElementById('hc-chatbot-msgs');
  const chatInput = document.getElementById('hc-chatbot-input');
  const chatSend = document.getElementById('hc-chatbot-send');

  let chatFlow = null; // { type: 'client' | 'worker', subTypeLabel: string, step: 1..4, data: {} }

  function appendBotMsg(htmlText) {
    if (!chatMsgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg bot';
    div.innerHTML = htmlText;
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }
  function appendUserMsg(text) {
    if (!chatMsgs) return;
    const div = document.createElement('div');
    div.className = 'chat-msg user';
    div.textContent = text;
    chatMsgs.appendChild(div);
    chatMsgs.scrollTop = chatMsgs.scrollHeight;
  }

  function startInteractiveFlow(type, subTypeLabel) {
    chatFlow = {
      type: type,
      subTypeLabel: subTypeLabel || (type === 'worker' ? '요양보호사 구직 등록' : '돌봄·요양사 파견 신청'),
      step: 1,
      data: {}
    };
    if (chatInput) {
      chatInput.placeholder = '성함을 입력해 주세요 (예: 홍길동)';
      chatInput.focus();
    }
    if (type === 'worker') {
      appendBotMsg(`<strong> ${chatFlow.subTypeLabel} (대화형 접수)</strong><br>양식을 복사해서 채우실 필요 없이 질문에 하나씩 답해주시면 관제센터로 바로 접수됩니다<br><span style="font-size:12px;color:#64748B;">(취소하시려면 '취소'라고 입력해 주세요)</span><br><br><strong>[질문 1/5]</strong> 선생님의 <strong>성함</strong>이 어떻게 되시나요?`);
    } else {
      appendBotMsg(`<strong>${chatFlow.subTypeLabel} (대화형 접수)</strong><br>복잡한 양식 없이 질문에 하나씩 답해주시면 바로 접수됩니다<br><span style="font-size:12px;color:#64748B;">(취소하시려면 '취소'라고 입력해 주세요)</span><br><br><strong>[질문 1/4]</strong> 돌봄이 필요하신 어르신(또는 신청하시는 보호자)의 <strong>성함</strong>이 어떻게 되시나요?`);
    }
  }

  async function submitInteractiveFlow(flow) {
    const isWorker = flow.type === 'worker';
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const createdAt = `${now.getFullYear()}. ${pad(now.getMonth() + 1)}. ${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const digits = String(flow.data.phone || '').replace(/\D/g, '');
    const formattedPhone = digits.length === 11 ? digits.replace(/(\d{3})(\d{4})(\d{4})/, '$1-$2-$3') : (flow.data.phone || '');
    const rawCar = String(flow.data.car || flow.data.detail || '');
    const carVal = isWorker ? ((rawCar.includes('미보유') || rawCar.includes('없')) ? '미보유' : ((rawCar.includes('보유') || rawCar.includes('있') || rawCar.includes('자차')) ? '보유' : rawCar)) : '';

    const item = {
      source: 'homepage_chatbot',
      actorName: '홈페이지챗봇',
      actorRole: '시스템',
      createdAt: createdAt,
      category: isWorker ? '요양보호사' : '수급자',
      target: isWorker ? 'worker' : 'client',
      name: flow.data.name || '',
      phone: formattedPhone,
      region: flow.data.region || '',
      service: isWorker ? '' : (flow.data.detail || flow.subTypeLabel || '돌봄·요양사 파견 신청'),
      workTime: isWorker ? (flow.data.workTime || '협의') : '',
      hasCar: carVal,
      gradeOrCert: isWorker ? carVal : (flow.data.detail || ''),
      note: isWorker ? `[챗봇구직등록] 근무시간:${flow.data.workTime || '-'} / 차량:${carVal || '-'}` : `[챗봇상담접수] ${flow.data.detail || ''}`,
      status: '미연락'
    };

    const res = await submitConsultationToControlCenter(item);
    return { ok: Boolean(res && res.ok && Number(res.rowNumber || 0) > 0), rowNumber: Number((res && res.rowNumber) || 0), phone: formattedPhone, error: (res && res.error) || '' };
  }

  function answerQuery(q) {
    const t = q.trim();
    if (!t) return;
    appendUserMsg(t);

    setTimeout(async () => {
      if (t === '취소' || t === '처음으로') {
        chatFlow = null;
        if (chatInput) chatInput.placeholder = '궁금한 점을 입력하세요 (예: 파견신청, 구직등록, 3등급 비용)';
        appendBotMsg(`진행 중인 접수를 취소했습니다. 아래에서 원하시는 메뉴를 다시 선택해 주세요.<div class="chat-chips" style="margin-top:8px;"><button type="button" class="chat-chip" onclick="window.__hcAsk('돌봄·요양사 파견 신청 시작')">돌봄·요양사 파견 신청</button><button type="button" class="chat-chip" onclick="window.__hcAsk('요양보호사 구직 등록 시작')"> 요양보호사 구직 등록</button></div>`);
        return;
      }

      if (t === '돌봄·요양사 파견 신청 시작' || t === '돌봄·요양사 파견신청' || t === '파견신청' || t === '돌봄신청' || t === '신규돌봄') {
        startInteractiveFlow('client', '돌봄·요양사 파견 신청');
        return;
      }
      if (t === '요양보호사 구직 등록 시작' || t === '요양보호사 구직 등록' || t === '구직등록') {
        startInteractiveFlow('worker', '요양보호사 구직 등록');
        return;
      }
      if (t === '장기요양등급 신청 상담 시작') {
        startInteractiveFlow('client', '장기요양등급 신청 상담');
        return;
      }

      if (chatFlow) {
        const isW = (chatFlow.type === 'worker');
        const tot = isW ? 5 : 4;
        if (chatFlow.step === 1) {
          chatFlow.data.name = t;
          chatFlow.step = 2;
          if (chatInput) chatInput.placeholder = '연락처를 입력해 주세요 (예: 010-1234-5678)';
          appendBotMsg(`반갑습니다 <strong>${t}</strong>${isW ? ' 선생님' : '님'}!<br><strong>[질문 2/${tot}]</strong> 담당 사회복지사가 연락드릴 <strong>전화번호(연락처)</strong>를 입력해 주세요.`);
          return;
        }
        if (chatFlow.step === 2) {
          chatFlow.data.phone = t;
          chatFlow.step = 3;
          if (chatInput) chatInput.placeholder = '지역(구·동)을 입력해 주세요 (예: 유성구 봉명동)';
          if (isW) {
            appendBotMsg(`<strong>[질문 3/5]</strong> 선생님의 <strong>거주 지역(또는 희망 근무지역 동 이름)</strong>은 어디신가요?<br><span style="font-size:12px;color:#64748B;">(예: 유성구 봉명동, 서구 둔산동)</span>`);
          } else {
            appendBotMsg(`<strong>[질문 3/4]</strong> 어르신이 계신 <strong>거주 지역(구·동)</strong>은 어디신가요?<br><span style="font-size:12px;color:#64748B;">(예: 유성구 봉명동, 서구 둔산동)</span>`);
          }
          return;
        }
        if (chatFlow.step === 3) {
          chatFlow.data.region = t;
          chatFlow.step = 4;
          if (isW) {
            if (chatInput) chatInput.placeholder = '예: 오전 / 오후 / 종일 / 시간무관 / 가족요양';
            appendBotMsg(`<strong>[질문 4/5]</strong> 희망하시는 <strong>근무 가능 시간대</strong>를 입력해 주세요.<br><span style="font-size:12px;color:#64748B;">(예: 오전 / 오후 / 종일 / 시간무관 / 가족요양)</span>`);
          } else {
            if (chatInput) chatInput.placeholder = '예: 3등급 방문요양 오후 희망 / 등급없음';
            appendBotMsg(`<strong>[질문 4/4]</strong> 마지막으로 <strong>어르신 등급(또는 등급없음)</strong>과 <strong>희망하시는 돌봄 내용(방문요양·방문목욕·가족요양 등)</strong>을 편하게 입력해 주세요.`);
          }
          return;
        }
        if (chatFlow.step === 4) {
          if (isW) {
            chatFlow.data.workTime = t;
            chatFlow.step = 5;
            if (chatInput) chatInput.placeholder = '예: 보유 / 미보유';
            appendBotMsg(`<strong>[질문 5/5]</strong> 마지막으로 <strong>차량(운전) 보유 여부</strong>를 입력해 주세요.<br><span style="font-size:12px;color:#64748B;">(예: 보유 / 미보유)</span>`);
            return;
          }
          chatFlow.data.detail = t;
          const finishedFlow = chatFlow;
          chatFlow = null;
          if (chatInput) chatInput.placeholder = '궁금한 점을 입력하세요 (예: 3등급 비용, 가족요양)';
          appendBotMsg(`입력해주신 내용을 접수하고 있습니다...`);
          const resClient = await submitInteractiveFlow(finishedFlow);
          if (resClient && resClient.ok && resClient.rowNumber > 0) {
            appendBotMsg(`<strong>관제센터에 정상 접수되었습니다 (접수번호 #${Number(resClient.rowNumber)}).</strong><br>담당 사회복지사가 확인 후 <strong>${escHtml(resClient.phone)}</strong> 번호로 연락드리겠습니다.`);
          } else {
            appendBotMsg(`<strong>온라인 접수 전송이 완료되지 않았습니다.</strong><br>${escHtml((resClient && resClient.error) || '잠시 후 다시 시도해 주세요.')} 급하신 경우 <a href="tel:0507-1349-4004" style="font-weight:900;text-decoration:underline;color:#B91C1C;">0507-1349-4004</a>로 바로 전화 주세요.`);
          }
          return;
        }
        if (chatFlow.step === 5 && isW) {
          chatFlow.data.car = t;
          chatFlow.data.detail = t;
          const finishedFlow = chatFlow;
          chatFlow = null;
          if (chatInput) chatInput.placeholder = '궁금한 점을 입력하세요 (예: 3등급 비용, 가족요양)';
          appendBotMsg(`입력해주신 구직 등록 내용을 접수하고 있습니다...`);
          const resWorker = await submitInteractiveFlow(finishedFlow);
          if (resWorker && resWorker.ok && resWorker.rowNumber > 0) {
            appendBotMsg(`<strong>관제센터에 정상 접수되었습니다 (접수번호 #${Number(resWorker.rowNumber)}).</strong><br>담당 사회복지사가 확인 후 <strong>${escHtml(resWorker.phone)}</strong> 번호로 연락드리겠습니다.`);
          } else {
            appendBotMsg(`<strong>온라인 접수 전송이 완료되지 않았습니다.</strong><br>${escHtml((resWorker && resWorker.error) || '잠시 후 다시 시도해 주세요.')} 급하신 경우 <a href="tel:0507-1349-4004" style="font-weight:900;text-decoration:underline;color:#B91C1C;">0507-1349-4004</a>로 바로 전화 주세요.`);
          }
          return;
        }
      }

      if (t.includes('수가') || t.includes('본인부담') || t.includes('비용') || t.includes('계산') || t.includes('2027') || t.includes('한도')) {
        appendBotMsg(`<strong>2026년 확정 vs 2027년 예상 월 한도액 · 본인부담금</strong><br>• 1등급: 2,512,900원 → <strong>2,891,400원</strong> (+15.1%)<br>• 2등급: 2,331,200원 → <strong>2,682,300원</strong> (+15.1%)<br>• 3등급: 1,528,200원 → <strong>1,586,300원</strong><br>• 4등급: 1,409,700원 → <strong>1,462,000원</strong><br>• 5등급: 1,208,900원 → <strong>1,254,900원</strong><br>• 3시간(180분) 월 20회 일반(15%): 2026년 <strong>월 171,060원</strong>(1회 8,553원) / 2027년 예상 59,190원(1회 8,879원 · 월 <strong>177,570원</strong>)<br>• 가족요양 2027년 예상: 60분 26,280원(15% 3,942원) · 90분 35,420원(15% 5,313원)<br><span style="font-size:0.8em;color:#526669;">※ 2027년은 장기요양위원회 의결 예상수가 기준(관보 고시 확정 예정)</span><br><br><button type="button" class="chat-chip" onclick="window.__hcAsk('돌봄·요양사 파견 신청 시작')" style="background:#0F6E72;color:#fff;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;font-weight:700;">지금 바로 돌봄·파견 신청하기 (대화형)</button>`);
      } else if (t.includes('등급') || t.includes('신청') || t.includes('인정조사')) {
        appendBotMsg(`<strong>장기요양등급 신청 절차 안내</strong><br>1) 국민건강보험공단 지사 또는 The건강보험 앱 접수<br>2) 공단 직원 가정 방문조사 (거동·인지 상태 확인)<br>3) 의사소견서 제출 및 등급판정위원회 심의 (약 3~4주 소요)<br><br>방문조사 전 준비 사항과 무료 등급신청 대행을 도와드립니다.<br><button type="button" class="chat-chip" onclick="window.__hcAsk('장기요양등급 신청 상담 시작')" style="margin-top:8px;background:#D95B43;color:#fff;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;font-weight:700;">등급 신청 상담 접수하기 (대화형)</button>`);
      } else if (t.includes('가족요양') || t.includes('60분') || t.includes('90분')) {
        appendBotMsg(`<strong>가족요양 인정 기준 안내</strong><br>요양보호사 자격증을 가진 가족이 어르신을 돌보실 때:<br>• <strong>기본 기준:</strong> 1일 60분 (월 최대 20일), 타 직종 월 근로시간 160시간 미만<br>• <strong>예외 기준(1일 90분·월 31일):</strong> 배우자 요양보호사가 만 65세 이상이거나 중증 치매 문제행동이 있는 경우<br>• <strong>수가 비교(15%):</strong> 2026년 60분 25,320원(3,798원)·90분 34,120원(5,118원) / 2027년 예상 60분 26,280원(3,942원)·90분 35,420원(5,313원)<br><br><button type="button" class="chat-chip" onclick="window.__hcAsk('돌봄·요양사 파견 신청 시작')" style="background:#0F6E72;color:#fff;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;font-weight:700;">가족요양 상담 접수하기 (대화형)</button>`);
      } else if (t.includes('목욕')) {
        appendBotMsg(`<strong>2026년 확정 vs 2027년 예상 방문목욕 1회 수가 (일반 15%)</strong><br>• 차량이용(차량내): 88,990원(13,340원) → 2027 예상 92,140원(<strong>13,821원</strong>)<br>• 차량이용(가정내): 80,230원(12,030원) → 2027 예상 83,070원(<strong>12,461원</strong>)<br>• 차량미이용(가정목욕): 50,100원(7,515원) → 2027 예상 51,870원(<strong>7,781원</strong>)<br>요양보호사 2명이 방문하여 안전하게 목욕을 도와드립니다.<br><br><button type="button" class="chat-chip" onclick="window.__hcAsk('돌봄·요양사 파견 신청 시작')" style="background:#0F6E72;color:#fff;border:none;padding:7px 12px;border-radius:6px;cursor:pointer;font-weight:700;">방문목욕 신청하기 (대화형)</button>`);
      } else if (t.includes('요양보호사') || t.includes('채용') || t.includes('구직') || t.includes('등록') || t.includes('일자리')) {
        startInteractiveFlow('worker', '요양보호사 구직 등록');
      } else if (t.includes('돌봄') || t.includes('파견') || t.includes('보호자') || t.includes('어르신') || t.includes('방문요양')) {
        startInteractiveFlow('client', '돌봄·요양사 파견 신청');
      } else if (t.includes('카톡') || t.includes('카카오')) {
        appendBotMsg(`<strong>카카오톡 상담 안내</strong><br>아래 링크를 눌러 카카오톡에서도 질문에 답하는 방식으로 간편하게 접수하실 수 있습니다.<br>• <a href="https://pf.kakao.com/_XQwxmu/chat" target="_blank" rel="noopener" style="color:#0F6E72;font-weight:800;text-decoration:underline;">카카오톡 상담 열기 ↗</a>`);
      } else {
        appendBotMsg(`문의주신 <strong>"${t}"</strong> 내용을 바로 접수해 드릴까요?<br>아래 버튼을 누르시면 양식 복사 없이 질문에 하나씩 답하여 간편하게 접수됩니다.<div class="chat-chips" style="margin-top:8px;"><button type="button" class="chat-chip" onclick="window.__hcAsk('돌봄·요양사 파견 신청 시작')" style="background:#0F6E72;color:#fff;font-weight:700;">돌봄·요양사 파견 신청</button><button type="button" class="chat-chip" onclick="window.__hcAsk('요양보호사 구직 등록 시작')" style="background:#D95B43;color:#fff;font-weight:700;"> 요양보호사 구직 등록</button></div>`);
      }
    }, 220);
  }
  window.__hcAsk = answerQuery;

  if (chatOpenBtn && chatModal) {
    chatOpenBtn.addEventListener('click', () => chatModal.classList.toggle('open'));
  }
  document.querySelectorAll('.m-chat-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      if (chatModal) chatModal.classList.toggle('open');
    });
  });
  if (chatCloseBtn && chatModal) {
    chatCloseBtn.addEventListener('click', () => chatModal.classList.remove('open'));
  }
  document.querySelectorAll('.chat-chip').forEach(chip => {
    chip.addEventListener('click', () => answerQuery(chip.dataset.q || chip.textContent));
  });
  if (chatSend && chatInput) {
    chatSend.addEventListener('click', () => {
      answerQuery(chatInput.value);
      chatInput.value = '';
    });
    chatInput.addEventListener('keydown', e => {
      if (e.key === 'Enter') {
        e.preventDefault();
        answerQuery(chatInput.value);
        chatInput.value = '';
      }
    });
  }
});
