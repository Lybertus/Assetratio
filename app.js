/**
 * AssetRatio - Portfolio Invest & Cash Calculator
 * Apple OLED Dark Theme for iPhone 15 Pro Max & MacBook Pro M4
 */

(() => {
  'use strict';

  // Constants
  const STORAGE_KEY = 'assetratio_data_v1';
  const CIRCUMFERENCE = 2 * Math.PI * 90; // approx 565.487

  // Default state
  const defaultState = {
    currency: 'EUR',
    privacyMode: false,
    activeTab: 'quick',
    targetInvestPct: 80,
    quickInvest: 75000,
    quickCash: 25000,
    positions: [
      { id: '1', name: 'Core MSCI World ETF', category: 'invest', amount: 65000 },
      { id: '2', name: 'Krypto & Einzeltitel', category: 'invest', amount: 10000 },
      { id: '3', name: 'Tagesgeld (3.5% Zinsen)', category: 'cash', amount: 20000 },
      { id: '4', name: 'Girokonto / Puffer', category: 'cash', amount: 5000 }
    ],
    cashflowDeposit: 1000,
    interestRate: 3.5,
    marketRate: 7.0
  };

  // State object
  let state = { ...defaultState };

  // DOM Elements
  const elements = {
    currencySelect: document.getElementById('currency-select'),
    currencySigns: document.querySelectorAll('.currency-sign'),
    privacyToggleBtn: document.getElementById('privacy-toggle-btn'),
    quickExportBtn: document.getElementById('quick-export-btn'),
    eyeIconOpen: document.getElementById('eye-icon-open'),
    eyeIconClosed: document.getElementById('eye-icon-closed'),
    settingsBtn: document.getElementById('settings-btn'),
    tabQuick: document.getElementById('tab-quick'),
    tabDetail: document.getElementById('tab-detail'),
    viewQuick: document.getElementById('view-quick'),
    viewDetail: document.getElementById('view-detail'),
    // Chart & Stats
    chartRingCash: document.getElementById('chart-ring-cash'),
    chartRingInvest: document.getElementById('chart-ring-invest'),
    statTotalAmount: document.getElementById('stat-total-amount'),
    statInvestPct: document.getElementById('stat-invest-pct'),
    statInvestAmount: document.getElementById('stat-invest-amount'),
    statCashPct: document.getElementById('stat-cash-pct'),
    statCashAmount: document.getElementById('stat-cash-amount'),
    // Rebalancing
    targetSlider: document.getElementById('target-slider'),
    targetInvestLabel: document.getElementById('target-invest-label'),
    targetCashLabel: document.getElementById('target-cash-label'),
    presetBtns: document.querySelectorAll('.preset-btn'),
    rebalanceCard: document.getElementById('rebalance-card'),
    rebalanceIcon: document.getElementById('rebalance-icon'),
    rebalanceTitle: document.getElementById('rebalance-title'),
    rebalanceDescription: document.getElementById('rebalance-description'),
    cashflowInput: document.getElementById('cashflow-input'),
    cashflowResult: document.getElementById('cashflow-result'),
    // Feature 5: Interest & Opportunity Cost
    toggleInterestControls: document.getElementById('toggle-interest-controls'),
    interestControlsWrap: document.getElementById('interest-controls-wrap'),
    sliderInterestRate: document.getElementById('slider-interest-rate'),
    sliderMarketRate: document.getElementById('slider-market-rate'),
    labelInterestRate: document.getElementById('label-interest-rate'),
    labelMarketRate: document.getElementById('label-market-rate'),
    oppInterestAnnual: document.getElementById('opp-interest-annual'),
    oppInterestMonthly: document.getElementById('opp-interest-monthly'),
    oppCostAnnual: document.getElementById('opp-cost-annual'),
    oppCostDiff: document.getElementById('opp-cost-diff'),
    oppBarCashPct: document.getElementById('opp-bar-cash-pct'),
    oppBarMarketPct: document.getElementById('opp-bar-market-pct'),
    oppBarFillIncome: document.getElementById('opp-bar-fill-income'),
    oppBarFillDiff: document.getElementById('opp-bar-fill-diff'),
    oppInsightText: document.getElementById('opp-insight-text'),
    // Quick inputs
    quickInputInvest: document.getElementById('quick-input-invest'),
    quickInputCash: document.getElementById('quick-input-cash'),
    chipBtns: document.querySelectorAll('.chip-btn[data-target]'),
    // Positions
    positionsList: document.getElementById('positions-list'),
    emptyState: document.getElementById('empty-state'),
    addPositionBtn: document.getElementById('add-position-btn'),
    // Position Modal
    positionModal: document.getElementById('position-modal'),
    closePositionModal: document.getElementById('close-position-modal'),
    cancelPosBtn: document.getElementById('cancel-pos-btn'),
    positionForm: document.getElementById('position-form'),
    posName: document.getElementById('pos-name'),
    posAmount: document.getElementById('pos-amount'),
    radioCardInvest: document.getElementById('radio-card-invest'),
    radioCardCash: document.getElementById('radio-card-cash'),
    namePresets: document.querySelectorAll('.name-preset'),
    // Settings Modal & Feature 8 Exports
    settingsModal: document.getElementById('settings-modal'),
    closeSettingsModal: document.getElementById('close-settings-modal'),
    exportExcelBtn: document.getElementById('export-excel-btn'),
    exportPpBtn: document.getElementById('export-pp-btn'),
    exportJsonBtn: document.getElementById('export-json-btn'),
    importJsonFile: document.getElementById('import-json-file'),
    loadSampleBtn: document.getElementById('load-sample-btn'),
    resetDataBtn: document.getElementById('reset-data-btn'),
    // Install Modal
    installModal: document.getElementById('install-modal'),
    showInstallModalBtn: document.getElementById('show-install-modal-btn'),
    closeInstallModal: document.getElementById('close-install-modal'),
    dismissInstallModal: document.getElementById('dismiss-install-modal')
  };

  let modalSelectedCategory = 'invest';

  // ==========================================================================
  // Persistence & Initialization
  // ==========================================================================
  function loadState() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        state = { ...defaultState, ...parsed };
      }
    } catch (e) {
      console.warn('LocalStorage error:', e);
      state = { ...defaultState };
    }
  }

  function saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }

  // Currency symbols & formatting
  const currencyConfigs = {
    EUR: { locale: 'de-DE', sign: '€', symbol: 'EUR' },
    USD: { locale: 'en-US', sign: '$', symbol: 'USD' },
    CHF: { locale: 'de-CH', sign: 'Fr', symbol: 'CHF' }
  };

  function formatMoney(amount) {
    const config = currencyConfigs[state.currency] || currencyConfigs.EUR;
    return new Intl.NumberFormat(config.locale, {
      style: 'currency',
      currency: config.symbol,
      maximumFractionDigits: 0
    }).format(amount || 0);
  }

  function formatPercent(pct) {
    return new Intl.NumberFormat('de-DE', {
      minimumFractionDigits: 1,
      maximumFractionDigits: 1
    }).format(pct || 0) + '%';
  }

  function updateCurrencySymbols() {
    const config = currencyConfigs[state.currency] || currencyConfigs.EUR;
    elements.currencySigns.forEach(el => {
      el.textContent = config.sign;
    });
  }

  // ==========================================================================
  // Core Calculation & Rendering
  // ==========================================================================
  function calculateTotals() {
    let invest = 0;
    let cash = 0;

    if (state.activeTab === 'quick') {
      invest = Number(state.quickInvest) || 0;
      cash = Number(state.quickCash) || 0;
    } else {
      state.positions.forEach(pos => {
        const amt = Number(pos.amount) || 0;
        if (pos.category === 'invest') {
          invest += amt;
        } else {
          cash += amt;
        }
      });
    }

    const total = invest + cash;
    const investPct = total > 0 ? (invest / total) * 100 : 0;
    const cashPct = total > 0 ? (cash / total) * 100 : 0;

    return { invest, cash, total, investPct, cashPct };
  }

  function updateUI() {
    const { invest, cash, total, investPct, cashPct } = calculateTotals();

    // Update numbers
    elements.statTotalAmount.textContent = formatMoney(total);
    elements.statInvestAmount.textContent = formatMoney(invest);
    elements.statCashAmount.textContent = formatMoney(cash);

    elements.statInvestPct.textContent = formatPercent(investPct);
    elements.statCashPct.textContent = formatPercent(cashPct);

    // Update SVG Ring Chart
    // Invest arc starts at top (0), Cash arc starts after invest
    const investArcLength = (investPct / 100) * CIRCUMFERENCE;
    const cashArcLength = (cashPct / 100) * CIRCUMFERENCE;

    if (total === 0) {
      elements.chartRingInvest.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;
      elements.chartRingCash.style.strokeDasharray = `0 ${CIRCUMFERENCE}`;
    } else {
      elements.chartRingInvest.style.strokeDasharray = `${investArcLength} ${CIRCUMFERENCE}`;
      elements.chartRingInvest.style.strokeDashoffset = '0';

      elements.chartRingCash.style.strokeDasharray = `${cashArcLength} ${CIRCUMFERENCE}`;
      elements.chartRingCash.style.strokeDashoffset = `${-investArcLength}`;
    }

    // Target allocation slider and labels
    const targetInvest = Number(state.targetInvestPct);
    const targetCash = 100 - targetInvest;
    elements.targetInvestLabel.textContent = `${targetInvest}%`;
    elements.targetCashLabel.textContent = `${targetCash}%`;
    elements.targetSlider.value = targetInvest;
    elements.targetSlider.style.background = `linear-gradient(to right, var(--color-invest) 0%, var(--color-invest) ${targetInvest}%, var(--color-cash) ${targetInvest}%, var(--color-cash) 100%)`;

    // Presets active highlight
    elements.presetBtns.forEach(btn => {
      const pVal = Number(btn.getAttribute('data-target'));
      btn.classList.toggle('active', pVal === targetInvest);
    });

    // Rebalancing calculation
    updateRebalancing(invest, cash, total, targetInvest, targetCash);

    // Cashflow rebalancing
    updateCashflowDeposit(invest, cash, total, targetInvest);

    // Feature 5: Interest & Opportunity Cost calculation
    updateInterestAndOpportunity(cash);

    // Render positions if in detail mode
    renderPositionsList();
  }

  function updateRebalancing(invest, cash, total, targetInvestPct, targetCashPct) {
    if (total <= 0) {
      elements.rebalanceCard.className = 'rebalance-box';
      elements.rebalanceIcon.className = 'rebalance-icon-wrap balanced';
      elements.rebalanceIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/></svg>`;
      elements.rebalanceTitle.textContent = 'Bereit zur Eingabe';
      elements.rebalanceDescription.textContent = 'Gib dein investiertes Vermögen und deinen Cash-Betrag ein.';
      return;
    }

    const idealInvest = total * (targetInvestPct / 100);
    const idealCash = total * (targetCashPct / 100);
    const investDelta = idealInvest - invest; // > 0 means needs more invest, < 0 means excess invest

    const threshold = Math.max(50, total * 0.005); // 0.5% tolerance

    if (Math.abs(investDelta) <= threshold) {
      // Balanced
      elements.rebalanceCard.className = 'rebalance-box';
      elements.rebalanceIcon.className = 'rebalance-icon-wrap balanced';
      elements.rebalanceIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>`;
      elements.rebalanceTitle.textContent = 'Perfekt im Gleichgewicht!';
      elements.rebalanceDescription.innerHTML = `Deine Quote liegt bei <strong class="rebalance-amount-highlight">${formatPercent((invest/total)*100)} Invest</strong> und <strong class="rebalance-amount-highlight">${formatPercent((cash/total)*100)} Cash</strong>. Keine Umschichtung nötig.`;
    } else if (investDelta > 0) {
      // Under-invested: Need to invest more
      elements.rebalanceCard.className = 'rebalance-box';
      elements.rebalanceIcon.className = 'rebalance-icon-wrap buy';
      elements.rebalanceIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 14l5-5 5 5z"/></svg>`;
      elements.rebalanceTitle.textContent = 'Investitions-Chance (Cash abbauen)';
      elements.rebalanceDescription.innerHTML = `Um deine Wunsch-Quote von ${targetInvestPct}% zu erreichen, solltest du <strong class="rebalance-amount-highlight" style="color: var(--color-invest-light);">${formatMoney(investDelta)}</strong> aus deiner Cash-Reserve in ETFs/Aktien investieren.`;
    } else {
      // Over-invested: Need more cash buffer
      const cashNeeded = Math.abs(investDelta);
      elements.rebalanceCard.className = 'rebalance-box';
      elements.rebalanceIcon.className = 'rebalance-icon-wrap save';
      elements.rebalanceIcon.innerHTML = `<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M7 10l5 5 5-5z"/></svg>`;
      elements.rebalanceTitle.textContent = 'Cash-Puffer aufbauen';
      elements.rebalanceDescription.innerHTML = `Du bist mit ${formatPercent((invest/total)*100)} über deinem Ziel von ${targetInvestPct}%. Erhöhe deine Liquidität um <strong class="rebalance-amount-highlight" style="color: var(--color-cash-light);">${formatMoney(cashNeeded)}</strong> (z. B. durch Gewinne sichern oder neue Sparraten ins Cash leiten).`;
    }
  }

  function updateCashflowDeposit(invest, cash, total, targetInvestPct) {
    const deposit = Number(elements.cashflowInput.value) || 0;
    if (deposit <= 0) {
      elements.cashflowResult.innerHTML = `Gib einen Betrag ein, um zu sehen, wie du neue Ersparnisse oder Boni aufteilen solltest.`;
      return;
    }

    const newTotal = total + deposit;
    const targetInvestAmount = newTotal * (targetInvestPct / 100);
    const neededToInvest = targetInvestAmount - invest;

    let allocateInvest = 0;
    let allocateCash = 0;

    if (neededToInvest <= 0) {
      // Invest is already at or above target, put all deposit into cash
      allocateCash = deposit;
      allocateInvest = 0;
    } else if (neededToInvest >= deposit) {
      // Need more than full deposit in invest
      allocateInvest = deposit;
      allocateCash = 0;
    } else {
      // Split deposit
      allocateInvest = neededToInvest;
      allocateCash = deposit - neededToInvest;
    }

    elements.cashflowResult.innerHTML = `Von deinen <strong>${formatMoney(deposit)}</strong>:<br>` +
      `• <strong style="color: var(--color-invest-light);">${formatMoney(allocateInvest)}</strong> investieren<br>` +
      `• <strong style="color: var(--color-cash-light);">${formatMoney(allocateCash)}</strong> ins Cash / Tagesgeld legen.`;
  }

  // ==========================================================================
  // Feature 5: Interest & Opportunity Cost Calculation
  // ==========================================================================
  function updateInterestAndOpportunity(cash) {
    const iRate = Number(state.interestRate) || 3.5;
    const mRate = Number(state.marketRate) || 7.0;

    elements.labelInterestRate.textContent = `${iRate.toFixed(2).replace('.', ',')}% p.a.`;
    elements.labelMarketRate.textContent = `${mRate.toFixed(2).replace('.', ',')}% p.a.`;
    elements.sliderInterestRate.value = iRate;
    elements.sliderMarketRate.value = mRate;

    // Calculations
    const annualInterest = cash * (iRate / 100);
    const monthlyInterest = annualInterest / 12;

    const annualMarket = cash * (mRate / 100);
    const oppCost = Math.max(0, annualMarket - annualInterest);
    const rateDelta = Math.max(0, mRate - iRate);

    elements.oppInterestAnnual.textContent = `+${formatMoney(annualInterest)} / Jahr`;
    elements.oppInterestMonthly.textContent = `ca. +${formatMoney(monthlyInterest)} / Monat`;

    elements.oppCostAnnual.textContent = `-${formatMoney(oppCost)} / Jahr`;
    elements.oppCostDiff.textContent = `${rateDelta.toFixed(2).replace('.', ',')}% Rendite-Differenz`;

    elements.oppBarCashPct.textContent = `${iRate.toFixed(1).replace('.', ',')}%`;
    elements.oppBarMarketPct.textContent = `${mRate.toFixed(1).replace('.', ',')}%`;

    if (mRate > 0) {
      const incomePct = Math.min(100, Math.max(0, (iRate / mRate) * 100));
      const diffPct = Math.min(100 - incomePct, Math.max(0, (rateDelta / mRate) * 100));
      elements.oppBarFillIncome.style.width = `${incomePct}%`;
      elements.oppBarFillDiff.style.width = `${diffPct}%`;
    } else {
      elements.oppBarFillIncome.style.width = '100%';
      elements.oppBarFillDiff.style.width = '0%';
    }

    if (cash <= 0) {
      elements.oppInsightText.textContent = 'Gib einen Cash-Betrag ein, um Zinserträge und Opportunitätskosten zu berechnen.';
    } else {
      elements.oppInsightText.innerHTML = `Bei deiner Cash-Reserve von <strong>${formatMoney(cash)}</strong> sicherst du dir ca. <strong>+${formatMoney(annualInterest)}</strong> Zinsen pro Jahr (${formatMoney(monthlyInterest)}/Monat). Gegenüber dem Aktienmarkt (${mRate.toFixed(1).replace('.', ',')}%) verzichtest du rechnerisch auf ca. <strong style="color: var(--color-warning);">-${formatMoney(oppCost)} / Jahr</strong> als Preis für sofortige Liquidität & Sicherheit.`;
    }
  }

  // ==========================================================================
  // Feature 8: CSV Export Functions (Excel & Portfolio Performance)
  // ==========================================================================
  function exportExcelCSV() {
    const { invest, cash, total, investPct, cashPct } = calculateTotals();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const timeStr = now.toLocaleTimeString('de-DE');

    const lines = [];
    lines.push('AssetRatio Portfolio Export;Erstellt am: ' + dateStr + ' ' + timeStr + ';;;;;');
    lines.push(';');
    lines.push('Nr;Position;Kategorie;Typ;Betrag;Anteil;Waehrung');

    if (state.activeTab === 'quick') {
      lines.push(`1;Investiertes Gesamtvermoegen;Investiert;Aktien / ETFs;${Number(state.quickInvest || 0).toFixed(2).replace('.', ',')};${investPct.toFixed(1).replace('.', ',')}%;${state.currency}`);
      lines.push(`2;Cash & Liquiditaet;Cash;Tagesgeld / Giro;${Number(state.quickCash || 0).toFixed(2).replace('.', ',')};${cashPct.toFixed(1).replace('.', ',')}%;${state.currency}`);
    } else {
      state.positions.forEach((pos, idx) => {
        const pct = total > 0 ? (pos.amount / total) * 100 : 0;
        const catLabel = pos.category === 'invest' ? 'Investiert' : 'Cash';
        const typeLabel = pos.category === 'invest' ? 'Depot / Krypto' : 'Liquiditaet';
        lines.push(`${idx + 1};${pos.name.replace(/;/g, ',')};${catLabel};${typeLabel};${Number(pos.amount || 0).toFixed(2).replace('.', ',')};${pct.toFixed(1).replace('.', ',')}%;${state.currency}`);
      });
    }

    lines.push(';');
    lines.push(`SUMME;Gesamtvermoegen;;;${total.toFixed(2).replace('.', ',')};100,0%;${state.currency}`);
    lines.push(`SUMME;Investiertes Vermoegen;;;${invest.toFixed(2).replace('.', ',')};${investPct.toFixed(1).replace('.', ',')}%;${state.currency}`);
    lines.push(`SUMME;Cash-Reserve;;;${cash.toFixed(2).replace('.', ',')};${cashPct.toFixed(1).replace('.', ',')}%;${state.currency}`);
    lines.push(';');
    lines.push('KENNZAHLEN & REBALANCING;;;;;;');
    lines.push(`Wunsch-Quote;Ziel-Allokation;;;${state.targetInvestPct}% Invest / ${100 - state.targetInvestPct}% Cash;;`);
    const targetInvestAmt = total * (state.targetInvestPct / 100);
    const investDelta = targetInvestAmt - invest;
    lines.push(`Rebalancing-Bedarf;Invest-Delta;;;${investDelta.toFixed(2).replace('.', ',')};;${state.currency}`);
    lines.push(`Tagesgeld-Zinsen (${state.interestRate}% p.a.);Jaehrlicher Ertrag;;;${(cash * (state.interestRate/100)).toFixed(2).replace('.', ',')};;${state.currency}`);
    lines.push(`Tagesgeld-Zinsen (${state.interestRate}% p.a.);Monatlicher Ertrag;;;${((cash * (state.interestRate/100))/12).toFixed(2).replace('.', ',')};;${state.currency}`);
    const oppCostAnnual = Math.max(0, (cash * (state.marketRate/100)) - (cash * (state.interestRate/100)));
    lines.push(`Opportunitaetskosten (vs. ${state.marketRate}% Markt);Jaehrlich;;;${oppCostAnnual.toFixed(2).replace('.', ',')};;${state.currency}`);

    const csvContent = '\uFEFF' + lines.join('\r\n');
    downloadFile(csvContent, `AssetRatio_Excel_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  }

  function exportPortfolioPerformanceCSV() {
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const lines = [];
    lines.push('Datum;Typ;Wert;Konto/Depot;Notiz');

    if (state.activeTab === 'quick') {
      if (state.quickInvest > 0) {
        lines.push(`${dateStr};Depot;${Number(state.quickInvest).toFixed(2).replace('.', ',')};Investiertes Gesamtportfolio;AssetRatio Quick-Mode`);
      }
      if (state.quickCash > 0) {
        lines.push(`${dateStr};Konto;${Number(state.quickCash).toFixed(2).replace('.', ',')};Cash-Liquiditaet;AssetRatio Quick-Mode`);
      }
    } else {
      state.positions.forEach(pos => {
        const type = pos.category === 'invest' ? 'Depot' : 'Konto';
        lines.push(`${dateStr};${type};${Number(pos.amount).toFixed(2).replace('.', ',')};${pos.name.replace(/;/g, ',')};AssetRatio Detail`);
      });
    }

    const csvContent = '\uFEFF' + lines.join('\r\n');
    downloadFile(csvContent, `AssetRatio_PortfolioPerformance_${dateStr}.csv`, 'text/csv;charset=utf-8;');
  }

  function downloadFile(content, fileName, mimeType) {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  // ==========================================================================
  // Position Management (Detail Mode)
  // ==========================================================================
  function renderPositionsList() {
    elements.positionsList.innerHTML = '';
    
    if (state.positions.length === 0) {
      elements.emptyState.classList.remove('hidden');
      return;
    }

    elements.emptyState.classList.add('hidden');

    state.positions.forEach(pos => {
      const item = document.createElement('div');
      item.className = 'position-item';
      const isInvest = pos.category === 'invest';

      item.innerHTML = `
        <div class="position-left">
          <span class="position-tag ${isInvest ? 'invest' : 'cash'}"></span>
          <div>
            <div class="position-name">${escapeHTML(pos.name)}</div>
            <div class="position-category">${isInvest ? 'Investiert (Depot/Krypto)' : 'Cash / Liquidität'}</div>
          </div>
        </div>
        <div class="position-right">
          <span class="position-value privacy-sensitive">${formatMoney(pos.amount)}</span>
          <button class="delete-btn" data-delete-id="${pos.id}" title="Löschen" aria-label="Position löschen">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
              <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/>
            </svg>
          </button>
        </div>
      `;

      elements.positionsList.appendChild(item);
    });

    // Attach delete listeners
    elements.positionsList.querySelectorAll('[data-delete-id]').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const id = btn.getAttribute('data-delete-id');
        deletePosition(id);
      });
    });
  }

  function addPosition(name, category, amount) {
    const newPos = {
      id: Date.now().toString(),
      name: name.trim(),
      category: category,
      amount: Math.max(0, Number(amount) || 0)
    };
    state.positions.push(newPos);
    saveState();
    updateUI();
  }

  function deletePosition(id) {
    state.positions = state.positions.filter(p => p.id !== id);
    saveState();
    updateUI();
  }

  function escapeHTML(str) {
    return str.replace(/[&<>'"]/g, 
      tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
    );
  }

  // ==========================================================================
  // Privacy Mode Toggle
  // ==========================================================================
  function setPrivacyMode(enabled) {
    state.privacyMode = enabled;
    if (enabled) {
      document.body.classList.add('privacy-blur-active');
      elements.eyeIconOpen.classList.add('hidden');
      elements.eyeIconClosed.classList.remove('hidden');
    } else {
      document.body.classList.remove('privacy-blur-active');
      elements.eyeIconOpen.classList.remove('hidden');
      elements.eyeIconClosed.classList.add('hidden');
    }
    saveState();
  }

  // ==========================================================================
  // Event Listeners & Interactions
  // ==========================================================================
  function setupEventListeners() {
    // Currency change
    elements.currencySelect.value = state.currency;
    elements.currencySelect.addEventListener('change', (e) => {
      state.currency = e.target.value;
      updateCurrencySymbols();
      saveState();
      updateUI();
    });

    // Privacy button
    elements.privacyToggleBtn.addEventListener('click', () => {
      setPrivacyMode(!state.privacyMode);
    });

    // Navigation Tabs
    elements.tabQuick.addEventListener('click', () => {
      state.activeTab = 'quick';
      elements.tabQuick.classList.add('active');
      elements.tabQuick.setAttribute('aria-selected', 'true');
      elements.tabDetail.classList.remove('active');
      elements.tabDetail.setAttribute('aria-selected', 'false');
      elements.viewQuick.classList.remove('hidden');
      elements.viewDetail.classList.add('hidden');
      saveState();
      updateUI();
    });

    elements.tabDetail.addEventListener('click', () => {
      state.activeTab = 'detail';
      elements.tabDetail.classList.add('active');
      elements.tabDetail.setAttribute('aria-selected', 'true');
      elements.tabQuick.classList.remove('active');
      elements.tabQuick.setAttribute('aria-selected', 'false');
      elements.viewDetail.classList.remove('hidden');
      elements.viewQuick.classList.add('hidden');
      saveState();
      updateUI();
    });

    // Quick Inputs
    elements.quickInputInvest.value = state.quickInvest || '';
    elements.quickInputCash.value = state.quickCash || '';

    elements.quickInputInvest.addEventListener('input', (e) => {
      state.quickInvest = Number(e.target.value) || 0;
      saveState();
      updateUI();
    });

    elements.quickInputCash.addEventListener('input', (e) => {
      state.quickCash = Number(e.target.value) || 0;
      saveState();
      updateUI();
    });

    // Chip buttons for quick addition
    elements.chipBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetId = btn.getAttribute('data-target');
        const addAmount = Number(btn.getAttribute('data-add')) || 0;
        const inputEl = document.getElementById(targetId);
        if (inputEl) {
          const current = Number(inputEl.value) || 0;
          const nextVal = current + addAmount;
          inputEl.value = nextVal;
          if (targetId === 'quick-input-invest') {
            state.quickInvest = nextVal;
          } else if (targetId === 'quick-input-cash') {
            state.quickCash = nextVal;
          }
          saveState();
          updateUI();
        }
      });
    });

    // Target Slider
    elements.targetSlider.addEventListener('input', (e) => {
      state.targetInvestPct = Number(e.target.value);
      saveState();
      updateUI();
    });

    // Preset Buttons
    elements.presetBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const val = Number(btn.getAttribute('data-target'));
        state.targetInvestPct = val;
        saveState();
        updateUI();
      });
    });

    // Cashflow deposit input
    elements.cashflowInput.addEventListener('input', () => {
      const { invest, cash, total } = calculateTotals();
      updateCashflowDeposit(invest, cash, total, state.targetInvestPct);
    });

    // Add Position Modal triggers
    elements.addPositionBtn.addEventListener('click', () => {
      elements.positionModal.classList.add('active');
      elements.posName.focus();
    });

    const closePosModal = () => elements.positionModal.classList.remove('active');
    elements.closePositionModal.addEventListener('click', closePosModal);
    elements.cancelPosBtn.addEventListener('click', closePosModal);

    // Modal Category selector
    elements.radioCardInvest.addEventListener('click', () => {
      modalSelectedCategory = 'invest';
      elements.radioCardInvest.classList.add('selected');
      elements.radioCardCash.classList.remove('selected');
    });

    elements.radioCardCash.addEventListener('click', () => {
      modalSelectedCategory = 'cash';
      elements.radioCardCash.classList.add('selected');
      elements.radioCardInvest.classList.remove('selected');
    });

    // Modal Name Presets
    elements.namePresets.forEach(presetBtn => {
      presetBtn.addEventListener('click', () => {
        const name = presetBtn.getAttribute('data-name');
        const type = presetBtn.getAttribute('data-type');
        elements.posName.value = name;
        if (type === 'invest') {
          elements.radioCardInvest.click();
        } else {
          elements.radioCardCash.click();
        }
        elements.posAmount.focus();
      });
    });

    // Add Position Form Submit
    elements.positionForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = elements.posName.value;
      const amount = elements.posAmount.value;
      if (!name || amount === '') return;

      addPosition(name, modalSelectedCategory, amount);
      elements.positionForm.reset();
      // restore default category
      elements.radioCardInvest.click();
      closePosModal();
    });

    // Feature 5: Interest Rate Controls
    elements.sliderInterestRate.addEventListener('input', (e) => {
      state.interestRate = Number(e.target.value);
      saveState();
      updateUI();
    });

    elements.sliderMarketRate.addEventListener('input', (e) => {
      state.marketRate = Number(e.target.value);
      saveState();
      updateUI();
    });

    elements.toggleInterestControls.addEventListener('click', () => {
      elements.interestControlsWrap.classList.toggle('hidden');
      elements.toggleInterestControls.textContent = elements.interestControlsWrap.classList.contains('hidden') ? 'Anpassen' : 'Schließen';
    });

    // Feature 8: CSV Exports
    if (elements.quickExportBtn) {
      elements.quickExportBtn.addEventListener('click', () => {
        elements.settingsModal.classList.add('active');
      });
    }

    if (elements.exportExcelBtn) {
      elements.exportExcelBtn.addEventListener('click', () => {
        exportExcelCSV();
      });
    }

    if (elements.exportPpBtn) {
      elements.exportPpBtn.addEventListener('click', () => {
        exportPortfolioPerformanceCSV();
      });
    }

    // Settings Modal triggers
    elements.settingsBtn.addEventListener('click', () => {
      elements.settingsModal.classList.add('active');
    });
    elements.closeSettingsModal.addEventListener('click', () => {
      elements.settingsModal.classList.remove('active');
    });

    // Export JSON Backup
    elements.exportJsonBtn.addEventListener('click', () => {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(state, null, 2));
      const downloadAnchor = document.createElement('a');
      const dateStr = new Date().toISOString().slice(0, 10);
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `AssetRatio-Backup-${dateStr}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    });

    // Import JSON Backup
    elements.importJsonFile.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (event) => {
        try {
          const imported = JSON.parse(event.target.result);
          if (imported && (imported.positions || imported.quickInvest !== undefined)) {
            state = { ...defaultState, ...imported };
            saveState();
            elements.currencySelect.value = state.currency;
            updateCurrencySymbols();
            setPrivacyMode(state.privacyMode);
            elements.quickInputInvest.value = state.quickInvest;
            elements.quickInputCash.value = state.quickCash;
            updateUI();
            alert('Backup erfolgreich wiederhergestellt!');
            elements.settingsModal.classList.remove('active');
          } else {
            alert('Ungültiges Dateiformat.');
          }
        } catch (err) {
          alert('Fehler beim Einlesen der JSON-Datei.');
        }
      };
      reader.readAsText(file);
    });

    // Load Sample Data
    elements.loadSampleBtn.addEventListener('click', () => {
      if (confirm('Möchtest du das Beispiel-Portfolio (75k Invest / 25k Cash) laden?')) {
        state.quickInvest = 75000;
        state.quickCash = 25000;
        state.positions = [
          { id: '1', name: 'Core MSCI World ETF', category: 'invest', amount: 65000 },
          { id: '2', name: 'Bitcoin & Tech', category: 'invest', amount: 10000 },
          { id: '3', name: 'Tagesgeld (3.5% Zinsen)', category: 'cash', amount: 20000 },
          { id: '4', name: 'Girokonto / Puffer', category: 'cash', amount: 5000 }
        ];
        elements.quickInputInvest.value = 75000;
        elements.quickInputCash.value = 25000;
        saveState();
        updateUI();
        elements.settingsModal.classList.remove('active');
      }
    });

    // Reset Data
    elements.resetDataBtn.addEventListener('click', () => {
      if (confirm('Wirklich alle Werte und Positionen auf 0 zurücksetzen?')) {
        state.quickInvest = 0;
        state.quickCash = 0;
        state.positions = [];
        elements.quickInputInvest.value = '';
        elements.quickInputCash.value = '';
        saveState();
        updateUI();
        elements.settingsModal.classList.remove('active');
      }
    });

    // Install Guide Modal
    const showInstall = () => elements.installModal.classList.add('active');
    const closeInstall = () => elements.installModal.classList.remove('active');
    elements.showInstallModalBtn.addEventListener('click', showInstall);
    elements.closeInstallModal.addEventListener('click', closeInstall);
    elements.dismissInstallModal.addEventListener('click', closeInstall);

    // Close modals on overlay background click
    [elements.positionModal, elements.settingsModal, elements.installModal].forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  // ==========================================================================
  // Register Service Worker for PWA
  // ==========================================================================
  function registerServiceWorker() {
    if ('serviceWorker' in navigator && (window.location.protocol === 'https:' || window.location.hostname === 'localhost')) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('./sw.js').catch(err => {
          console.warn('SW registration failed:', err);
        });
      });
    }
  }

  // ==========================================================================
  // Initialization
  // ==========================================================================
  function init() {
    loadState();
    updateCurrencySymbols();
    setupEventListeners();

    // Set initial tab
    if (state.activeTab === 'detail') {
      elements.tabDetail.click();
    } else {
      elements.tabQuick.click();
    }

    // Set initial privacy
    setPrivacyMode(state.privacyMode);

    // Initial render
    updateUI();

    // Register SW
    registerServiceWorker();
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
