const fs  = require("fs");
const eol = require("os").EOL;

const plans_data = convertCSVtoJSON(fs.readFileSync("plans.csv", "utf8"));
const zips_data  = convertCSVtoJSON(fs.readFileSync("zips.csv", "utf8"));
solve("slcsp.csv");

// CSV to JSON parser
function convertCSVtoJSON(csv) {
  let result = [];
  const lines = csv.split(eol);
  const headers = lines[0].split(",");
  lines.shift();
  lines.map(function(currentLine) {
    let tempObj = {};
    let lineItems = currentLine.split(",");
    lineItems.map( function(current, idx) {
      tempObj[headers[idx]] = lineItems[idx];
    });
    result.push(tempObj);
  });
  return result;
}

// JSON to CSV converter, writes file
function convertJSONtoCSVfile(json, filename){
  const headers = Object.keys(json[0]);
  let lines = json.map(function(currentRow){
    return headers.map(function(currentItem){
      return currentRow[currentItem];
    }).join(",");
  }).join(eol);
  lines = headers.join(",") + eol + lines;
  fs.writeFileSync(filename, lines, "utf8");
}

// Func to find SLCSP
function findSLCSP(metal, state, rate_area) {
  if (!metal || !state || !rate_area) { return false }
  return plans_data.filter(function(elem, idx, arr) {
    return elem.metal_level === metal;
  }).filter(function(elem, idx, arr) {
    return elem.state === state;
  }).filter(function(elem, idx, arr) {
    return elem.rate_area === rate_area;
  }).sort(function (a,b) {
    return a.rate - b.rate;
  }).slice(1,2); // 2nd item == 2nd lowest
}

// Func to derive rate_area from zipcode
function findRateAreaFromZip(zipcode) {
  let item = zips_data.filter(function( elem) {
    return elem.zipcode == zipcode;
  })
  if(Object.keys(item).length > 1 || Object.keys(item).length == 0) {
    return false; 
  }
  if(Object.keys(item).length == 1) {
    return {state: item[0].state, rate_area: item[0].rate_area };
  }
}

// Main
function solve(filename) {
  const slcsp_data = convertCSVtoJSON(fs.readFileSync(filename, "utf8"));
  slcsp_data.map( function(curr, idx, arr) {
    let area_data = findRateAreaFromZip(curr.zipcode);
    if(area_data){
      try {
        curr.rate = findSLCSP("Silver", area_data.state, area_data.rate_area)[0].rate;
      } catch(e) {
        // console.log(e);
        // console.error("No SLCSP found for", curr.zipcode);
      }
    }
  });
  convertJSONtoCSVfile(slcsp_data, filename);
  console.log("Finished! Answers written into", filename);
}
