/**
 * Certificate Verification System - Main JavaScript File
 * 
 * Features:
 * - Certificate ID validation and verification
 * - XSS prevention through input sanitization
 * - Rate limiting to prevent abuse
 * - Dark mode toggle
 * - Certificate preview and download simulation
 * - QR code verification simulation
 * 
 * SECURITY NOTE: This is a frontend demonstration. In production:
 * - Use a secure backend API with HTTPS
 * - Implement server-side validation
 * - Use tokens/authentication for sensitive operations
 * - Never store sensitive data in localStorage
 * - Implement proper CORS policies
 * - Use Content Security Policy headers
 */

// ============================================================================
// CERTIFICATE DATABASE
// ============================================================================

/**
 * Simulated certificate database
 * In production, this would come from a secure backend API
 */
const certificateDatabase = {
    'CERT-2024-0001': {
        name: 'John Anderson',
        course: 'Advanced Web Development',
        issueDate: '2024-01-15',
        expiryDate: '2026-01-15',
        issuer: 'Tech Academy International',
        certificateId: 'CERT-2024-0001',
        status: 'Active'
    },
    'CERT-2024-0002': {
        name: 'Sarah Mitchell',
        course: 'Full Stack JavaScript Mastery',
        issueDate: '2024-02-20',
        expiryDate: '2026-02-20',
        issuer: 'Tech Academy International',
        certificateId: 'CERT-2024-0002',
        status: 'Active'
    },
    'CERT-2024-0003': {
        name: 'Michael Chen',
        course: 'Cybersecurity Fundamentals',
        issueDate: '2024-03-10',
        expiryDate: '2025-03-10',
        issuer: 'Security Institute',
        certificateId: 'CERT-2024-0003',
        status: 'Active'
    },
    'CERT-2024-0004': {
        name: 'Emma Rodriguez',
        course: 'Data Science & Analytics',
        issueDate: '2024-04-05',
        expiryDate: '2026-04-05',
        issuer: 'Data Academy',
        certificateId: 'CERT-2024-0004',
        status: 'Active'
    },
    'CERT-2024-0005': {
        name: 'James Wilson',
        course: 'Cloud Architecture with AWS',
        issueDate: '2024-01-30',
        expiryDate: '2027-01-30',
        issuer: 'Cloud Masters',
        certificateId: 'CERT-2024-0005',
        status: 'Active'
    }
};

// ============================================================================
// STATE MANAGEMENT
// ============================================================================

const appState = {
    attemptCount: 0,
    lastAttemptTime: 0,
    isRateLimited: false,
    maxAttempts: 5,
    rateLimitWindow: 3600000, // 1 hour in milliseconds
    isLoading: false,
    currentCertificate: null,
    darkMode: localStorage.getItem('theme') === 'dark'
};

// ============================================================================
// DOM ELEMENTS CACHE
// ============================================================================

const elements = {
    certificateIdInput: document.getElementById('certificateId'),
    verifyBtn: document.getElementById('verifyBtn'),
    backBtn: document.getElementById('backBtn'),
    errorMessage: document.getElementById('errorMessage'),
    resultsSection: document.getElementById('resultsSection'),
    successState: document.getElementById('successState'),
    errorState: document.getElementById('errorState'),
    certificateDetails: document.getElementById('certificateDetails'),
    rateLimitMessage: document.getElementById('rateLimitMessage'),
    themeToggle: document.getElementById('themeToggle'),
    qrSection: document.getElementById('qrSection'),
    downloadCertBtn: document.getElementById('downloadCertBtn'),
    printCertBtn: document.getElementById('printCertBtn'),
    
    // Certificate detail fields
    certName: document.querySelector('.cert-name'),
    certCourse: document.querySelector('.cert-course'),
    certId: document.querySelector('.cert-id'),
    certDate: document.querySelector('.cert-date'),
    certExpiry: document.querySelector('.cert-expiry'),
    certIssuer: document.querySelector('.cert-issuer'),
    certStatus: document.querySelector('.cert-status')
};

// ============================================================================
// SECURITY: INPUT SANITIZATION
// ============================================================================

/**
 * Sanitizes user input to prevent XSS attacks
 * Removes or escapes potentially dangerous characters
 * 
 * @param {string} input - The user input to sanitize
 * @returns {string} - The sanitized input
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }

    // Create a temporary element to use browser's built-in HTML escaping
    const tempDiv = document.createElement('div');
    tempDiv.textContent = input;
    return tempDiv.innerHTML;
}

/**
 * Validates certificate ID format
 * Expected format: CERT-YYYY-XXXX (e.g., CERT-2024-0001)
 * 
 * @param {string} certificateId - The certificate ID to validate
 * @returns {object} - { isValid: boolean, error: string }
 */
function validateCertificateFormat(certificateId) {
    const formatRegex = /^CERT-\d{4}-\d{4}$/;
    
    if (!certificateId || certificateId.trim() === '') {
        return { isValid: false, error: '❌ Certificate ID is required' };
    }

    if (!formatRegex.test(certificateId)) {
        return { 
            isValid: false, 
            error: '❌ Invalid format. Use CERT-YYYY-XXXX (e.g., CERT-2024-0001)' 
        };
    }

    return { isValid: true, error: '' };
}

// ============================================================================
// RATE LIMITING
// ============================================================================

/**
 * Checks if the user has exceeded the rate limit
 * Implements a sliding window approach
 * 
 * @returns {object} - { isLimited: boolean, message: string, resetTime: number }
 */
function checkRateLimit() {
    const now = Date.now();
    
    // Reset counter if outside the rate limit window
    if (now - appState.lastAttemptTime > appState.rateLimitWindow) {
        appState.attemptCount = 0;
        appState.isRateLimited = false;
    }

    if (appState.attemptCount >= appState.maxAttempts) {
        appState.isRateLimited = true;
        const resetTime = appState.lastAttemptTime + appState.rateLimitWindow;
        const minutesRemaining = Math.ceil((resetTime - now) / 60000);
        
        return {
            isLimited: true,
            message: `⏱️ Too many verification attempts. Please try again in ${minutesRemaining} minute${minutesRemaining !== 1 ? 's' : ''}`,
            resetTime: resetTime
        };
    }

    return { isLimited: false, message: '', resetTime: 0 };
}

/**
 * Increments the attempt counter
 * Called after each verification attempt
 */
function recordVerificationAttempt() {
    appState.attemptCount++;
    appState.lastAttemptTime = Date.now();
}

// ============================================================================
// CERTIFICATE VERIFICATION
// ============================================================================

/**
 * Verifies the certificate ID against the database
 * Simulates an API call with a delay for realistic UX
 * 
 * @param {string} certificateId - The certificate ID to verify
 * @returns {Promise<object>} - { found: boolean, certificate: object }
 */
async function verifyCertificate(certificateId) {
    // Simulate API call delay (in production, this would be an actual HTTP request)
    await new Promise(resolve => setTimeout(resolve, 1500));

    const certificate = certificateDatabase[certificateId];
    
    if (certificate) {
        return { found: true, certificate };
    }

    return { found: false, certificate: null };
}

/**
 * Generates a simulated QR code pattern
 * In production, you would use a library like qrcode.js
 * 
 * @param {string} certificateId - The certificate ID to encode
 * @returns {string} - Simulated QR code representation
 */
function generateQRCodeSimulation(certificateId) {
    // Create a simple hash-based pattern for demonstration
    let pattern = '';
    for (let i = 0; i < 4; i++) {
        pattern += certificateId.split('').reduce((acc, char) => 
            acc + char.charCodeAt(0), 0) % 2 === 0 ? '█' : '░';
    }
    return pattern;
}

// ============================================================================
// UI UPDATE FUNCTIONS
// ============================================================================

/**
 * Shows the loading state on the verify button
 */
function showLoadingState() {
    elements.verifyBtn.disabled = true;
    elements.certificateIdInput.disabled = true;
    
    // Show loading spinner, hide button text
    document.querySelector('.btn-loader').classList.remove('hidden');
    document.querySelector('.btn-text').classList.add('hidden');
}

/**
 * Hides the loading state on the verify button
 */
function hideLoadingState() {
    elements.verifyBtn.disabled = false;
    elements.certificateIdInput.disabled = false;
    
    // Hide loading spinner, show button text
    document.querySelector('.btn-loader').classList.add('hidden');
    document.querySelector('.btn-text').classList.remove('hidden');
}

/**
 * Displays an error message to the user
 * 
 * @param {string} message - The error message to display
 */
function displayError(message) {
    elements.errorMessage.textContent = message;
    elements.errorMessage.style.display = 'flex';
}

/**
 * Clears the error message
 */
function clearError() {
    elements.errorMessage.textContent = '';
    elements.errorMessage.style.display = 'none';
}

/**
 * Shows the results section and populates it with verification results
 * 
 * @param {object} certificate - The certificate object (null if not found)
 * @param {boolean} isValid - Whether the certificate was found
 */
function displayVerificationResults(certificate, isValid) {
    // Clear previous state
    elements.successState.classList.add('hidden');
    elements.errorState.classList.add('hidden');
    elements.certificateDetails.classList.add('hidden');
    elements.qrSection.classList.add('hidden');

    // Show results section
    elements.resultsSection.classList.remove('hidden');

    if (isValid && certificate) {
        // Show success state
        elements.successState.classList.remove('hidden');

        // Show certificate details
        displayCertificateDetails(certificate);

        // Show QR code section
        displayQRCode(certificate.certificateId);
    } else {
        // Show error state
        elements.errorState.classList.remove('hidden');
    }

    // Scroll to results
    elements.resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

/**
 * Displays certificate details in the certificate card
 * Uses textContent for security (prevents XSS)
 * 
 * @param {object} certificate - The certificate object
 */
function displayCertificateDetails(certificate) {
    // Store current certificate for download/print
    appState.currentCertificate = certificate;

    // Update certificate details using textContent (secure - no HTML injection)
    elements.certName.textContent = certificate.name;
    elements.certCourse.textContent = certificate.course;
    elements.certId.textContent = certificate.certificateId;
    elements.certDate.textContent = formatDate(certificate.issueDate);
    elements.certExpiry.textContent = formatDate(certificate.expiryDate);
    elements.certIssuer.textContent = certificate.issuer;
    elements.certStatus.textContent = certificate.status;

    elements.certificateDetails.classList.remove('hidden');
}

/**
 * Displays the QR code simulation
 * 
 * @param {string} certificateId - The certificate ID to encode
 */
function displayQRCode(certificateId) {
    const qrPattern = generateQRCodeSimulation(certificateId);
    const qrElement = document.getElementById('qrCode');
    
    // Use textContent for security
    qrElement.textContent = qrPattern;
    elements.qrSection.classList.remove('hidden');
}

/**
 * Formats a date string from YYYY-MM-DD to readable format
 * 
 * @param {string} dateStr - The date string in YYYY-MM-DD format
 * @returns {string} - Formatted date string
 */
function formatDate(dateStr) {
    try {
        const date = new Date(dateStr + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
    } catch (error) {
        return dateStr;
    }
}

/**
 * Shows the rate limit message
 * 
 * @param {string} message - The rate limit message
 */
function displayRateLimitMessage(message) {
    elements.rateLimitMessage.textContent = message;
    elements.rateLimitMessage.classList.remove('hidden');
    
    // Hide after some time
    setTimeout(() => {
        elements.rateLimitMessage.classList.add('hidden');
    }, 5000);
}

/**
 * Resets the verification UI to the initial state
 */
function resetUI() {
    // Hide results section
    elements.resultsSection.classList.add('hidden');
    
    // Clear input
    elements.certificateIdInput.value = '';
    elements.certificateIdInput.focus();
    
    // Clear errors
    clearError();
    
    // Reset state
    appState.currentCertificate = null;
}

// ============================================================================
// CERTIFICATE DOWNLOAD & PRINT
// ============================================================================

/**
 * Downloads the certificate as a text file
 * In production, this would generate a PDF
 */
function downloadCertificate() {
    if (!appState.currentCertificate) return;

    const cert = appState.currentCertificate;
    const content = `
CERTIFICATE OF COMPLETION
════════════════════════════════════════════

Name: ${cert.name}
Certificate ID: ${cert.certificateId}
Course: ${cert.course}

Issue Date: ${formatDate(cert.issueDate)}
Expiry Date: ${formatDate(cert.expiryDate)}
Issued By: ${cert.issuer}
Status: ${cert.status}

════════════════════════════════════════════
This certificate certifies that the above named
individual has successfully completed the course
and demonstrated competency in the subject matter.

Verification: https://example.com/verify/${cert.certificateId}
════════════════════════════════════════════
    `.trim();

    // Create blob and download
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `certificate-${cert.certificateId}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
}

/**
 * Triggers the browser's print dialog
 */
function printCertificate() {
    window.print();
}

// ============================================================================
// DARK MODE TOGGLE
// ============================================================================

/**
 * Initializes dark mode based on saved preference or system setting
 */
function initializeDarkMode() {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
        enableDarkMode();
    } else {
        disableDarkMode();
    }
}

/**
 * Enables dark mode
 */
function enableDarkMode() {
    document.documentElement.setAttribute('data-theme', 'dark');
    localStorage.setItem('theme', 'dark');
    updateThemeToggleIcon();
    appState.darkMode = true;
}

/**
 * Disables dark mode
 */
function disableDarkMode() {
    document.documentElement.removeAttribute('data-theme');
    localStorage.setItem('theme', 'light');
    updateThemeToggleIcon();
    appState.darkMode = false;
}

/**
 * Updates the theme toggle button icon
 */
function updateThemeToggleIcon() {
    const icon = elements.themeToggle.querySelector('.theme-icon');
    icon.textContent = appState.darkMode ? '☀️' : '🌙';
}

/**
 * Toggles dark mode on/off
 */
function toggleDarkMode() {
    if (appState.darkMode) {
        disableDarkMode();
    } else {
        enableDarkMode();
    }
}

// ============================================================================
// MAIN VERIFICATION HANDLER
// ============================================================================

/**
 * Main handler for certificate verification
 * Orchestrates validation, API call, and UI updates
 */
async function handleVerification() {
    // Clear previous errors
    clearError();

    // Get and sanitize input
    const rawInput = elements.certificateIdInput.value.trim();
    const certificateId = sanitizeInput(rawInput).toUpperCase();

    // Validate format
    const validation = validateCertificateFormat(certificateId);
    if (!validation.isValid) {
        displayError(validation.error);
        return;
    }

    // Check rate limiting
    const rateLimitCheck = checkRateLimit();
    if (rateLimitCheck.isLimited) {
        displayRateLimitMessage(rateLimitCheck.message);
        displayError('❌ Too many attempts. Please try again later.');
        return;
    }

    // Record the attempt
    recordVerificationAttempt();

    // Show loading state
    showLoadingState();

    try {
        // Verify certificate (simulates API call)
        const result = await verifyCertificate(certificateId);

        // Display results
        displayVerificationResults(result.certificate, result.found);

    } catch (error) {
        console.error('Verification error:', error);
        displayError('❌ An error occurred during verification. Please try again.');
    } finally {
        // Hide loading state
        hideLoadingState();
    }
}

// ============================================================================
// EVENT LISTENERS
// ============================================================================

/**
 * Initialize event listeners when DOM is ready
 */
function initializeEventListeners() {
    // Verify button click
    elements.verifyBtn.addEventListener('click', handleVerification);

    // Enter key in input field
    elements.certificateIdInput.addEventListener('keypress', (event) => {
        if (event.key === 'Enter' && !elements.verifyBtn.disabled) {
            handleVerification();
        }
    });

    // Back button
    elements.backBtn.addEventListener('click', resetUI);

    // Dark mode toggle
    elements.themeToggle.addEventListener('click', toggleDarkMode);

    // Download and Print buttons
    elements.downloadCertBtn.addEventListener('click', downloadCertificate);
    elements.printCertBtn.addEventListener('click', printCertificate);

    // Input field focus - clear error when user starts typing
    elements.certificateIdInput.addEventListener('focus', clearError);

    // Listen for system dark mode preference changes
    window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        if (!localStorage.getItem('theme')) {
            if (e.matches) {
                enableDarkMode();
            } else {
                disableDarkMode();
            }
        }
    });
}

// ============================================================================
// INITIALIZATION
// ============================================================================

/**
 * Initialize the application when DOM is fully loaded
 */
document.addEventListener('DOMContentLoaded', () => {
    // Initialize dark mode
    initializeDarkMode();

    // Initialize event listeners
    initializeEventListeners();

    // Set focus to input field
    elements.certificateIdInput.focus();

    // Log some valid certificate IDs for testing purposes
    console.log('%cCertificate Verification System Ready', 'color: #007bff; font-weight: bold; font-size: 14px;');
    console.log('%cValid Certificate IDs for testing:', 'color: #10b981; font-weight: bold;');
    Object.keys(certificateDatabase).forEach(id => {
        console.log(`  • ${id}`);
    });
});

/**
 * SECURITY & PRODUCTION NOTES:
 * 
 * Frontend Security Measures Implemented:
 * ✓ Input sanitization to prevent XSS
 * ✓ Use of textContent instead of innerHTML
 * ✓ Input validation with specific format checking
 * ✓ Rate limiting to prevent brute force attempts
 * ✓ No sensitive data stored in localStorage
 * 
 * Production Recommendations:
 * 
 * 1. Backend Validation:
 *    - Always validate on the server
 *    - Never trust client-side validation alone
 * 
 * 2. API Security:
 *    - Use HTTPS/TLS for all communications
 *    - Implement authentication (JWT, OAuth 2.0)
 *    - Use rate limiting at the server level
 *    - Implement request signing to prevent tampering
 * 
 * 3. Data Protection:
 *    - Encrypt sensitive data in transit and at rest
 *    - Never expose certificate details unnecessarily
 *    - Implement access control (verify ownership)
 *    - Log all verification attempts for auditing
 * 
 * 4. Security Headers:
 *    - Content-Security-Policy
 *    - X-Content-Type-Options
 *    - X-Frame-Options
 *    - Strict-Transport-Security
 * 
 * 5. Certificate Management:
 *    - Use proper PKI for certificate signing
 *    - Implement certificate revocation
 *    - Store certificates in secure database
 *    - Audit certificate issuance and verification
 * 
 * 6. Monitoring & Logging:
 *    - Log all verification attempts
 *    - Monitor for suspicious patterns
 *    - Alert on unusual activity
 *    - Maintain audit trail for compliance
 */
