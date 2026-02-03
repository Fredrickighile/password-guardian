// PasswordGuardian Chrome Extension - Real-time password analysis
const API_URL = 'https://passwordguardian-api.onrender.com/api/passwords/analyze';

// Track analyzed fields to avoid duplicates
const analyzedFields = new WeakSet();

// Inject password strength indicator
function createStrengthIndicator() {
  const indicator = document.createElement('div');
  indicator.className = 'pg-strength-indicator';
  indicator.style.cssText = `
    position: absolute;
    right: 10px;
    top: 50%;
    transform: translateY(-50%);
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    font-weight: 600;
    pointer-events: none;
    z-index: 10000;
    transition: all 0.3s;
  `;
  return indicator;
}

// Analyze password
async function analyzePassword(password) {
  if (!password || password.length < 3) return null;
  
  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ password })
    });
    
    if (!response.ok) return null;
    return await response.json();
  } catch (error) {
    console.error('PasswordGuardian analysis failed:', error);
    return null;
  }
}

// Update indicator UI
function updateIndicator(indicator, analysis) {
  if (!analysis) {
    indicator.style.display = 'none';
    return;
  }
  
  const colors = {
    'Very Weak': { bg: '#ef4444', text: '#fff' },
    'Weak': { bg: '#f97316', text: '#fff' },
    'Moderate': { bg: '#eab308', text: '#000' },
    'Strong': { bg: '#84cc16', text: '#000' },
    'Very Strong': { bg: '#22c55e', text: '#fff' }
  };
  
  const color = colors[analysis.strength] || colors['Weak'];
  indicator.textContent = `${analysis.strength} (${analysis.score})`;
  indicator.style.backgroundColor = color.bg;
  indicator.style.color = color.text;
  indicator.style.display = 'block';
  
  // Add breach warning
  if (analysis.breach_count > 0) {
    indicator.textContent = '⚠️ BREACHED';
    indicator.style.backgroundColor = '#dc2626';
    indicator.style.color = '#fff';
  }
}

// Process password field
function processPasswordField(field) {
  if (analyzedFields.has(field)) return;
  analyzedFields.add(field);
  
  // Make parent position relative
  const parent = field.parentElement;
  if (parent && window.getComputedStyle(parent).position === 'static') {
    parent.style.position = 'relative';
  }
  
  // Create indicator
  const indicator = createStrengthIndicator();
  field.parentElement.appendChild(indicator);
  
  let timeout;
  
  // Analyze on input
  field.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
      const password = field.value;
      const analysis = await analyzePassword(password);
      updateIndicator(indicator, analysis);
    }, 500);
  });
}

// Find and process all password fields
function scanPasswordFields() {
  const passwordFields = document.querySelectorAll('input[type="password"]');
  passwordFields.forEach(processPasswordField);
}

// Initial scan
scanPasswordFields();

// Watch for dynamically added fields
const observer = new MutationObserver(() => {
  scanPasswordFields();
});

observer.observe(document.body, {
  childList: true,
  subtree: true
});
