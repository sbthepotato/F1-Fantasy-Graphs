$(document).ready(function() {
  console.log('hehe xd');
});

function showYear(year, mode) {
  fetch('results/'+year+'-'+mode+'.csv')
  .then(response => response.text())
  .then(data => {
    // Process the CSV data
    console.log(data);
  })
  .catch(error => {
    console.log('Error:', error);
  });
}