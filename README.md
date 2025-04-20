# Naukri Skills Filter with Full Search Capability

This repository contains a JavaScript-based browser automation script designed to filter job postings on the Naukri.com website based on specific skills, ratings, and other criteria. The script also includes a multi-page search feature to collect matching jobs across multiple pages and export the results as a CSV file.

---

## Features

### Core Features:
- **Skill-Based Filtering**: Filters jobs based on required skills (case-insensitive).
- **Rating-Based Filtering**: Filters jobs based on a minimum rating threshold.
- **Include/Exclude Unrated Jobs**: Option to include or exclude jobs with no ratings.
- **Skill Matching in Descriptions**: Searches for required skills in both job titles and descriptions.
- **Highlight Matching Jobs**: Highlights matching jobs with a customizable color.
- **Hide Non-Matching Jobs**: Option to hide jobs that do not match the filter criteria.

### Advanced Features:
- **Multi-Page Search**: Automatically navigates through multiple pages to collect matching jobs.
- **Progress Tracking**: Displays a progress bar and updates the total number of jobs collected during the search.
- **Export to CSV**: Exports the filtered job data to a CSV file for easy analysis.
- **Dynamic Control Panel**: A floating control panel on the webpage allows you to configure filters and start searches.

---

## Installation

1. Clone this repository or download the script file.
2. Open your browser and navigate to [Naukri.com](https://www.naukri.com).
3. Open the browser's developer tools (press `F12` or `Ctrl+Shift+I`).
4. Go to the **Console** tab.
5. Copy and paste the script into the console and press `Enter`.

---

## Usage

### Control Panel
Once the script is loaded, a floating control panel will appear in the top-right corner of the webpage. The control panel includes the following options:

1. **Required Skills**: Enter a comma-separated list of skills to filter jobs.
2. **Min Rating**: Set the minimum rating for jobs to be included in the results.
3. **Include Jobs with No Rating**: Toggle to include or exclude unrated jobs.
4. **Max Pages to Search**: Set the maximum number of pages to search.
5. **Hide Non-Matching Jobs**: Toggle to hide or show jobs that do not match the filter criteria.
6. **Buttons**:
   - **Apply Filter**: Apply the current filter settings to the visible jobs.
   - **Export CSV**: Export the filtered jobs from the current page to a CSV file.
   - **Search Full**: Start a multi-page search to collect matching jobs across multiple pages.

### Console Commands
You can also control the script via the browser console:
- **Start a full search**:
  ```javascript
  naukriFilter.startFullSearch();
  ```
- **Update filter settings**:
  ```javascript
  naukriFilter.updateConfig({
    requiredSkills: ['javascript', 'react'],
    minRating: 4.0,
    includeUnratedJobs: true,
    maxPagesToSearch: 20
  });
  ```
- **Export matching jobs from the current page**:
  ```javascript
  naukriFilter.exportCSV();
  ```

---

## How It Works

1. **Filtering Jobs**:
   - The script scans all job cards on the page and extracts details such as job title, company name, rating, skills, and description.
   - It matches jobs against the specified filters and highlights or hides them based on the configuration.

2. **Multi-Page Search**:
   - The script navigates through multiple pages using the "Next" button.
   - It collects matching jobs from each page and updates the progress bar and total jobs collected display.

3. **Exporting Results**:
   - The script compiles the collected job data into a CSV file with all relevant fields.
   - The CSV file is automatically downloaded when the search is complete.

---

## Configuration

The script uses a configuration object to manage filter settings. You can customize the following options:

```javascript
const config = {
  requiredSkills: ["aws", "linux"], // Skills to filter jobs
  minRating: 3.5,                  // Minimum rating for jobs
  highlightColor: "#e6f7ff",       // Highlight color for matching jobs
  hideMismatches: true,            // Hide non-matching jobs
  exportFilename: "filtered_jobs.csv", // Filename for exported CSV
  includeUnratedJobs: true,        // Include jobs with no rating
  maxPagesToSearch: 50,            // Maximum number of pages to search
  searchDelay: 3000,               // Delay between page transitions (ms)
  collectedJobs: []                // Array to store collected jobs
};
```

---

## Known Issues

1. **Dynamic Pagination**:
   - If the pagination structure on the website changes, the script may fail to navigate pages correctly. Update the `getCurrentPage` and `goToNextPage` functions as needed.

2. **Dynamic Content Loading**:
   - If the website uses dynamic content loading, the script may need additional delays or mutation observers to handle updates.

3. **Selectors**:
   - Ensure that the CSS selectors used in the script match the current structure of the Naukri.com website.

---

## Contributing

Contributions are welcome! If you encounter any issues or have suggestions for improvements, feel free to open an issue or submit a pull request.

---

## License

This project is licensed under the MIT License. See the LICENSE file for details.

---

## Disclaimer

This script is intended for educational purposes only. Use it responsibly and ensure compliance with the terms of service of Naukri.com. The author is not responsible for any misuse of this script.