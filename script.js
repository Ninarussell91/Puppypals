const COHORT = `2408-FTB-MT-WEB-PT`;
const API_URL = `https://fsa-crud-2aa9294fe819.herokuapp.com/api/${COHORT}`;
const EVENT_URL = `${API_URL}/events`;
const GUEST_URL = `${API_URL}/guests`;
const RSVP_URL = `${API_URL}/rsvps`;

const partyList = document.querySelector("#parties");
const form = document.querySelector("#eventSubmission");
const guestLog = document.querySelector("#guestLog");

const state = {
  events: [],
  guests: [],
  rsvps: [],
  currentGuest: null,
};

// Fetch data from the API
async function fetchData() {
  try {
    const [eventsResponse, rsvpsResponse, guestsResponse] = await Promise.all([
      fetch(EVENT_URL),
      fetch(RSVP_URL),
      fetch(GUEST_URL),
    ]);

    const events = await eventsResponse.json();
    const rsvps = await rsvpsResponse.json();
    const guests = await guestsResponse.json();

    state.events = events.data;
    state.rsvps = rsvps.data;
    state.guests = guests.data;

    renderEvents();
  } catch (error) {
    console.error("Error fetching data:", error);
  }
}

// Add a new event to the API
async function addEvent(event) {
  try {
    const response = await fetch(EVENT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(event),
    });

    if (!response.ok) throw new Error('Failed to add event');

    await fetchData(); // Refresh events after adding
  } catch (error) {
    console.error("Error adding event:", error);
  }
}

// Add a new guest to the API
async function addGuest(guest) {
  try {
    const response = await fetch(GUEST_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(guest),
    });

    if (!response.ok) throw new Error('Failed to add guest');

    await fetchData(); // Refresh guest list after adding
  } catch (error) {
    console.error("Error adding guest:", error);
  }
}

// Remove an event from the API
async function deleteEvent(id) {
  try {
    const response = await fetch(`${EVENT_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) throw new Error('Failed to delete event');

    await fetchData(); // Refresh event list after deleting
  } catch (error) {
    console.error("Error deleting event:", error);
  }
}

// RSVP to an event
async function rsvpToEvent(eventId) {
  const guest = state.guests.find(g => g.name === state.currentGuest.name);

  if (!guest) return console.error("Guest not found");

  const rsvpData = { guestId: guest.id, eventId };
  try {
    const response = await fetch(RSVP_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(rsvpData),
    });

    if (!response.ok) throw new Error('Failed to RSVP');

    await fetchData(); // Refresh after RSVP
  } catch (error) {
    console.error("Error submitting RSVP:", error);
  }
}

// Render events and update the DOM
function renderEvents() {
  const eventCards = state.events.map(party => {
    const eventDateTime = new Date(party.date);
    const dateString = eventDateTime.toLocaleDateString();
    const timeString = eventDateTime.toLocaleTimeString();

    const eventCard = document.createElement("li");
    eventCard.innerHTML = `
      <h2>${party.name}</h2>
      <p>${dateString} at ${timeString}</p>
      <p>${party.location}</p>
      <p>${party.description}</p>
      <button class="rsvp" data-event-id="${party.id}">RSVP</button>
      <button class="delete" data-event-id="${party.id}">Delete Event</button>
      <button class="guestList" data-event-id="${party.id}">View Guests</button>
    `;

    return eventCard;
  });

  partyList.innerHTML = '';
  partyList.append(...eventCards);

  if (state.currentGuest) {
    guestLog.innerHTML = `<h2>Welcome, ${state.currentGuest.name}!</h2>`;
  }
}

// Render guest list for a specific event
function renderGuestList(eventId) {
  const eventRsvps = state.rsvps.filter(rsvp => rsvp.eventId === eventId);
  const guestList = state.guests.filter(guest =>
    eventRsvps.some(rsvp => rsvp.guestId === guest.id)
  );

  const guestListSection = document.querySelector(`#guest-list-${eventId}`);
  guestListSection.innerHTML = guestList.map(g => `<p>${g.name}</p>`).join('');
}

// Handle button clicks for events
partyList.addEventListener("click", (e) => {
  e.preventDefault();
  
  if (e.target.classList.contains("delete")) {
    const eventId = e.target.dataset.eventId;
    deleteEvent(eventId);
  } else if (e.target.classList.contains("rsvp")) {
    const eventId = e.target.dataset.eventId;
    rsvpToEvent(eventId);
  } else if (e.target.classList.contains("guestList")) {
    const eventId = e.target.dataset.eventId;
    renderGuestList(eventId);
  }
});

// Event listener for event submission form
form.addEventListener("submit", (e) => {
  e.preventDefault();

  const eventData = {
    name: form.eventName.value,
    description: form.eventDescription.value,
    date: new Date(form.eventDateTime.value),
    location: form.eventLocation.value,
  };

  addEvent(eventData);
});

// Event listener for guest log form
guestLog.addEventListener("submit", (e) => {
  e.preventDefault();

  const guestData = {
    name: guestLog.guestName.value,
    email: guestLog.email.value,
    phone: guestLog.phone.value,
  };

  state.currentGuest = guestData;
  addGuest(guestData);
});

// Initial data fetch
fetchData();
