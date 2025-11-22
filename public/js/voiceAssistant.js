/* Voice Assistant - WanderLust */
(() => {
  const btn = document.createElement("button");
  btn.id = "voice-btn";
  btn.title = "Voice Assistant";
  btn.innerText = "🎤";
  document.body.appendChild(btn);

  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const synth = window.speechSynthesis;

  function speak(text) {
    if (!synth) return;
    const u = new SpeechSynthesisUtterance(text);
    synth.cancel();
    synth.speak(u);
  }

  if (!SpeechRecognition) {
    console.warn("SpeechRecognition not supported");
    btn.style.display = "none";
    return;
  }

  const recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.onresult = async (event) => {
    const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
    console.log("🎤 Heard:", transcript);

    // ---- Navigation ----
    if (transcript.includes("go to home") || transcript.includes("home page")) {
      speak("Taking you to home page");
      window.location.href = "/";
      return;
    }

    if (transcript.includes("go to all listing") || transcript.includes("go to listings") || transcript.includes("all listings")) {
      speak("Opening all listings");
      window.location.href = "/listings";
      return;
    }

    if (transcript.includes("add new listing") || transcript.includes("create listing") || transcript.includes("new listing")) {
      speak("Opening add new listing page");
      window.location.href = "/listings/new";
      return;
    }

    // ---- Open specific listing ----
    if (transcript.startsWith("open listing") || transcript.startsWith("open ")) {
      let title = transcript.replace(/^open listing\s*/i, "").replace(/^open\s*/i, "").trim();
      if (!title) { speak("Which listing do you want to open?"); return; }
      speak(`Searching for ${title}`);
      await searchListingByTitleAndGo(title);
      return;
    }

    // ---- Write review ----
    if (transcript.startsWith("write review for") || transcript.startsWith("write a review for")) {
      const title = transcript.replace(/^write (a )?review for\s*/i, "").trim();
      if (!title) { speak("Which listing should I write the review for?"); return; }
      speak(`Opening ${title} for review`);
      await startVoiceWriteReviewFlow(title);
      return;
    }

    // ---- Delete review ----
    if (transcript.startsWith("delete review for") || transcript.startsWith("remove review for")) {
      const title = transcript.replace(/^(delete|remove) review for\s*/i, "").trim();
      if (!title) { speak("Which listing review should I delete?"); return; }
      speak(`Deleting review for ${title}`);
      await deleteReviewByTitle(title);
      return;
    }

    // ---- Delete listing ----
    if (transcript.startsWith("delete listing") || transcript.startsWith("remove listing")) {
      const title = transcript.replace(/^(delete|remove) listing\s*/i, "").trim();
      if (!title) { speak("Which listing should I delete?"); return; }
      speak(`Deleting listing ${title}`);
      await deleteListingByTitle(title);
      return;
    }

    // ---- Back ----
    if (transcript.includes("back") || transcript.includes("previous")) {
      speak("Going back");
      window.history.back();
      return;
    }

    speak(`Sorry, I didn't understand: ${transcript}`);
  };

  recognition.onend = () => btn.classList.remove("listening");

  recognition.onerror = (e) => {
    console.error("Recognition error", e);
    btn.classList.remove("listening");
    speak("Error occurred. Please try again.");
  };

  btn.addEventListener("click", () => {
    try {
      recognition.start();
      btn.classList.add("listening");
      speak("I'm listening");
    } catch (err) {
      console.error(err);
    }
  });

  // --- Helper functions ---
  async function searchListingByTitle(title) {
    const res = await fetch(`/api/listings?title=${encodeURIComponent(title)}`);
    if (!res.ok) return null;
    return res.json();
  }

  async function searchListingByTitleAndGo(title) {
    const listing = await searchListingByTitle(title);
    if (listing && listing._id) {
      window.location.href = `/listings/${listing._id}`;
    } else {
      speak(`I couldn't find a listing named ${title}`);
    }
  }

  async function startVoiceWriteReviewFlow(title) {
    const listing = await searchListingByTitle(title);
    if (!listing || !listing._id) {
      speak(`I couldn't find a listing named ${title}`);
      return;
    }
    localStorage.setItem("pendingVoiceAction", JSON.stringify({
      action: "writeReview",
      listingId: listing._id,
      listingTitle: listing.title || title
    }));
    window.location.href = `/listings/${listing._id}`;
  }

  async function deleteReviewByTitle(title) {
    try {
      const res = await fetch(`/api/reviews/deleteByTitle/${encodeURIComponent(title)}`, { method: "DELETE" });
      speak(res.ok ? `Deleted review for ${title}` : `Couldn't delete review for ${title}`);
    } catch (err) {
      console.error(err);
      speak("Network error while deleting review.");
    }
  }

  async function deleteListingByTitle(title) {
    try {
      const res = await fetch(`/api/listings/deleteByTitle/${encodeURIComponent(title)}`, { method: "DELETE" });
      speak(res.ok ? `Deleted listing ${title}` : `Couldn't delete listing ${title}`);
    } catch (err) {
      console.error(err);
      speak("Network error while deleting listing.");
    }
  }
})();
