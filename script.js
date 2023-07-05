
/**
* the color rotation for graphs
*/
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


/**
* read a csv file and turn it into an array
*/
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


/**
* create a html table
*/
function createHTMLTable(data, tableName) {
  let table = document.getElementById(tableName);
  table.innerHTML = '';

  data.forEach((row, i) => {
    const htmlRow = table.insertRow(i);
    row.forEach((cell, j) => {
      const htmlCell = htmlRow.insertCell(j);
      htmlCell.innerHTML = cell;
    });
  });
}


/**
* rotate array of array so that x becomes y and y becomes x
*/
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


/**
* Get the median of an array
*/
function getMedian(array) {
  const sortedArray = array.sort((a, b) => a - b);

  const middleIndex = Math.floor(sortedArray.length / 2);

  if (sortedArray.length % 2 === 1) {
    return sortedArray[middleIndex];
  } else {
    return (sortedArray[middleIndex - 1] + sortedArray[middleIndex]) / 2;
  }
}


/**
* give the average and median of a persons results
*/
function aggregateStats(data) {
  aggregateData = [];

  data.forEach((person, i) => {
    aggregateData.push(person[0]);

    person.slice(1);

    let sum = 0;
    let length = person.length;
    person.forEach((score, _) => {
      sum += score;
    });

    aggregateData.push(sum / length);
    aggregateData.push(getMedian(person));
  });

}


/**
* plot a given dataset into a line graph
*/
function plotData(data, plotName) {
  try {
    const chart = Chart.getChart(plotName);
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

  chart = new Chart(plotName, {
    type: "line",
    data: {
      labels: xValues,
      datasets: datasetValue
    },
    options: {
      scales: {
        y: {
          min: 0
        }
      }
    }
  });
}


/**
* show the graphs and tables for a given year and mode of data
*/
function showYear(year, mode) {
  data = readAndParseCSV(year, mode)
    .then(data => {
      createHTMLTable(data, 'overview-table');

      data = rotateData(data);

      plotData(data, 'pointsPerRace');

      aggData = aggregateStats(data);

      

    });
}
