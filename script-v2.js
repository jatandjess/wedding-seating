
const form = document.getElementById("search-form");
const input = document.getElementById("guest-search");
const results = document.getElementById("results");
const message = document.getElementById("message");
const venueSection = document.getElementById("venue-section");
const closeMap = document.getElementById("close-map");
const mapFrame = document.getElementById("map-frame");
const mapCanvas = document.getElementById("map-canvas");
const venueMap = document.getElementById("venue-map");
const tableHighlight = document.getElementById("table-highlight");

const tablePositions = {
  "ASHLEY COLE": [45.1, 7.0],
  "GIANLUCA VIALLI": [63.8, 7.0],
  "JOHN TERRY": [82.6, 7.0],
  "FRANK LAMPARD": [30.8, 16.9],
  "THIAGO SILVA": [50.4, 16.9],
  "PETR ČECH": [70.1, 16.9],
  "EDEN HAZARD": [89.1, 16.9],
  "ROMAN ABRAMOVICH": [30.8, 26.7],
  "DENNIS WISE": [50.4, 26.7],
  "BLUE ARMY": [70.1, 26.7],
  "BLUE LIONS": [89.1, 26.7],
  "DIDIER DROGBA": [30.8, 36.5],
  "ROBERTO DI MATTEO": [50.4, 36.5],
  "JOSÉ MOURINHO": [70.1, 36.5],
  "THE BLUES": [89.1, 36.5],
  "N’GOLO KANTÉ": [12.3, 73.0],
  "LONDON IS BLUE": [50.4, 73.0],
  "REECE JAMES": [70.1, 73.0],
  "JOE COLE": [89.1, 73.0],
  "RAY WILKINS": [12.3, 86.5],
  "RICARDO CARVALHO": [50.4, 86.5],
  "GIANFRANCO ZOLA": [70.1, 86.5],
  "DIEGO COSTA": [89.1, 86.5]
};

let guests = [];

function normalise(value) {
  return value
    .toLocaleLowerCase("en-GB")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[’']/g, "")
    .replace(/[^a-z0-9\s-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

fetch("guests.json")
  .then(response => {
    if (!response.ok) throw new Error("Guest list could not be loaded.");
    return response.json();
  })
  .then(data => { guests = data; })
  .catch(() => {
    message.textContent = "The guest list could not be loaded. Please refresh the page.";
  });

form.addEventListener("submit", event => {
  event.preventDefault();
  searchGuests();
});

closeMap.addEventListener("click", () => {
  venueSection.hidden = true;
  tableHighlight.classList.remove("visible");
  input.focus();
});


function highlightTable(tableName) {
  const position = tablePositions[tableName.toUpperCase()];
  if (!position) {
    tableHighlight.classList.remove("visible");
    return;
  }

  tableHighlight.style.left = position[0] + "%";
  tableHighlight.style.top = position[1] + "%";
  tableHighlight.classList.add("visible");

  const scrollToHighlight = () => {
    const x = (position[0] / 100) * mapCanvas.scrollWidth;
    const y = (position[1] / 100) * mapCanvas.scrollHeight;

    mapFrame.scrollTo({
      left: Math.max(0, x - mapFrame.clientWidth / 2),
      top: Math.max(0, y - mapFrame.clientHeight / 2),
      behavior: "smooth"
    });
  };

  if (venueMap.complete) {
    setTimeout(scrollToHighlight, 250);
  } else {
    venueMap.addEventListener("load", () => setTimeout(scrollToHighlight, 250), { once: true });
  }
}

function searchGuests() {
  const query = normalise(input.value);
  results.innerHTML = "";
  venueSection.hidden = true;
  tableHighlight.classList.remove("visible");

  if (query.length < 2) {
    message.textContent = "Please enter at least two letters.";
    input.focus();
    return;
  }

  const matches = guests
    .map(guest => ({ ...guest, normalisedName: normalise(guest.name) }))
    .filter(guest => guest.normalisedName.includes(query))
    .sort((a, b) => {
      const aExact = a.normalisedName === query ? 0 : 1;
      const bExact = b.normalisedName === query ? 0 : 1;
      return aExact - bExact || a.name.localeCompare(b.name, "en-GB");
    });

  if (!matches.length) {
    message.textContent = "We couldn't find that name. Please check the spelling or ask a member of the wedding party.";
    return;
  }

  message.textContent = matches.length > 1
    ? "We found more than one guest. Please select your name below."
    : "";

  matches.forEach(guest => {
    const card = document.createElement("article");
    card.className = "result-card";

    const name = document.createElement("h3");
    name.className = "guest-name";
    name.textContent = guest.name;

    const label = document.createElement("p");
    label.className = "seated-label";
    label.textContent = "You are seated at";

    const table = document.createElement("p");
    table.className = "table-title";
    table.textContent = guest.table;

    const subtitle = document.createElement("p");
    subtitle.className = "table-subtitle";
    subtitle.textContent = guest.subtitle;

    const mapButton = document.createElement("button");
    mapButton.type = "button";
    mapButton.className = "map-button";
    mapButton.textContent = "View Venue Layout";
    mapButton.addEventListener("click", () => {
      venueSection.hidden = false;
      venueSection.dataset.table = guest.table;
      highlightTable(guest.table);
      venueSection.scrollIntoView({ behavior: "smooth", block: "start" });
    });

    card.append(name, label, table);
    if (guest.subtitle) card.appendChild(subtitle);
    card.appendChild(mapButton);
    results.appendChild(card);
  });
}
