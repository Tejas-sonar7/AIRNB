(() => {
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;
  if (!SpeechRecognition || !synth) return;

  function speak(text, callback) {
    const u = new SpeechSynthesisUtterance(text);
    u.onend = () => callback && callback();
    synth.cancel();
    synth.speak(u);
  }

  const pending = localStorage.getItem("pendingVoiceAction");
  if (!pending) return;

  const { action, listingId, listingTitle } = JSON.parse(pending);

  if (action !== "writeReview") return;
  if (!window.location.pathname.includes(listingId)) return;

  localStorage.removeItem("pendingVoiceAction");

  let reviewStep = 0; // 0 = ask rating, 1 = ask comment
  let recognition;

  // Delay so page fully loads
  setTimeout(() => {
    speak(`Let's write a review for ${listingTitle}. What rating would you like to give, from 1 to 5 stars?`, () => {
      startListening(handleVoiceInput);
    });
  }, 2000);

  function startListening(callback) {
    if (recognition) recognition.stop();

    recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;
    recognition.continuous = false;

    recognition.onresult = (e) => {
      const transcript = e.results[0][0].transcript.toLowerCase().trim();
      console.log("🎤 Heard:", transcript);
      callback(transcript);
    };

    recognition.onerror = (err) => {
      console.error("❌ SpeechRecognition error:", err);
      if (err.error === "no-speech") {
        speak("I didn’t hear anything. Please try again.");
        startListening(callback);
      } else if (err.error === "not-allowed") {
        speak("Please allow microphone access and try again.");
      }
    };

    recognition.onend = () => {
      console.log("🎤 Mic stopped");
    };

    recognition.start();
  }

  function handleVoiceInput(text) {
    if (reviewStep === 0) {
      const rating = extractRating(text);
      if (!rating) {
        speak("Sorry, I didn’t catch your rating. Please say a number between one and five.", () => {
          startListening(handleVoiceInput);
        });
        return;
      }

      const ratingInput = document.querySelector("input[type='range'], input[name='rating']");
      if (ratingInput) ratingInput.value = rating;

      reviewStep = 1;
      speak(`Got it. ${rating} stars. Now please speak your review comment.`, () => {
        startListening(handleVoiceInput);
      });
    } else if (reviewStep === 1) {
      const textarea = document.querySelector("textarea[name='comment'], textarea");
      if (textarea) textarea.value = text;

      speak(`Submitting your review: ${text}`);
      const form = document.querySelector("form[action*='reviews']");
      if (form) form.submit();
    }
  }

  function extractRating(text) {
    const wordMap = {
      one: 1,
      two: 2,
      three: 3,
      four: 4,
      five: 5,
    };

    // Check for numeric digit
    const numMatch = text.match(/[1-5]/);
    if (numMatch) return parseInt(numMatch[0]);

    // Check for word
    for (const [word, num] of Object.entries(wordMap)) {
      if (text.includes(word)) return num;
    }

    return null;
  }
})();
