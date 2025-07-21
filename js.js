// Kiểm tra trình duyệt hỗ trợ
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

// Cấu hình
recognition.lang = 'vi-VN';  // hoặc 'en-US'
recognition.continuous = false;
recognition.interimResults = false;

function startListening() {
  recognition.start();
}

recognition.onresult = function (event) {
  const transcript = event.results[0][0].transcript;
  document.getElementById('textInput').value = transcript;
};

recognition.onerror = function (event) {
  console.error('Lỗi nhận giọng nói:', event.error);
};

function postMessage() {
  const content = document.getElementById('textInput').value;
  alert("Nội dung bạn vừa đăng: " + content);
}
