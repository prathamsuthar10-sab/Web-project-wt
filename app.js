var fileInput = document.getElementById('json-file');
var plantList = document.getElementById('plant-list');
var message = document.getElementById('message');
var searchBox = document.getElementById('search');
var waterFilter = document.getElementById('water-filter');
var sortOrder = document.getElementById('sort-order');
var plants = [];

function daysUntilWater(plant) {
  var dateParts = plant.lastWatered.split('-');
  var lastWatered = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
  var currentDate = new Date();
  var today = new Date(currentDate.getFullYear(), currentDate.getMonth(), currentDate.getDate());
  var daysSinceWatering = Math.floor((today - lastWatered) / (1000 * 60 * 60 * 24));
  return Number(plant.waterEveryDays) - daysSinceWatering;
}

function makePlantCard(plant) {
  var card = document.createElement('article');
  var daysLeft = daysUntilWater(plant);
  var status = document.createElement('p');
  var details = document.createElement('details');
  var summary = document.createElement('summary');
  var light = document.createElement('p');
  var tip = document.createElement('p');

  card.className = 'plant-card';
  if (daysLeft <= 0) {
    card.classList.add('needs-water');
    if (daysLeft === 0) {
      status.textContent = 'Water today';
    } else {
      status.textContent = 'Overdue by ' + Math.abs(daysLeft) + ' day(s)';
    }
  } else {
    card.classList.add('on-schedule');
    status.textContent = 'Water in ' + daysLeft + ' day(s)';
  }
  status.className = 'water-status';

  var name = document.createElement('h3');
  name.textContent = plant.name;
  card.appendChild(name);

  var type = document.createElement('p');
  type.textContent = 'Plant type: ' + plant.type;
  card.appendChild(type);

  var room = document.createElement('p');
  room.textContent = 'Room: ' + plant.room;
  card.appendChild(room);

  var lastWatered = document.createElement('p');
  lastWatered.textContent = 'Last watered: ' + plant.lastWatered;
  card.appendChild(lastWatered);

  var schedule = document.createElement('p');
  schedule.textContent = 'Water every ' + plant.waterEveryDays + ' days';
  card.appendChild(schedule);
  card.appendChild(status);

  summary.textContent = 'Care details';
  light.textContent = 'Light: ' + plant.sunlight;
  tip.textContent = plant.careTip;
  details.appendChild(summary);
  details.appendChild(light);
  details.appendChild(tip);
  card.appendChild(details);

  return card;
}

function showPlants() {
  var searchText = searchBox.value.toLowerCase();
  var filterValue = waterFilter.value;
  var shownPlants = plants.filter(function (plant) {
    var matchesSearch = plant.name.toLowerCase().indexOf(searchText) !== -1 ||
      plant.type.toLowerCase().indexOf(searchText) !== -1 ||
      plant.room.toLowerCase().indexOf(searchText) !== -1;
    var needsWater = daysUntilWater(plant) <= 0;
    var matchesWater = filterValue === 'all' ||
      (filterValue === 'due' && needsWater) ||
      (filterValue === 'ok' && !needsWater);
    return matchesSearch && matchesWater;
  });

  if (sortOrder.value === 'name') {
    shownPlants.sort(function (a, b) { return a.name.localeCompare(b.name); });
  } else if (sortOrder.value === 'room') {
    shownPlants.sort(function (a, b) { return a.room.localeCompare(b.room); });
  } else {
    shownPlants.sort(function (a, b) { return daysUntilWater(a) - daysUntilWater(b); });
  }

  var dueCount = plants.filter(function (plant) {
    return daysUntilWater(plant) <= 0;
  }).length;
  document.getElementById('total-count').textContent = plants.length;
  document.getElementById('due-count').textContent = dueCount;
  document.getElementById('ok-count').textContent = plants.length - dueCount;
  plantList.innerHTML = '';

  for (var i = 0; i < shownPlants.length; i++) {
    plantList.appendChild(makePlantCard(shownPlants[i]));
  }

  if (shownPlants.length === 0) {
    message.textContent = 'No plants match these filters.';
  } else {
    message.textContent = 'Showing ' + shownPlants.length + ' of ' + plants.length + ' plants.';
  }
}

fileInput.addEventListener('change', function () {
  var file = fileInput.files[0];
  if (!file) return;

  var reader = new FileReader();
  reader.onload = function () {
    try {
      var plantData = JSON.parse(reader.result);
      var validList = Array.isArray(plantData) && plantData.every(function (plant) {
        return plant.name && plant.type && plant.room && plant.lastWatered &&
          Number(plant.waterEveryDays) > 0 && plant.sunlight && plant.careTip;
      });
      if (!validList) throw new Error('The plant data is incomplete.');

      plants = plantData;
      showPlants();
    } catch (error) {
      plants = [];
      plantList.innerHTML = '';
      message.textContent = 'Please choose a valid plant JSON file.';
    }
  };
  reader.readAsText(file);
});

searchBox.addEventListener('input', showPlants);
waterFilter.addEventListener('change', showPlants);
sortOrder.addEventListener('change', showPlants);