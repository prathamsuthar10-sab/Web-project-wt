var fileInput = document.getElementById('json-file');
var plantList = document.getElementById('plant-list');
var message = document.getElementById('message');

fileInput.addEventListener('change', function () {
  var file = fileInput.files[0];
  if (!file) return;

  var reader = new FileReader();

  reader.onload = function () {
    try {
      var plants = JSON.parse(reader.result);
      if (!Array.isArray(plants)) throw new Error('The JSON must contain a list of plants.');
      plantList.innerHTML = '';

      for (var i = 0; i < plants.length; i++) {
        var plant = plants[i];
        var card = document.createElement('div');
        card.className = 'plant-card';

        var name = document.createElement('h3');
        name.textContent = plant.name;
        card.appendChild(name);

        var type = document.createElement('p');
        type.textContent = 'Plant type: ' + plant.type;
        card.appendChild(type);

        var room = document.createElement('p');
        room.textContent = 'Location: ' + plant.room;
        card.appendChild(room);

        var watered = document.createElement('p');
        watered.textContent = 'Last watered: ' + plant.lastWatered;
        card.appendChild(watered);

        var schedule = document.createElement('p');
        schedule.textContent = 'Water every ' + plant.waterEveryDays + ' days';
        card.appendChild(schedule);

        plantList.appendChild(card);
      }

      message.textContent = 'Showing ' + plants.length + ' plants from ' + file.name + '.';
    } catch (error) {
      message.textContent = 'Please choose a valid plant JSON file.';
    }
  };

  reader.readAsText(file);
});
