/* ============================================
   MediFlow AI - JavaScript
   ============================================ */

// ============================================
// Navigation
// ============================================
function showSection(sectionId) {
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    document.getElementById(sectionId).classList.add('active');
    window.scrollTo(0, 0);
}

// ============================================
// Symptom Triage AI
// ============================================
function analyzeSymptoms() {
    const input = document.getElementById('symptomInput').value.toLowerCase();
    const resultBox = document.getElementById('triageResult');
    const title = document.getElementById('urgencyTitle');
    const desc = document.getElementById('urgencyDesc');
    const doctorDiv = document.getElementById('doctorRecommendation');

    if (!input.trim()) {
        showToast('Please describe your symptoms first', 'error');
        return;
    }

    // AI Logic: Keyword-based symptom analysis
    let urgency = 'normal';
    let department = 'General Medicine';
    let doctor = 'Dr. Michael Chen';
    let doctorTitle = 'General Practitioner';
    let recommendation = '';

    const urgentKeywords = [
        'chest pain', 'heart attack', 'stroke', 'severe bleeding', 
        'unconscious', 'cant breathe', 'difficulty breathing', 'severe allergic'
    ];

    const moderateKeywords = [
        'fever', 'infection', 'pain', 'headache', 'nausea', 
        'vomiting', 'dizzy', 'rash'
    ];

    // Determine urgency and department
    if (urgentKeywords.some(k => input.includes(k))) {
        urgency = 'urgent';
        department = 'Emergency Medicine';
        doctor = 'Dr. Emily Rodriguez';
        doctorTitle = 'Emergency Physician';
        recommendation = 'Based on your symptoms, we recommend immediate attention. Please proceed to the Emergency Department or call emergency services if symptoms worsen.';
    } else if (input.includes('head') || input.includes('brain') || input.includes('migraine') || input.includes('seizure')) {
        department = 'Neurology';
        doctor = 'Dr. James Wilson';
        doctorTitle = 'Neurologist';
        recommendation = 'Your symptoms suggest a neurological concern. We recommend a neurological examination.';
    } else if (input.includes('heart') || input.includes('chest') || input.includes('blood pressure')) {
        department = 'Cardiology';
        doctor = 'Dr. Sarah Johnson';
        doctorTitle = 'Cardiologist';
        recommendation = 'Cardiovascular symptoms detected. A cardiac evaluation is recommended.';
    } else if (input.includes('skin') || input.includes('rash') || input.includes('acne') || input.includes('mole')) {
        department = 'Dermatology';
        doctor = 'Dr. Lisa Park';
        doctorTitle = 'Dermatologist';
        recommendation = 'Dermatological symptoms identified. A skin examination is recommended.';
    } else if (input.includes('bone') || input.includes('joint') || input.includes('fracture') || input.includes('back pain')) {
        department = 'Orthopedics';
        doctor = 'Dr. Robert Kim';
        doctorTitle = 'Orthopedic Surgeon';
        recommendation = 'Musculoskeletal symptoms detected. An orthopedic consultation is recommended.';
    } else if (moderateKeywords.some(k => input.includes(k))) {
        urgency = 'moderate';
        recommendation = 'Your symptoms require medical attention. We recommend scheduling an appointment within 24-48 hours.';
    } else {
        recommendation = 'We recommend a general checkup to better assess your condition.';
    }

    // Update UI
    resultBox.className = 'result-box show result-' + urgency;

    if (urgency === 'urgent') {
        title.innerHTML = '<i class="fas fa-exclamation-triangle" style="color: var(--danger);"></i> Urgent Attention Required';
    } else if (urgency === 'moderate') {
        title.innerHTML = '<i class="fas fa-info-circle" style="color: var(--warning);"></i> Moderate Priority';
    } else {
        title.innerHTML = '<i class="fas fa-check-circle" style="color: var(--secondary);"></i> Routine Care Recommended';
    }

    desc.textContent = recommendation;

    doctorDiv.innerHTML = `
        <div class="doctor-card">
            <div class="doctor-avatar">
                <i class="fas fa-user-md"></i>
            </div>
            <div class="doctor-info">
                <h4>${doctor}</h4>
                <p>${doctorTitle} | ${department}</p>
                <span class="badge ${urgency === 'urgent' ? 'badge-urgent' : 'badge-normal'}">
                    ${urgency === 'urgent' ? 'Available Now' : 'Next Available: Today'}
                </span>
            </div>
            <button class="cta-btn" style="margin-left: auto; padding: 0.5rem 1rem; font-size: 0.9rem;" onclick="showSection('booking')">
                Book Now
            </button>
        </div>
    `;

    showToast('Analysis complete! See recommendation below.');
}

// ============================================
// Booking System
// ============================================
const doctors = {
    cardiology: ['Dr. Sarah Johnson', 'Dr. Ahmed Hassan'],
    dermatology: ['Dr. Lisa Park', 'Dr. David Brown'],
    neurology: ['Dr. James Wilson', 'Dr. Maria Garcia'],
    orthopedics: ['Dr. Robert Kim', 'Dr. Jennifer Lee'],
    pediatrics: ['Dr. Amanda White', 'Dr. Kevin Moore'],
    general: ['Dr. Michael Chen', 'Dr. Jessica Taylor']
};

function updateDoctors() {
    const dept = document.getElementById('department').value;
    const doctorSelect = document.getElementById('doctor');
    doctorSelect.innerHTML = '<option value="">Select Doctor</option>';

    if (doctors[dept]) {
        doctors[dept].forEach(doc => {
            doctorSelect.innerHTML += `<option value="${doc}">${doc}</option>`;
        });
    }
}

let selectedTime = null;

function selectTime(element) {
    if (element.classList.contains('booked')) return;
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    element.classList.add('selected');
    selectedTime = element.textContent;
}

function bookAppointment() {
    const name = document.getElementById('patientName').value;
    const dept = document.getElementById('department').value;
    const doctor = document.getElementById('doctor').value;
    const date = document.getElementById('appointmentDate').value;

    if (!name || !dept || !doctor || !date || !selectedTime) {
        showToast('Please fill in all fields including time slot', 'error');
        return;
    }

    const list = document.getElementById('appointmentsList');
    const newAppt = document.createElement('div');
    newAppt.className = 'appointment-item';
    newAppt.innerHTML = `
        <div class="appointment-info">
            <h4>${doctor}</h4>
            <p><i class="fas fa-stethoscope"></i> ${dept.charAt(0).toUpperCase() + dept.slice(1)} | ${date} at ${selectedTime}</p>
        </div>
        <span class="status-badge status-pending">Pending</span>
    `;
    list.insertBefore(newAppt, list.firstChild);

    showToast('Appointment booked successfully!');

    // Reset form
    document.getElementById('patientName').value = '';
    document.getElementById('department').value = '';
    document.getElementById('doctor').innerHTML = '<option value="">Select Doctor</option>';
    document.getElementById('appointmentDate').value = '';
    document.querySelectorAll('.time-slot').forEach(s => s.classList.remove('selected'));
    selectedTime = null;
}

// ============================================
// Chatbot
// ============================================
function toggleChat() {
    const chatbot = document.getElementById('chatbot');
    const toggle = document.getElementById('chatToggle');
    chatbot.classList.toggle('hidden');
    toggle.classList.toggle('hidden');
}

function sendQuickMessage(text) {
    addMessage(text, 'user');
    processBotResponse(text);
}

function sendMessage() {
    const input = document.getElementById('chatInput');
    const text = input.value.trim();
    if (!text) return;

    addMessage(text, 'user');
    input.value = '';
    processBotResponse(text);
}

function handleChatKeypress(e) {
    if (e.key === 'Enter') sendMessage();
}

function addMessage(text, sender) {
    const messages = document.getElementById('chatMessages');
    const msg = document.createElement('div');
    msg.className = `message ${sender}`;
    msg.textContent = text;
    messages.appendChild(msg);
    messages.scrollTop = messages.scrollHeight;
}

function showTyping() {
    const messages = document.getElementById('chatMessages');
    const typing = document.createElement('div');
    typing.className = 'message bot typing-indicator';
    typing.id = 'typing';
    typing.innerHTML = '<span></span><span></span><span></span>';
    messages.appendChild(typing);
    messages.scrollTop = messages.scrollHeight;
}

function removeTyping() {
    const typing = document.getElementById('typing');
    if (typing) typing.remove();
}

function processBotResponse(userText) {
    showTyping();

    setTimeout(() => {
        removeTyping();
        const text = userText.toLowerCase();
        let response = '';
        let actions = '';

        if (text.includes('symptom') || text.includes('pain') || text.includes('feel')) {
            response = 'I can help you analyze your symptoms. Please describe what you are experiencing, and I will recommend the right department and urgency level.';
            actions = `<div class="quick-actions">
                <button class="quick-action-btn" onclick="sendQuickMessage('I have chest pain')">Chest pain</button>
                <button class="quick-action-btn" onclick="sendQuickMessage('I have a headache')">Headache</button>
                <button class="quick-action-btn" onclick="sendQuickMessage('I have a fever')">Fever</button>
            </div>`;
        } else if (text.includes('book') || text.includes('appointment') || text.includes('schedule')) {
            response = 'I can help you book an appointment. Would you like to see available doctors and time slots?';
            actions = `<div class="quick-actions">
                <button class="quick-action-btn" onclick="showSection('booking'); toggleChat();">Go to Booking</button>
                <button class="quick-action-btn" onclick="sendQuickMessage('Show available doctors')">Show doctors</button>
            </div>`;
        } else if (text.includes('queue') || text.includes('wait') || text.includes('time')) {
            response = 'You are currently #4 in the Cardiology queue with an estimated wait time of 45 minutes. Your appointment with Dr. Sarah Johnson is in 15 minutes.';
            actions = `<div class="quick-actions">
                <button class="quick-action-btn" onclick="showSection('queue'); toggleChat();">View Full Status</button>
            </div>`;
        } else if (text.includes('doctor') || text.includes('cardiology') || text.includes('neurology')) {
            response = 'We have specialists across multiple departments. Our cardiology team includes Dr. Sarah Johnson and Dr. Ahmed Hassan. Would you like to see their availability?';
        } else if (text.includes('hello') || text.includes('hi')) {
            response = 'Hello! How can I assist you with your healthcare needs today?';
        } else {
            response = 'I understand. For more specific medical advice, I recommend using our Symptom Triage feature or booking a consultation with a specialist. Is there anything specific you would like help with?';
            actions = `<div class="quick-actions">
                <button class="quick-action-btn" onclick="showSection('triage'); toggleChat();">Symptom Check</button>
                <button class="quick-action-btn" onclick="showSection('booking'); toggleChat();">Book Now</button>
            </div>`;
        }

        const msgDiv = document.createElement('div');
        msgDiv.className = 'message bot';
        msgDiv.innerHTML = response + actions;
        document.getElementById('chatMessages').appendChild(msgDiv);
        document.getElementById('chatMessages').scrollTop = document.getElementById('chatMessages').scrollHeight;
    }, 1000 + Math.random() * 1000);
}

// ============================================
// Toast Notifications
// ============================================
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    const msg = document.getElementById('toast-message');
    msg.textContent = message;
    toast.className = 'toast show ' + (type === 'error' ? 'error' : '');
    toast.querySelector('i').className = type === 'error' ? 'fas fa-exclamation-circle' : 'fas fa-check-circle';

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// ============================================
// Initialization
// ============================================
document.addEventListener('DOMContentLoaded', function() {
    // Set default appointment date to today
    const dateInput = document.getElementById('appointmentDate');
    if (dateInput) {
        dateInput.valueAsDate = new Date();
    }
});