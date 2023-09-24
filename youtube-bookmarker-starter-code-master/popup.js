import { getActiveTabURL } from "./utils.js";

// Adding a new bookmark row to the popup
const addNewBookmark = (bookmarks, bookmark) => {
    const bookmarkTitleElement = document.createElement("div");
    const controlsElement = document.createElement('div');
    const noteElement = document.createElement('input'); // Create the noteElement

    bookmarkTitleElement.textContent = bookmark.desc;
    bookmarkTitleElement.className = "bookmark-title";
    controlsElement.className = "bookmark-controls";

    setBookmarkAttributes("play", onPlay, controlsElement);
    setBookmarkAttributes("delete", onDelete, controlsElement);

    noteElement.type = 'text'; // Set the input type to text
    noteElement.className = 'bookmark-note';
    noteElement.placeholder = 'Add a note...'; // Add a placeholder for the input field
    noteElement.value = bookmark.note || ''; // Populate the input field with the saved note if available

    const newBookmarkElement = document.createElement("div"); // Create the newBookmarkElement

    newBookmarkElement.id = "bookmark-" + bookmark.time;
    newBookmarkElement.className = "bookmark";
    newBookmarkElement.setAttribute("timestamp", bookmark.time);

    newBookmarkElement.appendChild(bookmarkTitleElement);
    newBookmarkElement.appendChild(controlsElement);
    newBookmarkElement.appendChild(noteElement); // Append the note input field to the bookmark element

    bookmarks.appendChild(newBookmarkElement);
};

const viewBookmarks = (currentBookmarks = []) => {
    const bookmarksElement = document.getElementById("bookmarks");
    bookmarksElement.innerHTML = "";

    if (currentBookmarks.length > 0) {
        for (let i = 0; i < currentBookmarks.length; i++) {
            const bookmark = currentBookmarks[i];
            addNewBookmark(bookmarksElement, bookmark);
        }
    } else {
        // Check that this message is displayed when there are no bookmarks
        bookmarksElement.innerHTML = '<i class="row">No bookmarks to show</i>';
    }

    console.log("Bookmarks have been displayed.");
    return;
};

const onPlay = async (e) => {
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkNote = e.target.parentNode.parentNode.querySelector(".bookmark-note").value; // Get the note input value
    const activeTab = await getActiveTabURL();

    chrome.tabs.sendMessage(activeTab.id, {
        type: "PLAY",
        value: bookmarkTime,
        note: bookmarkNote, // Pass the note along with the timestamp
    });
};

const onDelete = async (e) => {
    const activeTab = await getActiveTabURL();
    const bookmarkTime = e.target.parentNode.parentNode.getAttribute("timestamp");
    const bookmarkElementToDelete = document.getElementById("bookmark-" + bookmarkTime);

    bookmarkElementToDelete.parentNode.removeChild(bookmarkElementToDelete);

    chrome.tabs.sendMessage(activeTab.id, {
        type: "DELETE",
        value: bookmarkTime,
    }, viewBookmarks);
};

const setBookmarkAttributes = (src, eventListener, controlParentElement) => {
    const controlElement = document.createElement("img");

    controlElement.src = "assets/" + src + ".png";
    controlElement.title = src;
    controlElement.addEventListener("click", eventListener);
    controlParentElement.appendChild(controlElement);
};

document.addEventListener("DOMContentLoaded", async () => {
    const activeTab = await getActiveTabURL();
    const queryParameters = activeTab.url.split("?")[1];
    const urlParameters = new URLSearchParams(queryParameters);

    const currentVideo = urlParameters.get("v");

    if (activeTab.url.includes("youtube.com/watch") && currentVideo) {
        const container = document.getElementsByClassName("container")[0];

        bookmarkButton.addEventListener("click", () => {
            // Code to create a bookmark here
            const bookmark = {
                desc: "Your Bookmark", // Customize this description
                note: "", // You can add a note here if needed
            };
        
            addNewBookmark(currentVideoBookmarks, bookmark);
        
            // After adding the bookmark, update the view
            viewBookmarks(currentVideoBookmarks);
        });

        container.innerHTML = ''; // Clear any existing content
        container.appendChild(bookmarkButton); // Append the bookmark button
        viewBookmarks(currentVideoBookmarks);
    } else {
        const container = document.getElementsByClassName("container")[0];
        container.innerHTML = '<div class="title">This is not a YouTube video page.</div>';
    }
});

