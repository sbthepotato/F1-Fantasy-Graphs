$(document).ready(function() {
  showYear(2022, 'normal');
});


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
  '#FFFFFF'   // White
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
 * Turn the data into floats, skips the text rows
 */
function parseFloats(data) {
  data.forEach((person, i) => {
    if (i == 0) {
      return;
    }
    person.forEach((score, j) => {
      if (j === 0) {
      } else {
        // if score is empty it returns null, if its not empty it either returns score as float or the score if score is NaN
        data[i][j] = score ? (isNaN(parseFloat(score)) ? score : parseFloat(score)) : null;
      }
    });
  });
}


/**
* transpose array of array so that x becomes y and y becomes x
*/
function transposeData(data) {
  const dataRotated = [];
  const dataLen = data[0].length;

  for (let i = 0; i < dataLen; i++) {
    const tempArray = [];
    data.forEach((_, j) => {
      tempArray.push(data[j][i]);
    });
    dataRotated.push(tempArray);
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
  data.forEach((person, i) => {
    if (i == 0) {
      data[i].push('Average');
      data[i].push('Median');
    } else {
      person = person.slice(1);

      let sum = 0;
      let length = person.length;
      person.forEach((score, _) => {
        sum += score;
      });

      data[i].push((sum / length).toFixed(1));
      data[i].push(getMedian(person).toFixed(1));
    }
  });

  return data;
}


/**
* creates an array with the total points of each person 
*/
function totalPoints(data) {
  dataTotals = [];

  data.forEach((person, i) => {
    let tempArray = [];
    if (i == 0) {
      tempArray = person;
    } else {
      person.forEach((score, j) => {
        if (j == 0 || j == 1) {
          tempArray.push(score);
        } else {
          tempArray.push(score + tempArray[j - 1]);
        }
      });
    }
    dataTotals.push(tempArray);
  });

  return dataTotals;
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

  table.rows[0].cells[0].innerHTML = '<i class="fa-solid fa-arrows-rotate"></i>';
}


/**
 * Changes the display between showing a table and showing a graph
 */
function switchDisplay(section, newSet) {
  switchButton = document.getElementById('switch-' + section);
  table = document.getElementById(section+'-table');
  canvas = document.getElementById(section+'-graph');

  if (newSet === 'table'){
    switchButton.className = 'fa-solid fa-chart-line';
    switchButton.onclick = function(){switchDisplay(section, 'graph')};
    table.style.display = 'block';
    canvas.style.display = 'none';
  } else {
    switchButton.className = 'fa-solid fa-table';
    switchButton.onclick = function(){switchDisplay(section, 'table')};
    table.style.display = 'none';
    canvas.style.display = 'block';
  }
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
  const datasetValue = [];
  data = data.slice(1);

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
      parseFloats(data);

      plotData(data, 'points-per-race-graph');

      dataTotals = totalPoints(data);
      dataTotals = transposeData(dataTotals);
      createHTMLTable(dataTotals, 'total-points-table');

      dataTotals = transposeData(dataTotals);
      plotData(dataTotals, 'total-points-graph');

      data = aggregateStats(data);
      data = transposeData(data);
      createHTMLTable(data, 'points-per-race-table');

    });
}
