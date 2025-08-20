let recognition;
let isMicOn = false;
let isPaused = false; // true = tạm dừng xử lý lệnh
let isCommenting = false; // true = đang nhập bình luận

let videos;
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  videos = document.querySelectorAll('.post-video video');
  initCommentOverlay();
  initLikeButtons();
  initSendButtons();
  initVideoScrollPlay();
});

// -------------------- VIDEO CHỈ PHÁT KHI SCROLL --------------------
function initVideoScrollPlay() {
  const bgMusic = document.getElementById("bgMusic");

  videos.forEach(video => {
    video.pause();
    video.currentTime = 0;
    video.muted = true;
  });
  if (bgMusic) {
    bgMusic.pause();
    bgMusic.currentTime = 0;
  }

  const observer = new IntersectionObserver((entries) => {
    let isAnyVideoPlaying = false;

    entries.forEach(entry => {
      const video = entry.target;
      if (entry.isIntersecting) {
        video.muted = false;
        video.play().catch(err => console.log("Không thể phát video:", err));
        currentIndex = Array.from(videos).indexOf(video);
        isAnyVideoPlaying = true;
      } else {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
      }
    });

    if (bgMusic) {
      if (!isAnyVideoPlaying) {
        if (bgMusic.paused) bgMusic.play();
      } else {
        if (!bgMusic.paused) bgMusic.pause();
      }
    }
  }, { threshold: 0.6 });

  videos.forEach(video => observer.observe(video));

  videos.forEach(video => {
    video.addEventListener("click", () => {
      if (video.paused) {
        video.play();
      } else {
        video.pause();
      }
    });
  });
}

// -------------------- COMMENT --------------------
function initCommentOverlay() {
  const commentBtns = document.querySelectorAll(".comment-btn");
  const closeBtns = document.querySelectorAll(".close-overlay");

  commentBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const post = btn.closest(".post-video");
      const overlay = post.querySelector(".comment-overlay");
      overlay.style.display = "flex";
    });
  });

  closeBtns.forEach((btn) => {
    const overlay = btn.closest(".comment-overlay");
    btn.addEventListener("click", () => {
      overlay.style.display = "none";
    });
  });
}

// -------------------- LIKE --------------------
function initLikeButtons() {
  const likeButtons = document.querySelectorAll(".like-btn");

  likeButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      const icon = btn.querySelector("i");

      if (icon.classList.contains("fa-regular")) {
        icon.classList.remove("fa-regular");
        icon.classList.add("fa-solid");
        icon.style.color = "red";
      } else {
        icon.classList.remove("fa-solid");
        icon.classList.add("fa-regular");
        icon.style.color = "";
      }
    });
  });
}

// -------------------- COMMENT GỬI --------------------
function initSendButtons() {
  const sendBtns = document.querySelectorAll(".send-btn");

  sendBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      const form = btn.closest(".comment-form");
      const input = form.querySelector("input");
      const text = input.value.trim();
      if (text !== "") {
        const commentList = form.closest(".comment-overlay").querySelector(".comments-list");
        const p = document.createElement("p");
        p.innerHTML = `<strong>Bạn:</strong> ${text}`;
        commentList.appendChild(p);
        input.value = "";
      }
    });
  });
}

// -------------------- MIC --------------------
function initRecognition() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Trình duyệt không hỗ trợ Web Speech API");
    return;
  }
  recognition = new webkitSpeechRecognition();
  recognition.lang = "vi-VN";
  recognition.continuous = true;
  recognition.interimResults = false;

  recognition.onresult = function (event) {
    const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
    console.log("🎤 Lệnh:", transcript);

    const voiceBox = document.getElementById("voiceLog");
    if (voiceBox) voiceBox.textContent = transcript;

    if (isPaused) {
      if (transcript.includes("nghe tiếp")) {
        isPaused = false;
        document.getElementById("micButton").textContent = "🎧 Đang nghe...";
        console.log("▶️ Tiếp tục nhận lệnh");
      } else {
        console.log("⏸ Mic đang tạm dừng, bỏ qua:", transcript);
      }
    } else {
      if (transcript.includes("dừng nghe")) {
        isPaused = true;
        document.getElementById("micButton").textContent = "⏸ Tạm dừng";
        console.log("⏸ Đã tạm dừng nhận lệnh");
      } else {
        handleVoiceCommand(transcript);
      }
    }
  };

  recognition.onend = function () {
    if (isMicOn) {
      recognition.start();
    }
  };

  recognition.onerror = function (event) {
    console.error("Lỗi mic:", event.error);
  };
}

function toggleMic() {
  if (!recognition) initRecognition();

  if (!isMicOn) {
    recognition.start();
    isMicOn = true;
    isPaused = false;
    document.getElementById("micButton").textContent = "🎧 Đang nghe...";
  } else {
    recognition.stop();
    isMicOn = false;
    isPaused = false;
    document.getElementById("micButton").textContent = "🎤 Bật micro";
  }
}

// -------------------- XỬ LÝ LỆNH --------------------
function handleVoiceCommand(command) {
  // Nếu đang trong chế độ nhập bình luận
  if (isCommenting) {
    if (command.includes("gửi")) {
      clickSendButton();
      isCommenting = false;
      console.log("✅ Gửi bình luận & thoát chế độ nhập");
    } else if (command.includes("xoá")) {
      clearCommentInput();
      console.log("🗑️ Xóa bình luận");
    } else {
      insertCommentText(command); // nối thêm nội dung
      console.log("✍️ Thêm nội dung:", command);
    }
    return; // không xử lý các lệnh khác khi đang nhập
  }

  // --- Các lệnh khác ---
  if (command.includes("thích") && !command.includes("bỏ")) {
    clickLike();
  } else if (command.includes("bỏ thích")) {
    clickLike();
  } else if (command.includes("bình luận")) {
    openCommentForm();
  } else if (command.includes("đóng bình luận")) {
    closeCommentForm();
  } else if (command.includes("thoát")) {
    closeAllCommentOverlays();
  } else if (command.includes("xuống")) {
    scrollToNextVideo();
  } else if (command.includes("lên")) {
    scrollToPrevVideo();
  } else if (command.includes("nhập bình luận")) {
    focusCommentInput();
  } else if (command.includes("viết")) {
    focusCommentInput();
    isCommenting = true;
    clearCommentInput();
    console.log("📝 Bật chế độ nhập bình luận");
  } else if (command.includes("đổi giao diện")) {
    toggleDarkMode();
  } else if (command.includes("tạm dừng")) { 
    const video = getCurrentVideo();
    if (video && !video.paused) {
      video.pause();
      console.log("⏸ Video đã tạm dừng");
    }
  } else if (command.includes("tiếp tục")) { 
    const video = getCurrentVideo();
    if (video && video.paused) {
      video.play();
      console.log("▶️ Video tiếp tục phát");
    }
  }
}

// -------------------- CÁC HÀM HỖ TRỢ --------------------
function getCurrentVideo() {
  return videos[currentIndex];
}

function clickLike() {
  const likeBtn = getCurrentVideo().closest(".post-video").querySelector(".like-btn");
  if (likeBtn) likeBtn.click();
}

function openCommentForm() {
  const commentBtn = getCurrentVideo().closest(".post-video").querySelector(".comment-btn");
  if (commentBtn) commentBtn.click();
}

function closeCommentForm() {
  const post = getCurrentVideo().closest(".post-video");
  const overlay = post.querySelector(".comment-overlay");
  if (overlay && overlay.style.display !== "none") {
    overlay.style.display = "none";
  }
}

function closeAllCommentOverlays() {
  const overlays = document.querySelectorAll(".comment-overlay");
  overlays.forEach(overlay => {
    overlay.style.display = "none";
  });
}

function scrollToNextVideo() {
  if (currentIndex < videos.length - 1) {
    currentIndex++;
    videos[currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
}

function scrollToPrevVideo() {
  if (currentIndex > 0) {
    currentIndex--;
    videos[currentIndex].scrollIntoView({ behavior: 'smooth' });
  }
}

function focusCommentInput() {
  const post = getCurrentVideo().closest(".post-video");
  const overlay = post.querySelector(".comment-overlay");

  if (overlay && overlay.style.display === "none") {
    overlay.style.display = "flex";
  }

  const input = post.querySelector(".comment-form input");
  if (input) {
    setTimeout(() => {
      input.focus();
      input.click();
    }, 200);
  }
}

function insertCommentText(text) {
  const post = getCurrentVideo().closest(".post-video");
  const input = post.querySelector(".comment-form input");
  if (input) {
    focusCommentInput();
    if (input.value !== "") {
      input.value += " " + text;
    } else {
      input.value = text;
    }
  }
}

function clickSendButton() {
  const post = getCurrentVideo().closest(".post-video");
  const sendBtn = post.querySelector(".send-btn");
  if (sendBtn) {
    sendBtn.click();
  }
}

function clearCommentInput() {
  focusCommentInput();
  setTimeout(() => {
    const post = getCurrentVideo().closest(".post-video");
    if (!post) return;
    const input = post.querySelector(".comment-form input");
    if (input) input.value = "";
  }, 300);
}

function toggleDarkMode() {
  const isDark = document.body.classList.toggle("dark-mode");
  const checkbox = document.getElementById("themeToggle");
  if (checkbox) checkbox.checked = isDark;
}



