$(document).ready(function () {
  console.log('hehe xd');
});


const colors = [
  '#FF0000',  // Red
  '#FFA500',  // Orange
  '#FFFF00',  // Yellow
  '#008000',  // Green
  '#0000FF',  // Blue
  '#4B0082',  // Indigo
  '#8B00FF',  // Violet
  '#FF1493',  // Deep Pink
  '#FF00FF',  // Magenta
  '#800080',  // Purple
  '#FF4500',  // Orange Red
  '#FF8C00',  // Dark Orange
  '#FFD700',  // Gold
  '#00FF00',  // Lime
  '#00FFFF',  // Cyan
  '#000080'   // Navy
];


const options = {
  scales: {
    y: {
        min: 0
    }
  }
};


function readAndParseCSV(year, mode) {
  return fetch('results/' + year + '-' + mode + '.csv')
    .then(response => response.text())
    .then(data => {
      const lines = data.split('\n');
      let result = [];
      lines.forEach((line) => {
        const row = line.split(',');
        result.push(row);
      });
      return result;
    })
    .catch(error => {
      console.log('ERROR:', error);
    });
}


function createOverviewTable(data) {
  let table = document.getElementById('overview-table');
  table.innerHTML = '';

  data.forEach((row, i) => {
    const htmlRow = table.insertRow(i);
    row.forEach((cell, j) => {
      const htmlCell = htmlRow.insertCell(j);
      htmlCell.innerHTML = cell;
    });
  });
}


function rotateData(data) {
  const dataRotated = [];
  const dataLen = data[0].length;

  for (let i = 0; i < dataLen; i++) {
    const newArray = [];
    data.forEach((_, j) => {
      newArray.push(data[j][i]);
    });
    dataRotated.push(newArray);
  }
  return dataRotated;
}


function plotPointsPerRace(data) {
  try {
    const chart = Chart.getChart("pointsPerRace");
    chart.destroy();
  } catch {

  }

  const xValues = data[0].slice(1);
  const datasetValue = []
  data = data.slice(1)

  data.forEach((person, i) => {
    const name = person[0]
    person = person.slice(1)
    datasetValue.push({
      label: name,
      data: person,
      fill: false,
      borderColor: colors[i],
      backgroundColor: colors[i]
    })
  });

  chart = new Chart("pointsPerRace", {
    type: "line",
    data: {
      labels: xValues,
      datasets: datasetValue
    },
    options: options
  });
}


function showYear(year, mode) {
  data = readAndParseCSV(year, mode)
    .then(data => {
      createOverviewTable(data);

      data = rotateData(data);

      plotPointsPerRace(data);

    });
}
