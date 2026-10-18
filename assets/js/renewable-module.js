import {
  LEARNING_OBJECTIVES,
  RENEWABLE_TYPES,
  CLIMATE_IMPACTS,
  CLIMATE_FACTOID,
  CLIMATE_EMITTER_NOTE,
  UK_CONTENT,
  AVONMOUTH_CASE_STUDY
} from './renewable-content.js';
import {
  MATCHING_PAIRS, createAttempt, answerQuestion, placeMatch,
  validateAttempt, scoreAttempt, createReview, retryAttempt
} from './quiz.js';

const TYPE_IDS = new Set(RENEWABLE_TYPES.map((item) => item.id));
const LAST_SCREEN = 5;
const SCREEN_LABELS = Object.freeze([
  '01 · Welcome',
  '02 · Types of Renewable Energy',
  '03 · World Climate',
  '04 · Renewable Energy in the UK',
  '05 · Knowledge Check',
  '06 · Results'
]);

export const RENEWABLE_IMAGES = Object.freeze({
  welcome: 'assets/img/renewable/welcome.webp',
  typesOverview: 'assets/img/renewable/types-overview.webp',
  types: Object.freeze({
    solar: 'assets/img/renewable/type-solar.webp',
    wind: 'assets/img/renewable/type-wind.webp',
    hydro: 'assets/img/renewable/type-hydro.webp',
    biomass: 'assets/img/renewable/type-biomass.webp',
    geothermal: 'assets/img/renewable/type-geothermal.webp'
  }),
  climateOverview: 'assets/img/renewable/climate-overview.webp?v=20261018-1',
  climateMap: 'assets/img/renewable/climate-map.webp',
  climateNotebook: 'assets/img/renewable/climate-notebook.webp',
  ukOverview: 'assets/img/renewable/uk-overview.webp',
  ukMap: 'assets/img/renewable/uk-map.webp',
  avonmouthLaunch: 'assets/img/renewable/avonmouth-launch.webp?v=20261018-1',
  avonmouthCase: 'assets/img/renewable/avonmouth-case.webp'
});

export function createModuleState() {
  return {
    screen: 0,
    viewedTypes: new Set(),
    viewedImpacts: new Set(),
    avonmouthOpened: false,
    activeType: null,
    attempt: null,
    result: null,
    review: null,
    reviewMode: false
  };
}

export function viewRenewableType(state, id) {
  if (TYPE_IDS.has(id)) {
    state.viewedTypes.add(id);
    state.activeType = id;
  }
  return state;
}

export function viewClimateImpact(state, index) {
  if (Number.isInteger(index) && index >= 0 && index < CLIMATE_IMPACTS.length) state.viewedImpacts.add(index);
  return state;
}

export function markAvonmouthOpened(state) {
  state.avonmouthOpened = true;
  return state;
}

export function canAdvance(state) {
  if (state.screen === 1) return state.viewedTypes.size === RENEWABLE_TYPES.length;
  if (state.screen === 2) return state.viewedImpacts.size === CLIMATE_IMPACTS.length;
  if (state.screen === 3) return state.avonmouthOpened;
  if (state.screen === 4) return Boolean(state.result);
  return state.screen < LAST_SCREEN;
}

export function advance(state) {
  if (canAdvance(state)) state.screen = Math.min(LAST_SCREEN, state.screen + 1);
  return state;
}

export function goBack(state) {
  state.screen = Math.max(0, state.screen - 1);
  return state;
}

export function resetModuleState(state) {
  Object.assign(state, createModuleState());
  return state;
}

export function nextDialogFocusIndex(index, delta, count) {
  if (!Number.isInteger(count) || count <= 0) return 0;
  return (index + delta + count) % count;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderWelcome() {
  return `
    <article class="module-screen module-screen--welcome">
      <header class="module-screen__header">
        <span class="module-screen__number">01 · Welcome</span>
        <h1>Renewable Energy</h1>
        <p class="module-screen__lede">In this short module, you’ll explore the key types of renewable energy and understand how they help address climate change - globally and here in the UK.</p>
      </header>
      <figure class="module-hero-image"><img src="${RENEWABLE_IMAGES.welcome}" alt="Wind turbine beside solar panels in a green riverside landscape" width="560" height="315" decoding="async" /></figure>
      <div class="objective-grid" aria-label="Learning objectives">
        ${LEARNING_OBJECTIVES.map((objective, index) => `<section class="objective-card"><strong>Objective ${index + 1}</strong><p>${escapeHtml(objective)}</p></section>`).join('')}
      </div>
    </article>`;
}

function renderTypes(state) {
  const selected = RENEWABLE_TYPES.find((item) => item.id === state.activeType) ?? null;
  return `
    <article class="module-screen">
      <header class="module-screen__header">
        <span class="module-screen__number">02 · Explore</span>
        <h2>What are the main types of renewable energy?</h2>
        <p class="module-screen__lede">Select each energy type for more information. Open all five to continue.</p>
      </header>
      <figure class="module-banner-image"><img src="${RENEWABLE_IMAGES.typesOverview}" alt="Wind turbines silhouetted against a bright sunrise" width="560" height="322" loading="lazy" decoding="async" /></figure>
      <div class="renewable-type-grid" aria-label="Renewable energy types">
        ${RENEWABLE_TYPES.map((item) => {
          const viewed = state.viewedTypes.has(item.id);
          const active = item.id === state.activeType;
          return `<button type="button" class="renewable-type-control${viewed ? ' is-viewed' : ''}" data-renewable-type="${item.id}" aria-pressed="${active}"><img class="renewable-type-control__image" src="${RENEWABLE_IMAGES.types[item.id]}" alt="" loading="lazy" decoding="async" /><span class="renewable-type-control__label">${escapeHtml(item.name)}</span></button>`;
        }).join('')}
      </div>
      <section class="type-detail" id="renewable-type-detail" aria-live="polite">
        ${selected ? `<h3>${escapeHtml(selected.name)}</h3><p>${escapeHtml(selected.description)}</p>` : '<h3>Select an energy type</h3><p>The full description will appear here.</p>'}
      </section>
    </article>`;
}

function renderClimate(state) {
  return `
    <article class="module-screen">
      <header class="module-screen__header">
        <span class="module-screen__number">03 · Climate</span>
        <h2>Positive impact on the world climate</h2>
        <p class="module-screen__lede">Open each panel to explore the supplied climate-impact points.</p>
      </header>
      <figure class="module-banner-image module-banner-image--climate"><img src="${RENEWABLE_IMAGES.climateOverview}" alt="Wind turbines silhouetted against a pink and orange sky" width="560" height="315" loading="lazy" decoding="async" /></figure>
      <div class="climate-grid">
        ${CLIMATE_IMPACTS.map((impact, index) => {
          const viewed = state.viewedImpacts.has(index);
          return `<section class="climate-card"><button type="button" class="climate-reveal${viewed ? ' is-viewed' : ''}" data-impact-index="${index}" aria-expanded="${viewed}">Impact ${index + 1}</button>${viewed ? `<div class="climate-card__copy"><p>${escapeHtml(impact)}</p></div>` : ''}</section>`;
        }).join('')}
      </div>
      <div class="climate-evidence-grid">
        <figure class="module-inline-image climate-map"><img src="${RENEWABLE_IMAGES.climateMap}" alt="World map from the original storyboard highlighting countries identified as high carbon emitters" width="264" height="173" loading="lazy" decoding="async" /></figure>
        <aside class="climate-factoid climate-notebook">
          <img src="${RENEWABLE_IMAGES.climateNotebook}" alt="" width="800" height="237" loading="lazy" decoding="async" />
          <div class="climate-notebook__copy"><strong>Factoid</strong><p>${escapeHtml(CLIMATE_FACTOID)}</p><p>${escapeHtml(CLIMATE_EMITTER_NOTE)}</p></div>
        </aside>
      </div>
    </article>`;
}

function renderUK(state) {
  return `
    <article class="module-screen">
      <header class="module-screen__header">
        <span class="module-screen__number">04 · UK</span>
        <h2>Renewable Energy in the UK</h2>
        <p class="module-screen__lede">Explore the supplied UK context, then open the Avonmouth Wind Farm case study to continue.</p>
      </header>
      <figure class="module-banner-image module-banner-image--uk"><img src="${RENEWABLE_IMAGES.ukOverview}" alt="Wind farm stretching across a hilly landscape under a cloudy sky" width="560" height="315" loading="lazy" decoding="async" /></figure>
      <div class="uk-context-layout">
        <figure class="module-inline-image uk-map"><img src="${RENEWABLE_IMAGES.ukMap}" alt="Map of the UK showing renewable-energy project locations from the original storyboard" width="260" height="311" loading="lazy" decoding="async" /></figure>
        <div class="uk-grid">
          ${UK_CONTENT.map((paragraph, index) => `<section class="uk-card"><strong>${String(index + 1).padStart(2, '0')}</strong><p>${escapeHtml(paragraph)}</p></section>`).join('')}
        </div>
      </div>
      <section class="case-study-launch">
        <img class="case-study-launch__image" src="${RENEWABLE_IMAGES.avonmouthLaunch}" alt="Visitors gathered at the base of a wind turbine" width="250" height="368" loading="lazy" decoding="async" />
        <div class="case-study-launch__copy">
          <p class="case-dialog__kicker">Case Study</p>
          <h3>${escapeHtml(AVONMOUTH_CASE_STUDY.title)}</h3>
          <p>Open the case study to review the full supplied Avonmouth example.</p>
          <button class="module-control module-control--primary" id="open-avonmouth" type="button">View Case Study${state.avonmouthOpened ? ' · Viewed ✓' : ''}</button>
        </div>
      </section>
    </article>`;
}

function renderKnowledge(state) {
  if (!state.attempt) state.attempt = createAttempt();
  const attempt = state.attempt;
  return `
    <article class="module-screen module-screen--quiz">
      <header class="module-screen__header">
        <span class="module-screen__number">05 · Knowledge Check</span>
        <h2>Check your understanding</h2>
        <p class="module-screen__lede">Answer five questions and match all five renewable types. Each item is worth one point. You need 8/10 (80%) to pass.</p>
      </header>
      <div id="knowledge-check" class="knowledge-check">
        <div class="quiz-questions">
          ${attempt.questions.map((question, questionIndex) => `
            <fieldset class="quiz-question">
              <legend><span>${String(questionIndex + 1).padStart(2, '0')}</span>${escapeHtml(question.prompt)}</legend>
              <div class="quiz-options">
                ${question.options.map((option) => {
                  const inputId = `question-${question.id}-${question.options.indexOf(option)}`;
                  const checked = attempt.answers.get(question.id) === option ? ' checked' : '';
                  return `<label for="${inputId}"><input id="${inputId}" type="radio" name="question-${question.id}" value="${escapeHtml(option)}" data-question-id="${question.id}"${checked} /> <span>${escapeHtml(option)}</span></label>`;
                }).join('')}
              </div>
            </fieldset>`).join('')}
        </div>

        <section class="matching-activity" aria-labelledby="matching-title">
          <div class="matching-activity__header">
            <div><p class="case-dialog__kicker">Matching activity · 5 points</p><h3 id="matching-title">Match each type to its description</h3></div>
            <p>Drag a description on desktop, or use the select controls on any device.</p>
          </div>
          <div class="matching-bank" aria-hidden="true">
            ${attempt.matchingChoices.map((pair) => `<div class="matching-chip" draggable="true" data-description-id="${pair.descriptionId}">${escapeHtml(pair.description)}</div>`).join('')}
          </div>
          <div class="matching-grid">
            ${MATCHING_PAIRS.map((pair) => `
              <label class="matching-row" data-match-type="${pair.typeId}">
                <strong>${escapeHtml(pair.typeLabel)}</strong>
                <select data-match-select="${pair.typeId}">
                  <option value="">Choose description…</option>
                  ${attempt.matchingChoices.map((choice) => `<option value="${choice.descriptionId}"${attempt.matches.get(pair.typeId) === choice.descriptionId ? ' selected' : ''}>${escapeHtml(choice.description)}</option>`).join('')}
                </select>
              </label>`).join('')}
          </div>
        </section>

        <div class="quiz-submit-row">
          <p id="quiz-validation" class="quiz-validation" aria-live="polite"></p>
          <button class="module-control module-control--primary" id="submit-knowledge-check" type="button">Submit Knowledge Check</button>
        </div>
      </div>
    </article>`;
}

function renderReview(state) {
  const review = state.review;
  if (!review) return '';
  return `
    <article class="module-screen module-screen--review">
      <header class="module-screen__header">
        <span class="module-screen__number">06 · Review</span>
        <h2>Review your answers</h2>
        <p class="module-screen__lede">Your submitted answers are shown alongside the correct answers. Reviewing them does not change your score.</p>
      </header>
      <div class="answer-review">
        <section class="review-section">
          <h3>Knowledge questions</h3>
          ${review.questions.map((item, index) => `
            <article class="review-item ${item.correct ? 'is-correct' : 'is-incorrect'}">
              <div class="review-item__status"><strong>${item.correct ? 'Correct ✓' : 'Incorrect ✕'}</strong><span>Question ${index + 1}</span></div>
              <h4>${escapeHtml(item.prompt)}</h4>
              <p><strong>Your answer:</strong> ${escapeHtml(item.learnerAnswer ?? 'No answer')}</p>
              <p><strong>Correct answer:</strong> ${escapeHtml(item.correctAnswer)}</p>
            </article>`).join('')}
        </section>
        <section class="review-section">
          <h3>Matching activity</h3>
          ${review.matches.map((item) => `
            <article class="review-item ${item.correct ? 'is-correct' : 'is-incorrect'}">
              <div class="review-item__status"><strong>${item.correct ? 'Correct ✓' : 'Incorrect ✕'}</strong><span>${escapeHtml(item.typeLabel)}</span></div>
              <p><strong>Your match:</strong> ${escapeHtml(item.learnerDescription || 'No match')}</p>
              <p><strong>Correct match:</strong> ${escapeHtml(item.correctDescription)}</p>
            </article>`).join('')}
        </section>
      </div>
      <div class="result-actions"><button class="module-control module-control--primary" id="back-to-result" type="button">Back to Result</button></div>
    </article>`;
}

function renderResults(state) {
  if (state.reviewMode) return renderReview(state);
  const result = state.result;
  if (!result) return `<article class="module-screen"><div id="module-results" aria-live="polite"><h2>Results unavailable</h2></div></article>`;
  if (result.passed) {
    return `
      <article class="module-screen module-screen--result">
        <div class="result-card result-card--pass" id="module-results" aria-live="polite">
          <p class="result-card__status">Pass ✓</p>
          <strong class="result-card__score">${result.percentage}%</strong>
          <h2>Knowledge check complete</h2>
          <p>Great work! You now have a clear understanding of the types of renewable energy, and how they benefit both our planet, and the UK.</p>
          <p class="result-card__points">${result.points}/${result.total} points · Pass mark 80%</p>
          <div class="result-actions">
            <button class="module-control" id="review-answers" type="button">Review Answers</button>
            <button class="module-control" id="restart-module" type="button">Restart Module</button>
            <button class="module-control module-control--primary" id="result-exit" type="button">Exit to Portfolio</button>
          </div>
        </div>
      </article>`;
  }
  return `
    <article class="module-screen module-screen--result">
      <div class="result-card result-card--fail" id="module-results" aria-live="polite">
        <p class="result-card__status">Not quite there yet</p>
        <strong class="result-card__score">${result.percentage}%</strong>
        <h2>Review and try again</h2>
        <p>Review the responses below or try another five-question attempt.</p>
        <p class="result-card__points">${result.points}/${result.total} points · Pass mark 80%</p>
        <div class="result-actions">
          <button class="module-control" id="review-answers" type="button">Review Answers</button>
          <button class="module-control" id="try-again" type="button">Try Again</button>
          <button class="module-control module-control--primary" id="result-exit" type="button">Exit to Portfolio</button>
        </div>
      </div>
    </article>`;
}

export function createRenewableModuleController({ root, launchButton, onExit }) {
  const doc = root?.ownerDocument ?? globalThis.document;
  let state = createModuleState();
  let modalOpener = null;
  const inertSnapshot = new Map();
  const moduleUnderlaySnapshot = new Map();

  const stage = root?.querySelector?.('#module-stage') ?? null;
  const backButton = root?.querySelector?.('#module-back') ?? null;
  const nextButton = root?.querySelector?.('#module-next') ?? null;
  const exitButton = root?.querySelector?.('#module-exit') ?? null;
  const sectionLabel = root?.querySelector?.('#module-section-label') ?? null;
  const progressText = root?.querySelector?.('#module-progress-text') ?? null;
  const progressFill = root?.querySelector?.('#module-progress-fill') ?? null;
  const backdrop = doc?.querySelector?.('#avonmouth-backdrop') ?? null;
  const dialog = doc?.querySelector?.('#avonmouth-dialog') ?? null;
  const dialogCopy = doc?.querySelector?.('#avonmouth-copy') ?? null;
  const closeDialogButton = doc?.querySelector?.('#close-avonmouth') ?? null;

  const setSiteUnderlayInert = (enabled) => {
    if (!doc?.body?.children) return;
    for (const child of doc.body.children) {
      if (child === root || child === backdrop || child.tagName === 'SCRIPT' || child.tagName === 'NOSCRIPT' || child.tagName === 'TEMPLATE') continue;
      if (enabled) {
        moduleUnderlaySnapshot.set(child, Boolean(child.inert));
        child.inert = true;
      } else if (moduleUnderlaySnapshot.has(child)) {
        child.inert = moduleUnderlaySnapshot.get(child);
      }
    }
    if (!enabled) moduleUnderlaySnapshot.clear();
  };

  const setPageInert = (enabled) => {
    if (!doc?.body?.children) return;
    for (const child of doc.body.children) {
      if (child === backdrop || child.tagName === 'SCRIPT' || child.tagName === 'NOSCRIPT') continue;
      if (enabled) {
        inertSnapshot.set(child, Boolean(child.inert));
        child.inert = true;
      } else if (inertSnapshot.has(child)) {
        child.inert = inertSnapshot.get(child);
      }
    }
    if (!enabled) inertSnapshot.clear();
  };

  const syncControls = () => {
    if (backButton) {
      backButton.disabled = state.screen === 0;
      backButton.hidden = state.screen === LAST_SCREEN;
    }
    if (nextButton) {
      nextButton.disabled = !canAdvance(state);
      nextButton.hidden = state.screen >= 4;
    }
    if (sectionLabel) sectionLabel.textContent = SCREEN_LABELS[state.screen];
    if (progressText) progressText.textContent = `${state.screen + 1} of ${LAST_SCREEN + 1}`;
    if (progressFill) progressFill.style.width = `${((state.screen + 1) / (LAST_SCREEN + 1)) * 100}%`;
  };

  const closeDialog = () => {
    if (!backdrop || backdrop.hidden) return;
    backdrop.hidden = true;
    setPageInert(false);
    const target = modalOpener;
    modalOpener = null;
    target?.focus?.();
  };

  const focusableInDialog = () => dialog ? [...dialog.querySelectorAll('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])')].filter((item) => !item.disabled && !item.hidden) : [];

  const openDialog = (button) => {
    if (!backdrop || !dialog) return;
    markAvonmouthOpened(state);
    syncControls();
    modalOpener = button ?? doc?.activeElement ?? null;
    if (dialogCopy) dialogCopy.innerHTML = `<figure class="case-dialog__image"><img src="${RENEWABLE_IMAGES.avonmouthCase}" alt="Wind turbine beside a bright low sun" width="760" height="416" decoding="async" /></figure>` + AVONMOUTH_CASE_STUDY.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('');
    backdrop.hidden = false;
    setPageInert(true);
    const focusables = focusableInDialog();
    (focusables[0] ?? dialog).focus?.();
  };

  const showScreenTop = () => {
    if (!stage) return;
    stage.scrollTop = 0;
    stage.focus?.({ preventScroll: true });
  };

  const bindScreenInteractions = () => {
    if (!stage) return;
    for (const button of stage.querySelectorAll('[data-renewable-type]')) {
      button.addEventListener('click', () => {
        viewRenewableType(state, button.dataset.renewableType);
        render();
        stage.querySelector(`[data-renewable-type="${state.activeType}"]`)?.focus?.();
      });
    }
    for (const button of stage.querySelectorAll('[data-impact-index]')) {
      button.addEventListener('click', () => {
        const index = Number(button.dataset.impactIndex);
        viewClimateImpact(state, index);
        render();
        stage.querySelector(`[data-impact-index="${index}"]`)?.focus?.();
      });
    }
    for (const input of stage.querySelectorAll('[data-question-id]')) {
      input.addEventListener('change', () => answerQuestion(state.attempt, input.dataset.questionId, input.value));
    }
    for (const select of stage.querySelectorAll('[data-match-select]')) {
      select.addEventListener('change', () => placeMatch(state.attempt, select.dataset.matchSelect, select.value));
    }
    let draggedDescriptionId = null;
    for (const chip of stage.querySelectorAll('[data-description-id]')) {
      chip.addEventListener('dragstart', (event) => {
        draggedDescriptionId = chip.dataset.descriptionId;
        event.dataTransfer?.setData?.('text/plain', draggedDescriptionId);
      });
      chip.addEventListener('dragend', () => { draggedDescriptionId = null; });
    }
    for (const row of stage.querySelectorAll('[data-match-type]')) {
      row.addEventListener('dragover', (event) => event.preventDefault());
      row.addEventListener('drop', (event) => {
        event.preventDefault();
        const descriptionId = event.dataTransfer?.getData?.('text/plain') || draggedDescriptionId;
        if (!descriptionId) return;
        const typeId = row.dataset.matchType;
        placeMatch(state.attempt, typeId, descriptionId);
        const select = row.querySelector('[data-match-select]');
        if (select) select.value = descriptionId;
      });
    }
    stage.querySelector('#submit-knowledge-check')?.addEventListener('click', () => {
      const validation = validateAttempt(state.attempt);
      const message = stage.querySelector('#quiz-validation');
      if (!validation.valid) {
        if (message) message.textContent = 'Complete all five questions and all five matches before submitting.';
        return;
      }
      state.result = scoreAttempt(state.attempt);
      state.review = createReview(state.attempt);
      advance(state);
      render();
      showScreenTop();
    });
    stage.querySelector('#review-answers')?.addEventListener('click', () => { state.reviewMode = true; render(); showScreenTop(); });
    stage.querySelector('#back-to-result')?.addEventListener('click', () => { state.reviewMode = false; render(); showScreenTop(); });
    stage.querySelector('#try-again')?.addEventListener('click', () => {
      state.attempt = retryAttempt();
      state.result = null;
      state.review = null;
      state.reviewMode = false;
      state.screen = 4;
      render();
      showScreenTop();
    });
    stage.querySelector('#restart-module')?.addEventListener('click', () => {
      resetModuleState(state);
      render();
      showScreenTop();
    });
    stage.querySelector('#result-exit')?.addEventListener('click', () => exit());
    stage.querySelector('#open-avonmouth')?.addEventListener('click', (event) => openDialog(event.currentTarget));
  };

  const render = () => {
    if (stage) {
      const renderers = [renderWelcome, () => renderTypes(state), () => renderClimate(state), () => renderUK(state), () => renderKnowledge(state), () => renderResults(state)];
      stage.innerHTML = renderers[state.screen]();
      bindScreenInteractions();
    }
    syncControls();
  };

  const launch = () => {
    state = createModuleState();
    root.hidden = false;
    setSiteUnderlayInert(true);
    if (doc?.body) doc.body.dataset.moduleOpen = 'true';
    render();
    showScreenTop();
  };

  const exit = () => {
    closeDialog();
    resetModuleState(state);
    root.hidden = true;
    setSiteUnderlayInert(false);
    if (doc?.body) delete doc.body.dataset.moduleOpen;
    onExit?.();
    launchButton?.focus?.();
  };

  launchButton?.addEventListener?.('click', launch);
  backButton?.addEventListener?.('click', () => { state.reviewMode = false; goBack(state); render(); showScreenTop(); });
  nextButton?.addEventListener?.('click', () => { state.reviewMode = false; advance(state); render(); showScreenTop(); });
  exitButton?.addEventListener?.('click', exit);
  closeDialogButton?.addEventListener?.('click', closeDialog);
  backdrop?.addEventListener?.('click', (event) => { if (event.target === backdrop) closeDialog(); });
  dialog?.addEventListener?.('keydown', (event) => {
    if (event.key === 'Escape') {
      event.preventDefault();
      closeDialog();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = focusableInDialog();
    if (focusables.length === 0) {
      event.preventDefault();
      dialog.focus?.();
      return;
    }
    const current = Math.max(0, focusables.indexOf(doc.activeElement));
    const targetIndex = nextDialogFocusIndex(current, event.shiftKey ? -1 : 1, focusables.length);
    if ((event.shiftKey && current === 0) || (!event.shiftKey && current === focusables.length - 1)) {
      event.preventDefault();
      focusables[targetIndex].focus?.();
    }
  });

  return { launch, exit, render, openDialog, closeDialog, getState: () => state, syncControls };
}
