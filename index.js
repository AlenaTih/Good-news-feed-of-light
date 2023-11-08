import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js"
import { getDatabase, ref, push, onValue, update } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-database.js"
import { getStorage, ref as sRef, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-storage.js"

const firebaseConfig = {
    apiKey: "AIzaSyChR30UHiZ4u-_t1mbqPfBTY0g57Smr_HA",
    authDomain: "realtime-database-67683.firebaseapp.com",
    databaseURL: "https://realtime-database-67683-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "realtime-database-67683",
    storageBucket: "realtime-database-67683.appspot.com",
    messagingSenderId: "372372469204",
    appId: "1:372372469204:web:f348e41f2bb53d7aaa9241"
  }

  // Initialize Firebase
const app = initializeApp(firebaseConfig)
const database = getDatabase(app)
const goodNewsinDB = ref(database, "goodNewsNewFeatures")

const inputNewsEl = document.getElementById("input-news")
const inputFromEl = document.getElementById("input-from")
const inputDateEl = document.getElementById("input-date")
const inputImageEl = document.getElementById("input-image")

const publishButtonEl = document.getElementById("publish-btn")
const newsFeedEl = document.getElementById("news-feed")

const thankYouEl = document.getElementById("thankyou-message")

let inputValue = {
    date: "",
    news: "",
    from: "",
    like: "🖤",
    likesCount: 0
}

inputImageEl.addEventListener("change", function (event) {
    const imageFile = event.target.files[0]

    // Upload the image to Firebase Storage and get a download URL
    const storage = getStorage(app) // Initialize Firebase Storage
    const storageRef = sRef(storage, `images/${imageFile.name}`)

    uploadBytes(storageRef, imageFile)
    .then( function() {
        console.log("Image uploaded")
        // Get the download URL for the uploaded image
        return getDownloadURL(storageRef)
    })
    .then( function(downloadURL) {
        // Store the downloadURL in your inputValue object
        inputValue.image = downloadURL
        })
    })

inputNewsEl.addEventListener("keypress", function(event) {
    // If the user presses the "Enter" key on the keyboard
    if (event.key === "Enter") {
      // Cancel the default action, if needed
      event.preventDefault()
      // Trigger the button element with a click
      publishButtonEl.click()
    }
  })

inputFromEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        publishButtonEl.click()
    }
})

inputDateEl.addEventListener("keypress", function(event) {
    if (event.key === "Enter") {
        event.preventDefault()
        publishButtonEl.click()
    }
})

publishButtonEl.addEventListener("click", function() {
    // Validation check. Check if news input field is not empty
    if (!inputNewsEl.value.trim()) {
        alert("Please type in your news ❤️")
        return
    }

    // The trim() function ensures that even if the user only enters white spaces,
    // it still counts as empty.
    // It trims any white space from the beginning and end of the input value.

    // The "!" is a logical "NOT" operator. It inverts the truthiness of the value
    // that follows it.
    // It checks if the trimmed value is falsy (an empty string here).

            // Update inputValue with input values before posting
            inputValue.date = inputDateEl.value
            inputValue.news = inputNewsEl.value
            inputValue.from = inputFromEl.value

            // Push the news item to the database
            push(goodNewsinDB, inputValue)
        
            // Clear the input fiedls after the button is clicked
            clearInputFields()
        
             // Show thank you message
            thankYouEl.style.display = "block"
             setTimeout( function() {
                 thankYouEl.style.opacity = "1"
             }, 10);  // Slight delay to ensure the fade-in effect plays
         
             // Hide the thank you message after 3 seconds
             setTimeout( function() {
                 thankYouEl.style.opacity = "0"
                 setTimeout( function() {
                     thankYouEl.style.display = "none"
                 }, 1000)  // Hide after the fade-out effect completes
             }, 3000)

})


onValue(goodNewsinDB, function(snapshot) {
    if (snapshot.exists()) {
        
        clearNewsFeedEl()

        let newsObj = snapshot.val()
        for (let key in newsObj) {
            prependNewsToNewsFeedEl(newsObj[key], key)
        }
    } else {
        newsFeedEl.innerHTML += "No items here... yet"
    }
})

function clearNewsFeedEl() {
    newsFeedEl.innerHTML = ""
}

function clearInputFields() {
    inputImageEl.value = null
    inputDateEl.value = ""
    inputNewsEl.value = ""
    inputFromEl.value = ""
}

function prependNewsToNewsFeedEl(item, key) {

    for(let i = 0; i < 1; i++) {
        let newNews = item.news
        let newFrom = item.from
        let newDate = item.date
        let newImage = item.image
        
        let likesSymbol = "🖤"

        if (localStorage.getItem(`liked-${key}`)) {
            // Indicate it's already liked
            likesSymbol = "❤️"
        }

        let likesNumber = item.likesCount

        let newEl = document.createElement("li")

        
        // If a user didn't upload an image, a news will be published without an image
        // If a news image exists in the database, it will be rendered in the published news

        if (!newImage) {             
            newEl.innerHTML =
                `<div class="newsItem">
                    <div class="news-data">
                        <h4>${newDate}</h4>
                        <br><br>
                        <p>${newNews}</p>
                        <br><br>
                        <h4>${newFrom}</h4>
                    </div>
                    <div class="like">
                        <button class="like-button" data-key="${key}">${likesSymbol}</button>
                        <h8 class="like-me">${likesNumber}</h8>
                    </div>
                </div>`
        } else {
            newEl.innerHTML =
            `<div class="newsItem">
                    <div class="news">
                        <img class="news-image" src="${newImage}" alt="News image">
                        <div class="news-data">
                            <h4>${newDate}</h4>
                            <br><br>
                            <p>${newNews}</p>
                            <br><br>
                            <h4>${newFrom}</h4>
                        </div>
                    </div>
                    <div class="like">
                        <button class="like-button" data-key="${key}">${likesSymbol}</button>
                        <h8 class="like-me">${likesNumber}</h8>
                    </div>
                </div>`
        }


        newsFeedEl.prepend(newEl)

        // Check if this item was previously liked by the user
        if (localStorage.getItem(`liked-${key}`)) {
            // Indicate it's already liked
            newEl.querySelector(".like-button").setAttribute("data-liked", "true")
        }

        newEl.querySelector(".like-button").addEventListener("click", function(e) {
           let btn = e.target
           let itemKey = btn.dataset.key
           let countEl = newEl.querySelector(".like-me")
           let number = Number(countEl.textContent)

            // Check if the news item is already liked
            if (btn.getAttribute("data-liked") === "true") {
                //Unlike the news item
                number -= 1 // Decrement like count
                localStorage.removeItem(`liked-${itemKey}`) // Remove from local storage
                btn.removeAttribute("data-liked") // Mark as unliked
                btn.textContent = "🖤"
            } else {
                // Like the news item
                number +=1 // Increment like count
                localStorage.setItem(`liked-${itemKey}`, true) // Save to local storage
                btn.setAttribute("data-liked", "true") // Mark as liked
                btn.textContent = "❤️"
            }

           countEl.textContent = number // Update what is rendered (display)

           // Update the database
           let itemRef = ref(database, `goodNewsNewFeatures/${itemKey}`)
           update(itemRef, {
            likesCount: number
           })
        })
    }
}
