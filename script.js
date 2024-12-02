// constants instead of having to frequently repeat strings
const name_pointsPerRace = "points_per_race";
const name_TotalPoints = "total_points";

const sections_list = [name_pointsPerRace, name_TotalPoints];

/**
 * the color rotation for graphs
 */
const colors = [
  "#FF0000", // Red
  "#FFA500", // Orange
  "#FFFF00", // Yellow
  "#008000", // Green
  "#0000FF", // Blue
  "#4B0082", // Indigo
  "#8B00FF", // Violet
  "#FF1493", // Deep Pink
  "#FF00FF", // Magenta
  "#800080", // Purple
  "#FF4500", // Orange Red
  "#FF8C00", // Dark Orange
  "#FFD700", // Gold
  "#00FF00", // Lime
  "#00FFFF", // Cyan
  "#FFFFFF", // White
];

/**
 * read a csv file and turn it into an array
 */
function readAndParseCSV(year, mode) {
  return fetch("results/" + year + "-" + mode + ".csv")
    .then((response) => response.text())
    .then((array) => {
      const lines = array.split("\n");
      let result = [];
      lines.forEach((line) => {
        const row = line.split(",");
        result.push(row);
      });
      return result;
    })
    .catch((error) => {
      console.log("ERROR:", error);
      window.alert(
        "Something went wrong when trying to read the csv, check the console to see the error"
      );
    });
}

/**
 * Turn the array into floats, skips the text rows
 */
function parseFloats(array) {
  array.forEach((person, i) => {
    if (i === 0) {
      return;
    }
    person.forEach((score, j) => {
      if (j === 0) {
      } else {
        // if score is empty it returns null, if its not empty it either returns score as float or the score if score is NaN
        array[i][j] = score
          ? isNaN(parseFloat(score))
            ? score
            : parseFloat(score)
          : null;
      }
    });
  });

  return array;
}

/**
 * transpose array of array so that x becomes y and y becomes x
 */
function transposeData(array) {
  const arrayRotated = [];
  const arrayLen = array[0].length;

  for (let i = 0; i < arrayLen; i++) {
    const tempArray = [];
    array.forEach((_, j) => {
      tempArray.push(array[j][i]);
    });
    arrayRotated.push(tempArray);
  }

  return arrayRotated;
}

/**
 * Get the median of an array
 */
function calcGetMedian(array) {
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
function calcAggregateStats(array) {
  let retArray = array.map((person) => person.slice());

  retArray.forEach((person, i) => {
    if (i === 0) {
      retArray[i].push("Average");
      retArray[i].push("Median");
    } else {
      person = person.slice(1);

      let sum = 0;
      let length = person.length;
      person.forEach((score, _) => {
        sum += score;
      });

      retArray[i].push((sum / length).toFixed(1));
      retArray[i].push(calcGetMedian(person).toFixed(1));
    }
  });

  return retArray;
}

/**
 * creates an array with the total points of each person
 */
function calcTotalPoints(array) {
  let retArray = [];

  array.forEach((person, i) => {
    let tempArray = [];
    if (i === 0) {
      tempArray = person;
    } else {
      person.forEach((score, j) => {
        if (j === 0 || j === 1) {
          tempArray.push(score);
        } else {
          tempArray.push(score + tempArray[j - 1]);
        }
      });
    }
    retArray.push(tempArray);
  });

  return retArray;
}

/**
 * create a html table
 */
function createHTMLTable(section) {
  let table = document.getElementById(section + "_table");

  let dataName = section;
  if (section === name_pointsPerRace) {
    dataName += "_agg";
  }
  if (window["rotate_" + section]) {
    dataName += "_trans";
    table.className = "down";
  } else {
    table.className = "right";
  }
  let data = window.data[dataName];

  table.innerHTML = "";

  data.forEach((row, i) => {
    const htmlRow = table.insertRow(i);
    row.forEach((cell, j) => {
      const htmlCell = htmlRow.insertCell(j);
      htmlCell.innerHTML = cell;
    });
  });

  table.rows[0].cells[0].innerHTML =
    '<i onclick=rotateTable("' +
    section +
    '") class="fa-solid fa-arrows-rotate"></i>';
}

/**
 * Changes the display between showing a table and showing a graph
 */
function switchDisplay(section) {
  let selectedDisplay = document.querySelector(
    "#" + section + "_radiogroup input:checked"
  ).value;

  let table = document.getElementById(section + "_table");
  let canvas = document.getElementById(section + "_graph");
  let h2h = document.getElementById(section + "_h2h_table");

  if (selectedDisplay === "table") {
    table.style.display = "table";
    canvas.style.display = "none";
    if (h2h) {
      h2h.style.display = "none";
    }
  } else if (selectedDisplay === "graph") {
    table.style.display = "none";
    canvas.style.display = "block";
    if (h2h) {
      h2h.style.display = "none";
    }
  } else if (selectedDisplay === "h2h") {
    table.style.display = "none";
    canvas.style.display = "none";
    h2h.style.display = "block";
  }
}

/**
 * Rotates a given table
 */
function rotateTable(section) {
  window["rotate_" + section] = !window["rotate_" + section];
  createHTMLTable(section);
}

/**
 * plot a given dataset into a line graph
 */
function plotData(section) {
  const ctx = document.getElementById(section + "_graph");

  try {
    const chart = Chart.getChart(section + "_graph");
    chart.destroy();
  } catch {}

  let data = window.data[section];

  const xValues = data[0].slice(1);
  const datasetValue = [];
  data = data.slice(1);

  data.forEach((person, i) => {
    const name = person[0];
    person = person.slice(1);
    datasetValue.push({
      label: name,
      data: person,
      fill: false,
      borderColor: colors[i],
      backgroundColor: colors[i],
    });
  });

  new Chart(ctx, {
    type: "line",
    defaults: {
      color: "#ffffff",
      borderColor: "#2b2b33",
    },
    data: {
      labels: xValues,
      datasets: datasetValue,
    },
    options: {
      scales: {
        y: {
          min: 0,
        },
      },
      layout: {
        padding: 10,
      },
    },
  });
}

/*
 * reset the displays after switching year
 */
function setDisplayAfterYearChange() {
  sections_list.forEach((section, _) => {
    let switchButton = document.getElementById("switch_" + section);
    let table = document.getElementById(section + "_table");

    if (switchButton) {
      switchButton.className = "fa-solid fa-table";
      switchButton.onclick = function () {
        switchDisplay(section, "table");
      };
      table.style.display = "none";
    }
  });
}

/**
 * show the graphs and tables for a given year and mode of data
 */
function showYear(year, mode) {
  data = readAndParseCSV(year, mode).then((data) => {
    window.data[name_pointsPerRace] = parseFloats(data);

    window.data[name_TotalPoints] = calcTotalPoints(
      window.data[name_pointsPerRace]
    );
    window.data["total_points_trans"] = transposeData(
      window.data[name_TotalPoints]
    );

    window.data["points_per_race_agg"] = calcAggregateStats(
      window.data[name_pointsPerRace]
    );
    window.data["points_per_race_agg_trans"] = transposeData(
      window.data["points_per_race_agg"]
    );

    plotData(name_pointsPerRace);
    createHTMLTable(name_pointsPerRace);

    plotData(name_TotalPoints);
    createHTMLTable(name_TotalPoints);

    setDisplayAfterYearChange();
  });
}

window.data = {};
window.rotate_points_per_race = true;
window.rotate_total_points = true;

showYear(2024, "normal");

switchDisplay("points_per_race");
switchDisplay("total_points");
