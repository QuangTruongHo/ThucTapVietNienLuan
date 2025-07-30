let recognition;
let isMicOn = false;
let isCommenting = false;

const videos = document.querySelectorAll('.post-video');
let currentIndex = 0;

document.addEventListener("DOMContentLoaded", () => {
  initCommentOverlay();
  initLikeButtons();
});

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
    btn.addEventListener("click", () => {
      const overlay = btn.closest(".comment-overlay");
      overlay.style.display = "none";
    });
  });
}

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

// Bật / tắt micro
function toggleMic() {
  if (!('webkitSpeechRecognition' in window)) {
    alert("Trình duyệt không hỗ trợ Web Speech API");
    return;
  }

  if (!recognition) {
    recognition = new webkitSpeechRecognition();
    recognition.lang = "vi-VN";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = function (event) {
      const transcript = event.results[event.results.length - 1][0].transcript.trim().toLowerCase();
      console.log("🎙️ Lệnh:", transcript);

      if (isCommenting) {
        handleCommentVoice(transcript);
      } else {
        handleVoiceCommand(transcript);
      }
    };

    recognition.onerror = function (event) {
      console.error("Lỗi:", event.error);
    };
  }

  if (!isMicOn) {
    recognition.start();
    isMicOn = true;
    document.getElementById("micButton").textContent = "🎤 Đang nghe...";
  } else {
    recognition.stop();
    isMicOn = false;
    isCommenting = false;
    document.getElementById("micButton").textContent = "🎤 Bật micro";
  }
}

function handleVoiceCommand(command) {
  if (command.includes("thích") && !command.includes("bỏ")) {
    clickLike();
  } else if (command.includes("bỏ thích")) {
    clickLike();
  } else if (command.includes("bình luận")) {
    openCommentForm();
  } else if (command.includes("đóng bình luận")) {
    closeCommentForm();
  } else if (command.includes("xuống")) {
    scrollToNextVideo();
  } else if (command.includes("lên")) {
    scrollToPrevVideo();
  } else if (command.includes("nhập bình luận")) {
    startCommentVoice();
  }
}

function getCurrentVideo() {
  return videos[currentIndex];
}

function clickLike() {
  const likeBtn = getCurrentVideo().querySelector(".like-btn");
  if (likeBtn) likeBtn.click();
}

function openCommentForm() {
  const commentBtn = getCurrentVideo().querySelector(".comment-btn");
  if (commentBtn) commentBtn.click();
}

function closeCommentForm() {
  const post = getCurrentVideo();
  const overlay = post.parentElement.querySelector(".comment-overlay");

  if (overlay && overlay.style.display !== "none") {
    overlay.style.display = "none";
    isCommenting = false;
  }
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


function startCommentVoice() {
  const overlay = getCurrentVideo().querySelector(".comment-overlay");
  if (overlay && overlay.style.display !== "none") {
    const input = overlay.querySelector("input");
    input.focus();
    input.value = "";
    isCommenting = true;
  }
}


function handleCommentVoice(command) {
  const overlay = getCurrentVideo().querySelector(".comment-overlay");
  const input = overlay.querySelector("input");
  const commentList = overlay.querySelector(".comment-list");

  if (command.includes("gửi")) {
    if (input.value.trim() !== "") {
      const p = document.createElement("p");
      p.textContent = input.value;
      commentList.appendChild(p);
      input.value = "";
      isCommenting = false;
    }
  } else {
    input.value += (input.value ? " " : "") + command;
  }
}



