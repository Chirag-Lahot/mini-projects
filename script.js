const certificateDatabase = {
    'CERT-2024-0001': {
        name: 'John Anderson',
        course: 'Advanced Web Development',
        issueDate: '2024-01-15',
        issuer: 'Tech Academy International',
        id: 'CERT-2024-0001'
    },
    'CERT-2024-0002': {
        name: 'Sarah Mitchell',
        course: 'Full Stack JavaScript Mastery',
        issueDate: '2024-02-20',
        issuer: 'Tech Academy International',
        id: 'CERT-2024-0002'
    }
};

let html5QrcodeScanner = null;

document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const tabs = document.querySelectorAll('.tab');
    const tabContents = document.querySelectorAll('.tab-content');
    const verifyBtn = document.getElementById('verifyBtn');
    const certInput = document.getElementById('certificateId');
    const errorMsg = document.getElementById('errorMessage');
    const stopScannerBtn = document.getElementById('stopScannerBtn');
    const resultsSection = document.getElementById('resultsSection');
    const resetBtn = document.getElementById('resetBtn');

    // Theme Toggle
    const themeBtn = document.getElementById('themeToggle');
    const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');

    themeBtn.addEventListener('click', () => {
        if (document.documentElement.hasAttribute('data-theme')) {
            document.documentElement.removeAttribute('data-theme');
        } else {
            document.documentElement.setAttribute('data-theme', 'dark');
        }
    });

    const qrInputFile = document.getElementById('qrInputFile');

    // Sub-menus tabs
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            tabs.forEach(t => t.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            tab.classList.add('active');
            const target = tab.dataset.tab;
            document.getElementById(target + 'Tab').classList.add('active');
            resultsSection.classList.add('hidden');
            document.getElementById('manualTab').classList.toggle('hidden', target !== 'manual');
            
            if(target === 'scanner') startScanner();
            if(target === 'manual') stopScanner();
        });
    });

    // Scanner Initialization
    function startScanner() {
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5Qrcode("reader");
        }
        
        const config = { fps: 10, qrbox: { width: 250, height: 250 } };
        html5QrcodeScanner.start({ facingMode: "environment" }, config, onScanSuccess)
        .then(() => stopScannerBtn.classList.remove('hidden'))
        .catch(err => {
            alert("Camera access denied or unvailable: " + err);
            tabs[0].click(); // Revert to manual tab
        });
    }

    function stopScanner() {
        if (html5QrcodeScanner && html5QrcodeScanner.isScanning) {
            html5QrcodeScanner.stop().then(() => {
                stopScannerBtn.classList.add('hidden');
            });
        }
    }

    function onScanSuccess(decodedText, decodedResult) {
        stopScanner();
        certInput.value = decodedText;
        tabs[0].click(); // jump to manual entry automatically
        validateCertificate(decodedText);
    }

    // Capture / upload QR image logic
    qrInputFile.addEventListener('change', e => {
        if (e.target.files.length == 0) return;
        const imageFile = e.target.files[0];
        
        if (!html5QrcodeScanner) {
            html5QrcodeScanner = new Html5Qrcode("reader");
        }

        html5QrcodeScanner.scanFile(imageFile, true)
        .then(decodedText => {
            onScanSuccess(decodedText, null);
        })
        .catch(err => {
            alert(`Error scanning image: ${err}`);
        });
        
        // Reset file input
        qrInputFile.value = '';
    });

    stopScannerBtn.addEventListener('click', stopScanner);

    // Form logic
    verifyBtn.addEventListener('click', () => validateCertificate(certInput.value));
    
    certInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') validateCertificate(certInput.value);
    });

    resetBtn.addEventListener('click', () => {
        certInput.value = '';
        resultsSection.classList.add('hidden');
        document.getElementById('manualTab').classList.remove('hidden');
    });

    function validateCertificate(id) {
        const val = (id || '').trim().toUpperCase();
        errorMsg.classList.add('hidden');
        
        if (!val) {
            errorMsg.textContent = 'Please enter a valid certificate ID';
            errorMsg.classList.remove('hidden');
            return;
        }

        verifyBtn.textContent = 'Verifying...';
        verifyBtn.disabled = true;

        setTimeout(() => {
            const cert = certificateDatabase[val];
            showResult(cert, val);
            verifyBtn.textContent = 'Verify Credential';
            verifyBtn.disabled = false;
        }, 800);
    }

    function showResult(cert, val) {
        document.getElementById('manualTab').classList.add('hidden');
        resultsSection.classList.remove('hidden');
        const stateEl = document.getElementById('resultState');
        const detailsEl = document.getElementById('certificateDetails');

        if (cert) {
            stateEl.textContent = '✓ CREDENTIAL VERIFIED';
            stateEl.className = 'result-banner success';
            detailsEl.classList.remove('hidden');
            
            document.querySelector('.cert-name').textContent = cert.name;
            document.querySelector('.cert-course').textContent = cert.course;
            document.querySelector('.cert-id').textContent = cert.id;
            document.querySelector('.cert-date').textContent = new Date(cert.issueDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            document.querySelector('.cert-issuer').textContent = cert.issuer;
        } else {
            stateEl.innerHTML = '✕ INVALID OR NOT FOUND<br><small style="font-size:0.8em; margin-top:5px;">ID: ' + val.replace(/</g, "&lt;").replace(/>/g, "&gt;") + '</small>';
            stateEl.className = 'result-banner error';
            detailsEl.classList.add('hidden');
        }
    }
});
