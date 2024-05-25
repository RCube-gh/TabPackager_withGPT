let data = {
    groups: []
};

// Hide modals on initial load
document.getElementById('group-input-modal').style.display = 'none';
document.getElementById('group-detail-view').style.display = 'none';

let openedTabs = []; // To keep track of opened tabs

function showGroupInput() {
    hideGroupDetail(); // Ensure any other modal is hidden
    const modal = document.getElementById('group-input-modal');
    modal.classList.add('add-group-modal');
    modal.style.display = 'flex'; // Display the modal
    modal.style.alignItems = 'center'; // Center vertically
    modal.style.justifyContent = 'center'; // Center horizontally
    document.getElementById('group-name').focus();
}

function hideGroupInput() {
    const modal = document.getElementById('group-input-modal');
    modal.classList.remove('add-group-modal');
    modal.style.display = 'none';
}

function addGroup() {
    const groupName = document.getElementById('group-name').value.trim();
    // Check if the group name already exists in the data.groups array
    const existingGroup = data.groups.find(group => group.name === groupName);

    if (existingGroup) {
        alert('A group with this name already exists. Please choose a different name.');
        return;
    }

    if (groupName) {
        data.groups.push({ name: groupName, links: [] });
        document.getElementById('group-name').value = '';
        renderGroups();
        saveData();
        hideGroupInput();
    }
}


function handleKeyPress(event) {
    if (event.key === 'Enter') {
        addGroup();
    }
    if (event.key === 'Escape') {
        hideGroupInput();
        hideGroupDetail();
    }
}

function handleModalClick(event) {
    if (event.target === document.getElementById('group-input-modal')) {
        hideGroupInput();
    }
    if (event.target === document.getElementById('group-detail-view')) {
        hideGroupDetail();
    }
}

// Function to render groups
function renderGroups() {
    const groupsContainer = document.getElementById('group-container');
    groupsContainer.innerHTML = '';
    data.groups.forEach((group, index) => {
        const groupDiv = document.createElement('div');
        groupDiv.classList.add('group');
        groupDiv.textContent = group.name;
        groupDiv.setAttribute('data-id', index);
        groupDiv.onclick = () => showGroupDetail(index);
        groupsContainer.appendChild(groupDiv);
    });

    // Add the add-group button
    const addGroupDiv = document.createElement('div');
    addGroupDiv.classList.add('group', 'add-group');
    addGroupDiv.innerHTML = '<span>+</span>';
    addGroupDiv.onclick = showGroupInput;
    groupsContainer.appendChild(addGroupDiv);
}

function renameGroup() {
    const groupNameElement = document.getElementById('group-detail-title');
    const currentGroupName = groupNameElement.textContent.trim();
    const newGroupName = prompt("Enter the new name for the group:");
    if (newGroupName && newGroupName !== currentGroupName) {
        // Check if the new group name already exists
        const existingGroup = data.groups.find(group => group.name === newGroupName);
        if (existingGroup) {
            alert('A group with this name already exists. Please choose a different name.');
            return;
        }

        const groupIndex = data.groups.findIndex(group => group.name === document.getElementById('group-detail-title').textContent);
        if (groupIndex !== -1) {
            data.groups[groupIndex].name = newGroupName;
            document.getElementById('group-detail-title').textContent = newGroupName;
            renderGroups();
            saveData();
        }
    }
}



// Initialize SortableJS
// Initialize SortableJS
const sortable = new Sortable(document.getElementById('group-container'), {
    animation: 150,
    filter: '.add-group',
    ghostClass: 'sortable-ghost',
    onMove: function (evt) {
        // Prevent moving the add-group button
        return !evt.related.classList.contains('add-group');
    },
    onEnd: function (evt) {
        const oldIndex = evt.oldIndex;
        const newIndex = evt.newIndex;

        // Reorder the data.groups array, ignoring the add-group button
        if (oldIndex < data.groups.length && newIndex < data.groups.length) {
            const movedItem = data.groups.splice(oldIndex, 1)[0];
            data.groups.splice(newIndex, 0, movedItem);

            // Save the new order
            saveData();
        }

        // Always re-render to ensure add-group button is at the end
        renderGroups();
    }
});



function showGroupDetail(index) {
    hideGroupInput(); // Ensure any other modal is hidden
    const group = data.groups[index];
    document.getElementById('group-detail-title').textContent = group.name;
    const modal = document.getElementById('group-detail-view');
    modal.style.display = 'flex'; // Display the modal
    modal.style.alignItems = 'center'; // Center vertically
    modal.style.justifyContent = 'center'; // Center horizontally
    renderHyperlinks(group.links, index);
}

function hideGroupDetail() {
    document.getElementById('group-detail-view').style.display = 'none';
}

function fetchWebsiteTitle(url, callback) {
    fetch('/fetch-title', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url })
    })
    .then(response => response.json())
    .then(data => {
        callback(data.title);
    })
    .catch(error => {
        console.error('Error fetching website title:', error);
        callback(null); // Handle error case
    });
}

function addHyperlink() {
    const linkUrl = prompt("Enter the hyperlink URL:");
    if (linkUrl) {
        fetchWebsiteTitle(linkUrl, title => {
            if (title) {
                const groupIndex = data.groups.findIndex(group => group.name === document.getElementById('group-detail-title').textContent);
                if (groupIndex !== -1) {
                    data.groups[groupIndex].links.push({ name: title, url: linkUrl });
                    renderHyperlinks(data.groups[groupIndex].links, groupIndex);
                    saveData();
                }
            } else {
                alert('Failed to fetch website title. Please check the URL or try again later.');
            }
        });
    }
}

function deleteHyperlink(groupIndex, linkIndex) {
    if (data.groups[groupIndex] && data.groups[groupIndex].links) {
        data.groups[groupIndex].links.splice(linkIndex, 1);
        renderHyperlinks(data.groups[groupIndex].links, groupIndex);
        saveData();
    }
}
function renderHyperlinks(links, groupIndex) {
    const hyperlinkContainer = document.getElementById('hyperlink-container');
    hyperlinkContainer.innerHTML = '';
    links.forEach((link, index) => {
        const linkButton = document.createElement('button');
        linkButton.classList.add('hyperlink-button');
        linkButton.textContent = link.name;
        linkButton.onclick = () => window.open(link.url, '_blank'); // Open link in a new tab

        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'X';
        deleteButton.onclick = () => deleteHyperlink(groupIndex, index);

        const linkDiv = document.createElement('div');
        linkDiv.classList.add('hyperlink');
        linkDiv.appendChild(linkButton);
        linkDiv.appendChild(deleteButton);

        hyperlinkContainer.appendChild(linkDiv);
    });

    // Initialize SortableJS for the hyperlink container
    new Sortable(hyperlinkContainer, {
        animation: 150,
        ghostClass: 'sortable-ghost', // Apply the ghost class to the dragged item
        onEnd: function (evt) {
            const oldIndex = evt.oldIndex;
            const newIndex = evt.newIndex;

            // Reorder the links array for the current group
            if (oldIndex < links.length && newIndex < links.length) {
                const movedItem = links.splice(oldIndex, 1)[0];
                links.splice(newIndex, 0, movedItem);

                // Save the new order
                saveData();
            }
        }
    });
}


function deleteGroup() {
    const groupIndex = data.groups.findIndex(group => group.name === document.getElementById('group-detail-title').textContent);
    if (groupIndex !== -1) {
        if (data.groups[groupIndex].links.length > 0) {
            const confirmation = confirm("This group contains hyperlinks. Are you sure you want to delete it?");
            if (!confirmation) {
                return;
            }
        }
        data.groups.splice(groupIndex, 1);
        renderGroups();
        hideGroupDetail();
        saveData();
    }
}

function extractAll() {
    const groupIndex = data.groups.findIndex(group => group.name === document.getElementById('group-detail-title').textContent);
    if (groupIndex !== -1) {
        data.groups[groupIndex].links.forEach(link => {
            const newTab = window.open(link.url, '_blank');
            if (newTab) {
                openedTabs.push(newTab);
            }
        });
    }
}

function closeTabs() {
    openedTabs.forEach(tab => {
        tab.close();
    });
    openedTabs = []; // Clear the list of opened tabs
}



function saveData() {
    fetch('/groups', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    }).then(response => {
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        return response.text();
    }).then(text => {
        console.log(text);
    }).catch(error => {
        console.error('There was a problem with your fetch operation:', error);
    });
}

function loadData() {
    fetch('/groups')
        .then(response => response.json())
        .then(jsonData => {
            jsonData.groups.forEach(group => {
                if (!Array.isArray(group.links)) {
                    group.links = [];
                }
            });
            data = jsonData;
            renderGroups();
        })
        .catch(error => {
            console.error('Error fetching data:', error);
        });
}

// Initialize the app
document.getElementById('group-name').addEventListener('keypress', handleKeyPress);
document.addEventListener('keydown', handleKeyPress);
document.addEventListener('click', handleModalClick);
loadData();
