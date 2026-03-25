/* ══════════════════════════════════════════════
   PassportSeva — script.js
   India Passport Application Web Portal
   ══════════════════════════════════════════════ */

/* ── STATE ── */
let currentFormStep = 1;
const formSteps = 4;
const stepLabels = ['', 'Personal Info', 'Address Details', 'Family Details', 'Application Details'];

/* ══════════════════════════════════════════════
   SCREEN NAVIGATION
   ══════════════════════════════════════════════ */

/**
 * Switch visible screen by ID.
 * @param {string} id - The screen element ID to activate.
 */
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo(0, 0);
}

/**
 * Smooth-scroll to a section within the current page.
 * @param {string} id - The target element ID.
 */
function scrollToSection(id) {
  setTimeout(() => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, 100);
}

/* ══════════════════════════════════════════════
   AUTHENTICATION
   ══════════════════════════════════════════════ */

/**
 * Switch between Login and Register tabs on the auth screen.
 * @param {'login'|'signup'} tab
 */
function switchTab(tab) {
  document.getElementById('tab-login').classList.toggle('active', tab === 'login');
  document.getElementById('tab-signup').classList.toggle('active', tab === 'signup');
  document.getElementById('panel-login').style.display = tab === 'login' ? 'block' : 'none';
  document.getElementById('panel-signup').style.display = tab === 'signup' ? 'block' : 'none';
}

/**
 * Simulate sending OTP to the entered mobile number.
 * @param {'login'|'signup'} ctx - Which form context.
 */
function sendOTP(ctx) {
  const mobileId = ctx === 'login' ? 'login-mobile' : 'su-mobile';
  const otpRowId = ctx === 'login' ? 'login-otp-row' : 'su-otp-row';
  const mobile = document.getElementById(mobileId).value.trim();

  if (!mobile || mobile.length < 8) {
    showToast('⚠️ Please enter a valid mobile number');
    return;
  }

  document.getElementById(otpRowId).style.display = 'block';
  showToast('✓ OTP sent to ' + mobile.slice(-4).padStart(mobile.length, '*'));

  // Start 30-second countdown on button
  const btn = document.querySelector(
    ctx === 'login' ? '#panel-login .otp-btn' : '#panel-signup .otp-btn'
  );
  if (btn) {
    let countdown = 30;
    btn.disabled = true;
    btn.textContent = `Resend (${countdown}s)`;
    const timer = setInterval(() => {
      countdown--;
      btn.textContent = `Resend (${countdown}s)`;
      if (countdown <= 0) {
        clearInterval(timer);
        btn.disabled = false;
        btn.textContent = 'Resend OTP';
      }
    }, 1000);
  }
}

/**
 * Handle login form submission.
 */
function doLogin() {
  const mobile = document.getElementById('login-mobile').value.trim();
  const errorEl = document.getElementById('login-error');

  if (!mobile) {
    errorEl.classList.add('show');
    errorEl.textContent = '⚠️ Please enter your mobile number.';
    return;
  }

  errorEl.classList.remove('show');
  showToast('✓ Signed in successfully!');
  setTimeout(() => showScreen('screen-dashboard'), 700);
}

/**
 * Handle signup form submission.
 */
function doSignup() {
  const fname = document.getElementById('su-fname').value.trim();
  const lname = document.getElementById('su-lname').value.trim();
  const mobile = document.getElementById('su-mobile').value.trim();

  if (!fname || !lname || !mobile) {
    showToast('⚠️ Please fill all required fields.');
    return;
  }

  showToast('✓ Account created! Welcome aboard.');
  setTimeout(() => showScreen('screen-dashboard'), 700);
}

/**
 * Handle logout.
 */
function doLogout() {
  showToast('Signed out. See you soon!');
  setTimeout(() => showScreen('screen-home'), 700);
}

/* ══════════════════════════════════════════════
   MULTI-STEP APPLICATION FORM
   ══════════════════════════════════════════════ */

/**
 * Reset and launch the multi-step application form.
 */
function startNewApplication() {
  currentFormStep = 1;
  updateFormStep();
  showScreen('screen-form');
}

/**
 * Advance to the next form step. If on last step, go to document upload.
 */
function formNext() {
  if (currentFormStep < formSteps) {
    currentFormStep++;
    updateFormStep();
    showToast('✓ Progress saved automatically');
  } else {
    showScreen('screen-docs');
  }
}

/**
 * Go back to the previous form step.
 */
function formPrev() {
  if (currentFormStep > 1) {
    currentFormStep--;
    updateFormStep();
  }
}

/**
 * Re-render the stepper, visible panel, button labels, and autosave indicator.
 */
function updateFormStep() {
  // Show/hide step panels
  for (let i = 1; i <= formSteps; i++) {
    const panel = document.getElementById('form-step-' + i);
    if (panel) panel.style.display = i === currentFormStep ? 'block' : 'none';
  }

  // Update stepper circles
  for (let i = 1; i <= formSteps; i++) {
    const el = document.getElementById('fstep-' + i);
    if (!el) continue;
    el.classList.remove('active', 'done');
    if (i < currentFormStep) el.classList.add('done');
    if (i === currentFormStep) el.classList.add('active');
    el.querySelector('.step-circle').textContent = i < currentFormStep ? '✓' : i;
  }

  // Back button visibility
  const backBtn = document.getElementById('form-back-btn');
  if (backBtn) backBtn.style.visibility = currentFormStep > 1 ? 'visible' : 'hidden';

  // Step label
  const stepLabel = document.getElementById('form-step-label');
  if (stepLabel) stepLabel.textContent = `Step ${currentFormStep} of ${formSteps} — ${stepLabels[currentFormStep]}`;

  // Navbar chip
  const chip = document.getElementById('progress-chip');
  if (chip) chip.textContent = `Step ${currentFormStep} of ${formSteps}`;

  // Next button text
  const nextBtn = document.getElementById('form-next-btn');
  if (nextBtn) {
    nextBtn.textContent = currentFormStep < formSteps
      ? `Next: ${stepLabels[currentFormStep + 1]} →`
      : 'Continue to Documents →';
  }

  // Autosave timestamp
  updateAutosaveTimestamp();
}

/* ══════════════════════════════════════════════
   AUTOSAVE
   ══════════════════════════════════════════════ */

/**
 * Update the autosave bar with the current time.
 */
function updateAutosaveTimestamp() {
  const el = document.getElementById('autosave-text');
  if (!el) return;
  const now = new Date();
  const t = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  el.innerHTML = `Draft saved · Last saved at <strong>${t}</strong>`;
}

// Auto-save every 45 seconds when form is visible
setInterval(() => {
  const formScreen = document.getElementById('screen-form');
  if (formScreen && formScreen.classList.contains('active')) {
    updateAutosaveTimestamp();
  }
}, 45000);

/* ══════════════════════════════════════════════
   ADDRESS FORM
   ══════════════════════════════════════════════ */

/**
 * Toggle permanent address section visibility based on checkbox.
 */
function toggleSameAddress() {
  const cb = document.getElementById('same-address');
  const section = document.getElementById('perm-address-section');
  if (!cb || !section) return;
  cb.checked = !cb.checked;
  section.style.display = cb.checked ? 'none' : 'block';
  if (cb.checked) {
    showToast('✓ Permanent address set same as present');
  }
}

/* ══════════════════════════════════════════════
   DOCUMENT UPLOADS
   ══════════════════════════════════════════════ */

/**
 * Toggle a document's upload state (simulated click-to-upload).
 * @param {HTMLElement} el - The upload item element.
 */
function toggleUpload(el) {
  el.classList.toggle('uploaded');
  const count = document.querySelectorAll('.upload-item.uploaded').length;
  const total = document.querySelectorAll('.upload-item').length;

  const saveText = document.getElementById('doc-save-text');
  if (saveText) saveText.textContent = `${count} of ${total} documents uploaded`;

  const progress = document.getElementById('docs-progress');
  if (progress) progress.textContent = `${count} of ${total} documents uploaded`;

  showToast(
    el.classList.contains('uploaded')
      ? '✓ Document uploaded successfully'
      : '✓ Document removed'
  );
}

/* ══════════════════════════════════════════════
   APPOINTMENT BOOKING
   ══════════════════════════════════════════════ */

/**
 * Select a calendar date.
 * @param {HTMLElement} el - The clicked day button.
 * @param {string} label - Human-readable date label (e.g. "28 Mar").
 */
function selectDate(el, label) {
  document.querySelectorAll('.cal-day.selected').forEach(d => d.classList.remove('selected'));
  el.classList.add('selected');

  const dateRow = document.querySelector('.appt-summary .appt-row:nth-child(2) .appt-val');
  if (dateRow) dateRow.textContent = label + ' 2025';
}

/**
 * Select a time slot.
 * @param {HTMLElement} el - The clicked time slot button.
 */
function selectSlot(el) {
  if (el.classList.contains('full')) return;
  document.querySelectorAll('.time-slot.selected').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');

  const timeRow = document.querySelector('.appt-summary .appt-row:nth-child(3) .appt-val');
  if (timeRow) timeRow.textContent = el.textContent.trim();

  showToast(`✓ Slot ${el.textContent.trim()} selected`);
}

/**
 * Update the PSK list dropdown when the state selection changes.
 * (Placeholder for real data integration.)
 */
function updatePSKList() {
  const stateSelect = document.querySelector('[onchange="updatePSKList()"]');
  const pskSelect = document.getElementById('psk-select');
  if (!stateSelect || !pskSelect) return;

  const pskData = {
    'Delhi': ['PSK Dwarka, New Delhi', 'PSK Janakpuri, New Delhi', 'PSK Rohini, New Delhi', 'PSK Saket, New Delhi'],
    'Maharashtra': ['PSK Andheri, Mumbai', 'PSK Thane, Mumbai', 'PSK Pune Central', 'PSK Nagpur'],
    'Karnataka': ['PSK Bengaluru (Koramangala)', 'PSK Bengaluru (Whitefield)', 'PSK Mysuru'],
    'Uttar Pradesh': ['PSK Lucknow', 'PSK Noida', 'PSK Agra', 'PSK Varanasi'],
    'Tamil Nadu': ['PSK Chennai (T.Nagar)', 'PSK Chennai (Anna Nagar)', 'PSK Coimbatore'],
  };

  const locations = pskData[stateSelect.value] || [];
  pskSelect.innerHTML = locations.map(l => `<option>${l}</option>`).join('');
}

/* ══════════════════════════════════════════════
   FORM SUBMISSION
   ══════════════════════════════════════════════ */

/**
 * Submit the complete application and show confirmation screen.
 */
function submitApplication() {
  showToast('✓ Submitting application...');
  setTimeout(() => showScreen('screen-confirm'), 900);
}

/* ══════════════════════════════════════════════
   CONFIRMATION SCREEN
   ══════════════════════════════════════════════ */

/**
 * Copy the application ID to clipboard.
 */
function copyID() {
  const id = 'PSK-2025-00412';
  if (navigator.clipboard) {
    navigator.clipboard.writeText(id).catch(() => fallbackCopy(id));
  } else {
    fallbackCopy(id);
  }
  showToast('✓ Application ID copied to clipboard!');
}

/**
 * Fallback copy for browsers without Clipboard API.
 * @param {string} text
 */
function fallbackCopy(text) {
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.style.position = 'fixed';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  document.execCommand('copy');
  document.body.removeChild(ta);
}

/* ══════════════════════════════════════════════
   TOAST NOTIFICATIONS
   ══════════════════════════════════════════════ */

let toastTimer = null;

/**
 * Show a toast notification.
 * @param {string} msg - The message to display.
 * @param {boolean} success - Whether to apply success styling.
 */
function showToast(msg, success = true) {
  const toast = document.getElementById('toast');
  const msgEl = document.getElementById('toast-msg');
  if (!toast || !msgEl) return;

  msgEl.textContent = msg;
  toast.classList.add('show');
  if (success) toast.classList.add('success');
  else toast.classList.remove('success');

  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2800);
}

/* ══════════════════════════════════════════════
   DOM READY INIT
   ══════════════════════════════════════════════ */

document.addEventListener('DOMContentLoaded', () => {
  // Ensure homepage is shown first
  showScreen('screen-home');
});
