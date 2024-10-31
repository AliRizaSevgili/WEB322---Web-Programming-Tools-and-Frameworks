/*********************************************************************************
*  WEB322 – Assignment 1
*  I declare that this assignment is my own work in accordance with Seneca Academic Policy.  
*  No part of this assignment has been copied manually or electronically from any other source
*  (including web sites, GPT) or distributed to other students.
* 
*  Name: Ali Riza Sevgili
*  Student ID: 135200228
*  Date: 09/04/2024
*
********************************************************************************/

const readline = require('readline');
const fs = require('fs');

// Create a readline interface to accept user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Ask the user if they want to process a file or a directory
rl.question('Do you wish to process a File (f) or directory (d): ', function(input) {
  if (input === 'f') {
    // If the user selects 'f', ask for the file name
    rl.question('File: ', function(fileName) {
      processFile(fileName);  // Call the processFile function
      rl.close();  // Close the readline interface
    });
  } else if (input === 'd') {
    // If the user selects 'd', ask for the directory name
    rl.question('Directory: ', function(dirName) {
      processDirectory(dirName);  // Call the processDirectory function
      rl.close();  // Close the readline interface
    });
  } else {
    // If the user makes an invalid selection
    console.log('Invalid Selection');
    rl.close();  // Close the readline interface
  }
});

// Call-back Function to process a file
function processFile(fileName) {
  fs.readFile(fileName, 'utf8', (err, data) => {
    if (err) {
      // If there's an error reading the file, print the error message
      console.log(`Error reading file: ${err.message}`);
    } else {
      // Count the number of lines
      const lines = data.split('\n').length;
      // Count the number of words
      const words = data.split(/\s+/).length;
      // Count the number of characters
      const characters = data.length;

      // Calculate the frequency of each letter
      let letterFrequency = {};
      for (let char of data.toLowerCase()) {
        if (/[a-z]/.test(char)) {
          letterFrequency[char] = (letterFrequency[char] || 0) + 1;
        }
      }

      // Print the results to the console
      console.log(`File: ${fileName}`);
      console.log(`Lines: ${lines}`);
      console.log(`Words: ${words}`);
      console.log(`Characters: ${characters}`);
      console.log('Letter Frequency: ', letterFrequency);
    }
  });
}

// Call-Back Function to process a directory
function processDirectory(dirName) {
  fs.readdir(dirName, (err, files) => {
    if (err) {
      // If there's an error reading the directory, print the error message
      console.log(`Error reading directory: ${err.message}`);
    } else {
      // Filter and select only .txt files
      const txtFiles = files.filter(file => file.endsWith('.txt'));
      let totalSize = 0;

      // Process each .txt file
      txtFiles.forEach(file => {
        const filePath = `${dirName}/${file}`;  // Construct the full file path
        const stats = fs.statSync(filePath);  // Get file statistics
        totalSize += stats.size;  // Add the file size to the total
        processFile(filePath);    // Call processFile to process the file
      });

      // Print the total number of files and their cumulative size
      console.log(`Total Files: ${txtFiles.length}`);
      console.log(`Cumulative Size: ${totalSize} bytes`);
    }
  });
}
