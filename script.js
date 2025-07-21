const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
const recognition = new SpeechRecognition();

recognition.lang = 'vi-VN';
recognition.continuous = false;
recognition.interimResults = false;

let isListening = false;

function toggleMic() {
  if (!isListening) {
    try {
      recognition.start();
      isListening = true;
      micButton.innerText = "🛑 Tắt micro";
    } catch (err) {
      console.error("Lỗi khi start:", err);
    }
  } else {
    recognition.stop();
    isListening = false;
    micButton.innerText = "🎤 Bật micro";
  }
}

recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript.toLowerCase();
  console.log("🎤 Bạn nói:", transcript);

  const mainContent = document.querySelector(".main-content");
  const posts = document.querySelectorAll(".post");
  if (transcript.includes("xuống")) {
    mainContent.scrollBy({ top: 300, behavior: 'smooth' });
  } else if (transcript.includes("lên")) {
    mainContent.scrollBy({ top: -300, behavior: 'smooth' });
  } else if (transcript.includes("lên đầu trang")) {
    mainContent.scrollTo({ top: 0, behavior: 'smooth' });
  } else if (transcript.includes("xuống cuối trang")) {
    mainContent.scrollTo({ top: mainContent.scrollHeight, behavior: 'smooth' });
  } else if (transcript.includes("đổi giao diện")) {
    document.body.classList.toggle("dark");
  } else if (transcript.includes("thích")) {
    const visiblePosts = [];

    handleCommentVoiceCommand(transcript, posts);

    posts.forEach(post => {
        const rect = post.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        if (isVisible) {
        visiblePosts.push({ post, top: rect.top });
        }
    });

    visiblePosts.sort((a, b) => a.top - b.top); // Sắp xếp theo vị trí hiển thị

    const numberWords = {
        "một": 1,
        "hai": 2,
        "ba": 3,
        "bốn": 4,
        "năm": 5,
        "sáu": 6,
        "bảy": 7,
        "tám": 8,
        "chín": 9,
        "mười": 10
    };

    let index = -1;

    // Nếu có nhiều bài → tìm số thứ tự
    if (visiblePosts.length > 1) {
        for (const [word, num] of Object.entries(numberWords)) {
        if (transcript.includes(word)) {
            index = num - 1;
            break;
        }
        }

        if (index === -1) {
        const match = transcript.match(/\b(\d+)\b/);
        if (match) {
            index = parseInt(match[1], 10) - 1;
        }
        }
    } else {
        index = 0; // chỉ có 1 bài → chọn luôn
    }

    // Thực hiện thích nếu tìm được bài hợp lệ
    if (index >= 0 && index < visiblePosts.length) {
        const likeBtn = visiblePosts[index].post.querySelector(".like-btn");
        likeBtn.innerHTML = '<i class="fa-solid fa-heart" style="color: red;"></i> Đã thích';
    }
    } else if (transcript.includes("bỏ thích")) {
    const visiblePosts = [];
    posts.forEach(post => {
      const rect = post.getBoundingClientRect();
      const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
      if (isVisible) visiblePosts.push({ post, top: rect.top });
    });
    visiblePosts.sort((a, b) => a.top - b.top);

    const numberWords = {
      "một": 1, "hai": 2, "ba": 3, "bốn": 4, "năm": 5,
      "sáu": 6, "bảy": 7, "tám": 8, "chín": 9, "mười": 10
    };

    let index = -1;

    if (visiblePosts.length > 1) {
      for (const [word, num] of Object.entries(numberWords)) {
        if (transcript.includes(word)) {
          index = num - 1;
          break;
        }
      }

      if (index === -1) {
        const match = transcript.match(/\b(\d+)\b/);
        if (match) index = parseInt(match[1], 10) - 1;
      }
    } else {
      index = 0;
    }

    if (index >= 0 && index < visiblePosts.length) {
      const likeBtn = visiblePosts[index].post.querySelector(".like-btn");
      likeBtn.innerHTML = '<i class="fa-regular fa-heart"></i> Thích';
    }
  }
    
};

recognition.onend = () => {
  if (isListening) {
    setTimeout(() => {
      try {
        recognition.start();
      } catch (err) {
        console.error("Không thể start lại:", err);
      }
    }, 300);
  }
};

recognition.onerror = (event) => {
  console.error("❌ Lỗi:", event.error);
  alert("Lỗi micro: " + event.error);
  isListening = false;
  micButton.innerText = "🎤 Bật micro";
};
document.querySelectorAll(".like-btn").forEach(button => {
  button.addEventListener("click", () => {
    const isLiked = button.innerHTML.includes("fa-solid");

    if (isLiked) {
      // Nếu đã thích → đổi lại chưa thích
      button.innerHTML = '<i class="fa-regular fa-heart"></i> Thích';
    } else {
      // Nếu chưa thích → đổi sang đã thích
      button.innerHTML = '<i class="fa-solid fa-heart" style="color: red;"></i> Đã thích';
    }
  });
});

document.querySelectorAll(".comment-btn").forEach(button => {
  button.addEventListener("click", () => {
    const post = button.closest(".post");
    const commentSection = post.querySelector(".comment-section");

    // Ẩn các khung bình luận khác (nếu muốn chỉ mở 1 cái tại 1 thời điểm)
    document.querySelectorAll(".comment-section").forEach(sec => {
      if (sec !== commentSection) sec.style.display = "none";
    });

    // Toggle phần bình luận
    commentSection.style.display = commentSection.style.display === "none" ? "block" : "none";
  });
});

document.querySelectorAll(".submit-comment").forEach(button => {
  button.addEventListener("click", () => {
    const post = button.closest(".post");
    const input = post.querySelector(".comment-input");
    const commentList = post.querySelector(".comments-list");

    const commentText = input.value.trim();
    if (commentText) {
      const p = document.createElement("p");
      p.classList.add("comment-item");
      p.textContent = "Bạn: " + commentText;
      commentList.appendChild(p);
      input.value = "";
    }
  });
});
document.querySelectorAll(".comment-btn").forEach((btn, index) => {
  btn.addEventListener("click", () => {
    const post = btn.closest(".post");
    const section = post.querySelector(".comment-section");
    if (section) section.style.display = "block";
  });
});

function handleCommentVoiceCommand(transcript, posts) {
  if (!transcript.includes("bình luận")) return;

  const visiblePosts = Array.from(posts).filter(post => {
    const rect = post.getBoundingClientRect();
    return rect.top >= 0 && rect.bottom <= window.innerHeight;
  });

  visiblePosts.forEach((post, index) => {
    post.dataset.index = index + 1;
  });

  const matched = transcript.match(/bình luận(?: bài viết)?(?: số)?\s*(\d+)/);

  if (visiblePosts.length === 1 && !matched) {
    const section = visiblePosts[0].querySelector(".comment-section");
    if (section) section.style.display = "block";
  } else if (matched) {
    const index = parseInt(matched[1]);
    const section = visiblePosts[index - 1]?.querySelector(".comment-section");
    if (section) section.style.display = "block";
  } else {
    alert("Có nhiều bài viết. Hãy nói rõ số thứ tự để mở bình luận.");
  }
}