document.addEventListener('DOMContentLoaded', () => {
  // Retrieve desks from the database and display them on the map
  retrieveDesks();

  // Handle form submission for creating new desks
  const deskForm = document.getElementById('desk-form');
  deskForm.addEventListener('submit', (event) => {
    event.preventDefault();

    // Get desk name and symbol from the form
    const deskNameInput = document.getElementById('desk-name');
    const deskSymbolInput = document.getElementById('desk-symbol');
    const deskName = deskNameInput.value;
    const deskSymbol = deskSymbolInput.value;

    // Create a new desk object
    const newDesk = {
      'desk-name': deskName,
      'desk-symbol': deskSymbol,
      position: { left: 0, top: 0 } // Default position
    };

    // Send the new desk data to the backend API for creation
    createDesk(newDesk);

    // Reset the form fields
    deskNameInput.value = '';
    deskSymbolInput.value = '';
  });

  // Function to retrieve desks from the database and display them on the map
  function retrieveDesks() {
    // Make an AJAX request to the backend API to retrieve desk data
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'backend.php', true);
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const desks = JSON.parse(xhr.responseText);

        // Loop through the returned desks and display them on the map
        desks.forEach((desk) => {
          displayDesk(desk);
        });
      }
    };
    xhr.send();
  }

  // Function to create a new desk
  function createDesk(desk) {
    // Make an AJAX request to the backend API to create a new desk
    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'backend.php', true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        const newDesk = JSON.parse(xhr.responseText);

        // Display the newly created desk on the map
        displayDesk(newDesk);
      }
    };
    xhr.send(JSON.stringify(desk));
  }

  // Function to display a desk on the map
function displayDesk(desk) {
  // Create a new desk element with the desk's symbol and name
  const deskElement = document.createElement('div');
  deskElement.classList.add('desk');
  deskElement.innerHTML = `<span class="desk-symbol">${desk.symbol}</span>` +
    `<span class="desk-name">${desk.name}</span>` +
    `<button class="update-button" data-id="${desk.id}">Update</button>` +
    `<button class="delete-button" data-id="${desk.id}">Delete</button>`;

  // Set the desk's position on the map if available
  if (desk.position && desk.position.top && desk.position.left) {
    deskElement.style.top = desk.position.top + 'px';
    deskElement.style.left = desk.position.left + 'px';
  }

  // Make the desk element draggable within the map
  makeDeskDraggable(deskElement, desk);

  // Append the desk element to the map container
  const mapContainer = document.querySelector('.map-container');
  mapContainer.appendChild(deskElement);
}


  // Function to make a desk element draggable
  function makeDeskDraggable(deskElement, desk) {
    let isDragging = false;
    let offsetX = 0;
    let offsetY = 0;

    deskElement.addEventListener('mousedown', (event) => {
      isDragging = true;
      offsetX = event.clientX - deskElement.getBoundingClientRect().left;
      offsetY = event.clientY - deskElement.getBoundingClientRect().top;
    });

    document.addEventListener('mousemove', (event) => {
      if (isDragging) {
        const newLeft = event.clientX - offsetX;
        const newTop = event.clientY - offsetY;

        // Update the desk's position on the map
        desk.position.left = newLeft;
        desk.position.top = newTop;

        // Update the desk's position in the database
        updateDeskPosition(desk);

        // Move the desk element to the new position
        deskElement.style.left = newLeft + 'px';
        deskElement.style.top = newTop + 'px';
      }
    });

    document.addEventListener('mouseup', () => {
      isDragging = false;
    });
  }

  // Function to update the position of a desk
  function updateDeskPosition(desk) {
    // Log the desk position values before sending the request
    console.log('Left:', desk.position.left);
    console.log('Top:', desk.position.top);

    // Make an AJAX request to the backend API to update the desk's position
    const xhr = new XMLHttpRequest();
    const url = `backend.php?id=${desk.id}&left=${desk.position.left}&top=${desk.position.top}`; // Use `desk.id` instead of `desk['id']`
    xhr.open('PUT', url, true);
    xhr.setRequestHeader('Content-type', 'application/json');
    xhr.onreadystatechange = () => {
      if (xhr.readyState === 4 && xhr.status === 200) {
        // Position updated successfully
      }
    };
    xhr.send();
  }
});
