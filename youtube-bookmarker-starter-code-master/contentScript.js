(() => {
    let youtubeLeftControls, youtubePlayer;
    let currentVideo = "";
    let currentVideoBookmarks = [];
  
    const fetchBookmarks = () => {
      return new Promise((resolve) => {
        chrome.storage.sync.get([currentVideo], (obj) => {
          resolve(obj[currentVideo] ? JSON.parse(obj[currentVideo]) : []);
        });
      });
    };
    
    const addNewBookmarkEventHandler = async () => {
      const currentTime = youtubePlayer.currentTime;
      const note = prompt("Add a note for this bookmark:"); // Prompt the user for a note
      const newBookmark = {
        time: currentTime,
        desc: "Bookmark at " + getTime(currentTime),
        note: note, // Store the note in the bookmark object
      };
  
      currentVideoBookmarks = await fetchBookmarks();
  
      chrome.storage.sync.set({
        [currentVideo]: JSON.stringify([...currentVideoBookmarks, newBookmark].sort((a, b) => a.time - b.time))
      });
    };
  
    const newVideoLoaded = async () => {
      const bookmarkBtnExists = document.getElementsByClassName("bookmark-btn")[0];
  
      currentVideoBookmarks = await fetchBookmarks();
  
      if (!bookmarkBtnExists) {
        const bookmarkBtn = document.createElement("img");
  
        bookmarkBtn.src = chrome.runtime.getURL("assets/star.png");
        bookmarkBtn.className = "ytp-button " + "bookmark-btn";
        bookmarkBtn.title = "Click to bookmark current timestamp";

        // Add a new class for the hover state
        bookmarkBtn.classList.add("bookmark-btn-hover");
  
        youtubeLeftControls = document.getElementsByClassName("ytp-left-controls")[0];
        youtubePlayer = document.getElementsByClassName('video-stream')[0];
  
        youtubeLeftControls.appendChild(bookmarkBtn);
        bookmarkBtn.addEventListener("click", addNewBookmarkEventHandler);

        // Add a hover event listener to toggle the hover class
        bookmarkBtn.addEventListener("mouseenter", () => {
            bookmarkBtn.src = chrome.runtime.getURL("assets/starhov.png");
          });
          bookmarkBtn.addEventListener("mouseleave", () => {
            bookmarkBtn.src = chrome.runtime.getURL("assets/star.png");
          });
      }
    };
  
    chrome.runtime.onMessage.addListener((obj, sender, response) => {
      const { type, value, videoId } = obj;
  
      if (type === "NEW") {
        currentVideo = videoId;
        newVideoLoaded();
      } else if (type === "PLAY") {
        youtubePlayer.currentTime = value;
      } else if ( type === "DELETE") {
        currentVideoBookmarks = currentVideoBookmarks.filter((b) => b.time != value);
        chrome.storage.sync.set({ [currentVideo]: JSON.stringify(currentVideoBookmarks) });
  
        response(currentVideoBookmarks);
      }
    });
  
    newVideoLoaded();
  })();
  
  const getTime = t => {
    var date = new Date(0);
    date.setSeconds(t);
  
    return date.toISOString().substr(11, 8);
  };