/**
 * Naukri Job Skills Filter with Full Search Capability
 * 
 * Enhanced version that adds multi-page search functionality
 * and compiles matching jobs across pages into a single file.
 */

// Main function to initialize the filter with full search capability
function naukriSkillsFilter() {
  // Configuration object - adjust these values
  const config = {
    requiredSkills: ["aws", "linux"],
    minRating: 3.5,
    highlightColor: "#e6f7ff",
    hideMismatches: true,  // Set to false to show all jobs but highlight matches
    exportFilename: "filtered_jobs.csv",
    includeUnratedJobs: true,
    maxPagesToSearch: 50,  // Maximum number of pages to search
    searchDelay: 3000,     // Delay between page transitions in ms
    collectedJobs: []
  };
  
  // Job counter
  let matchingJobs = 0;
  let totalJobs = 0;
  let isSearching = false;
  let currentPage = 1;
  let maxPages = 1;
  
  // Create floating control panel
  const createControlPanel = () => {
    // Remove any existing panel
    const existingPanel = document.getElementById('skills-filter-panel');
    if (existingPanel) existingPanel.remove();
    
    const panel = document.createElement('div');
    panel.id = 'skills-filter-panel';
    panel.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: white;
      border: 1px solid #ccc;
      border-radius: 8px;
      padding: 15px;
      z-index: 10000;
      box-shadow: 0 4px 8px rgba(0,0,0,0.1);
      width: 300px;
      font-family: Arial, sans-serif;
    `;
    
    // Create panel header
    const header = document.createElement('div');
    header.innerHTML = `<h3 style="margin-top: 0; margin-bottom: 10px;">Naukri Skills Filter</h3>`;
    panel.appendChild(header);
    
    // Create skills input
    const skillsInput = document.createElement('div');
    skillsInput.style.cssText = 'margin-bottom: 10px;';
    skillsInput.innerHTML = `
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Required Skills (comma separated):</label>
      <input type="text" id="skills-input" style="width: 100%; padding: 5px; box-sizing: border-box;" 
             value="${config.requiredSkills.join(', ')}">
    `;
    panel.appendChild(skillsInput);
    
    // Create min rating input
    const ratingInput = document.createElement('div');
    ratingInput.style.cssText = 'margin-bottom: 10px;';
    ratingInput.innerHTML = `
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Min Rating:</label>
      <input type="number" id="rating-input" style="width: 100%; padding: 5px; box-sizing: border-box;" 
             value="${config.minRating}" min="0" max="5" step="0.1">
    `;
    panel.appendChild(ratingInput);
    
    // Create include unrated jobs toggle
    const unratedToggle = document.createElement('div');
    unratedToggle.style.cssText = 'margin-bottom: 10px;';
    unratedToggle.innerHTML = `
      <label style="display: flex; align-items: center;">
        <input type="checkbox" id="include-unrated" ${config.includeUnratedJobs ? 'checked' : ''}>
        <span style="margin-left: 5px;">Include jobs with no rating</span>
      </label>
    `;
    panel.appendChild(unratedToggle);
    
    
    // Create max pages to search input
    const pagesInput = document.createElement('div');
    pagesInput.style.cssText = 'margin-bottom: 10px;';
    pagesInput.innerHTML = `
      <label style="display: block; margin-bottom: 5px; font-weight: bold;">Max Pages to Search:</label>
      <input type="number" id="max-pages-input" style="width: 100%; padding: 5px; box-sizing: border-box;" 
             value="${config.maxPagesToSearch}" min="1" max="100">
    `;
    panel.appendChild(pagesInput);
    
    // Create visibility toggle
    const visibilityToggle = document.createElement('div');
    visibilityToggle.style.cssText = 'margin-bottom: 15px;';
    visibilityToggle.innerHTML = `
      <label style="display: flex; align-items: center;">
        <input type="checkbox" id="hide-mismatches" ${config.hideMismatches ? 'checked' : ''}>
        <span style="margin-left: 5px;">Hide non-matching jobs</span>
      </label>
    `;
    panel.appendChild(visibilityToggle);
    
    // Create button container
    const buttonContainer = document.createElement('div');
    buttonContainer.style.display = 'flex';
    buttonContainer.style.marginBottom = '10px';
    
    // Create apply button
    const applyButton = document.createElement('button');
    applyButton.textContent = 'Apply Filter';
    applyButton.style.cssText = `
      background: #ff5722;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      margin-right: 10px;
      flex: 1;
    `;
    applyButton.onclick = () => {
      updateConfigFromInputs();
      filterJobs();
    };
    
    // Create export button
    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export CSV';
    exportButton.style.cssText = `
      background: #4caf50;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      flex: 1;
    `;
    exportButton.onclick = exportMatchingJobs;
    
    buttonContainer.appendChild(applyButton);
    buttonContainer.appendChild(exportButton);
    panel.appendChild(buttonContainer);
    
    // Create full search button
    const fullSearchButton = document.createElement('button');
    fullSearchButton.id = 'full-search-button';
    fullSearchButton.textContent = 'Search Full';
    fullSearchButton.style.cssText = `
      background: #2196F3;
      color: white;
      border: none;
      padding: 8px 15px;
      border-radius: 4px;
      cursor: pointer;
      width: 100%;
      margin-bottom: 10px;
    `;
    fullSearchButton.onclick = startFullSearch;
    panel.appendChild(fullSearchButton);
    
    // Create progress bar container (initially hidden)
    const progressContainer = document.createElement('div');
    progressContainer.id = 'search-progress-container';
    progressContainer.style.cssText = 'display: none; margin-bottom: 10px;';
    
    const progressBar = document.createElement('div');
    progressBar.id = 'search-progress-bar';
    progressBar.style.cssText = `
      height: 20px;
      background-color: #e0e0e0;
      border-radius: 4px;
      overflow: hidden;
      margin-bottom: 5px;
    `;
    
    const progressFill = document.createElement('div');
    progressFill.id = 'search-progress-fill';
    progressFill.style.cssText = `
      height: 100%;
      width: 0%;
      background-color: #2196F3;
      transition: width 0.3s ease;
    `;
    
    const progressText = document.createElement('div');
    progressText.id = 'search-progress-text';
    progressText.style.cssText = 'font-size: 12px; text-align: center;';
    progressText.textContent = 'Searching page 0 of 0...';
    
    progressBar.appendChild(progressFill);
    progressContainer.appendChild(progressBar);
    progressContainer.appendChild(progressText);
    panel.appendChild(progressContainer);
    
    // Add total jobs collected display
    const totalJobsCollectedDisplay = document.createElement('div');
    totalJobsCollectedDisplay.id = 'total-jobs-collected';
    totalJobsCollectedDisplay.style.cssText = `
      margin-top: 10px;
      font-size: 14px;
      font-weight: bold;
      text-align: center;
    `;
    totalJobsCollectedDisplay.textContent = 'Total Jobs Collected: 0';
    panel.appendChild(totalJobsCollectedDisplay);
    
    // Stats display
    const statsDisplay = document.createElement('div');
    statsDisplay.id = 'filter-stats';
    statsDisplay.style.cssText = 'margin-top: 10px; font-size: 12px;';
    panel.appendChild(statsDisplay);
    
    document.body.appendChild(panel);
  };
  
  // Update config from input fields
  const updateConfigFromInputs = () => {
    config.requiredSkills = document.getElementById('skills-input').value
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    config.minRating = parseFloat(document.getElementById('rating-input').value) || 0;
    config.includeUnratedJobs = document.getElementById('include-unrated').checked;
    config.hideMismatches = document.getElementById('hide-mismatches').checked;
    config.maxPagesToSearch = parseInt(document.getElementById('max-pages-input').value) || 50;
  };
  
  // Helper function to parse date text (e.g., '3 Days Ago')
  const parsePostedDate = (dateText) => {
    const today = new Date();
    
    if (!dateText || dateText === 'N/A') {
      return null;
    }
    
    if (dateText.includes("Just Now") || dateText.includes("Few Hours Ago")) {
      return today;
    }
    
    const match = dateText.match(/(\d+)\s+(Day|Days|Month|Months)\s+Ago/i);
    if (match) {
      const num = parseInt(match[1]);
      const unit = match[2].toLowerCase();
      
      if (unit === "day" || unit === "days") {
        const result = new Date(today);
        result.setDate(today.getDate() - num);
        return result;
      } else if (unit === "month" || unit === "months") {
        const result = new Date(today);
        result.setMonth(today.getMonth() - num);
        return result;
      }
    }
    
    return null;
  };
  
  // Extract job details from a single job card
  const extractJobDetails = (jobCard) => {
    try {
      // Job ID
      const jobId = jobCard.getAttribute('data-job-id') || 'N/A';
      
      // Job Title
      const titleElement = jobCard.querySelector('.title');
      const jobTitle = titleElement ? titleElement.textContent.trim() : 'N/A';
      const jobLink = titleElement ? titleElement.getAttribute('href') : 'N/A';
      
      // Company Name
      const companyElement = jobCard.querySelector('.comp-name');
      const companyName = companyElement ? companyElement.textContent.trim() : 'N/A';
      
      // Rating
      const ratingElement = jobCard.querySelector('.rating .main-2');
      const ratingText = ratingElement ? ratingElement.textContent.trim() : 'N/A';
      const rating = ratingText !== 'N/A' ? parseFloat(ratingText) : null; // Changed to null to identify unrated
      
      // Experience
      const expElement = jobCard.querySelector('.exp-wrap .expwdth');
      const experience = expElement ? expElement.textContent.trim() : 'N/A';
      
      // Salary
      const salaryElement = jobCard.querySelector('.sal-wrap span[title]');
      const salary = salaryElement ? salaryElement.getAttribute('title') : 'N/A';
      
      // Location
      const locationElement = jobCard.querySelector('.loc-wrap .locWdth');
      const location = locationElement ? locationElement.textContent.trim() : 'N/A';
      
      // Skills/Technologies
      const skillsElements = jobCard.querySelectorAll('.tags-gt .tag-li');
      const skills = Array.from(skillsElements).map(el => el.textContent.trim());
      
      // Also check job description for additional skills
      const descElement = jobCard.querySelector('.job-desc');
      const description = descElement ? descElement.textContent.trim() : '';
      
      // Posted Date
      const dateElement = jobCard.querySelector('.job-post-day');
      const postedDateText = dateElement ? dateElement.textContent.trim() : 'N/A';
      const postedDate = parsePostedDate(postedDateText);
      
      // Creating a combined text of skills and description for better skill matching
      const combinedText = (description.toLowerCase() + ' ' + skills.join(' ').toLowerCase());
      
      return {
        element: jobCard,
        jobId,
        jobTitle,
        jobLink,
        companyName,
        rating,
        experience,
        salary,
        location,
        skills,
        postedDateText,
        postedDate,
        description,
        combinedText
      };
    } catch (error) {
      console.error("Error extracting job details:", error);
      return null;
    }
  };
  
  // Check if all required skills are found in the job (case-insensitive)
  const hasAllRequiredSkills = (job, requiredSkills) => {
    if (!requiredSkills || requiredSkills.length === 0) {
      return true;
    }
    
    const combinedText = job.combinedText;
    
    // Check if all required skills are present in the combined text
    return requiredSkills.every(requiredSkill => {
      const requiredSkillLower = requiredSkill.toLowerCase().trim();
      return combinedText.includes(requiredSkillLower);
    });
  };
  
  // Match job against filters
  const matchesFilters = (job) => {
    if (config.minRating > 0 && job.rating !== null && job.rating < config.minRating) {
      return false;
    }
    
    if (config.minRating > 0 && job.rating === null && !config.includeUnratedJobs) {
      return false;
    }
    
    return hasAllRequiredSkills(job, config.requiredSkills);
  };
  
  // Apply filtering to all job cards
  const filterJobs = () => {
    totalJobs = 0;
    matchingJobs = 0;
    const matchingJobsData = [];
    
    // Get all job cards
    const jobCards = document.querySelectorAll('.srp-jobtuple-wrapper');
    
    jobCards.forEach(card => {
      totalJobs++;
      const jobDetails = extractJobDetails(card);
      
      if (jobDetails) {
        const matches = matchesFilters(jobDetails);
        
        if (matches) {
          matchingJobs++;
          matchingJobsData.push(jobDetails);
          
          // Highlight matching job card
          card.style.backgroundColor = config.highlightColor;
          card.style.boxShadow = '0 0 8px rgba(0,0,0,0.2)';
          card.style.borderRadius = '8px';
          card.style.position = 'relative';
          
          // Add matching skills indicator
          const matchingSkillsCount = config.requiredSkills.length;
          
          let indicator = card.querySelector('.matching-skills-indicator');
          if (indicator) {
            indicator.textContent = `Matched ${matchingSkillsCount} skills`;
          } else {
            indicator = document.createElement('div');
            indicator.className = 'matching-skills-indicator';
            indicator.style.cssText = `
              position: absolute;
              top: 10px;
              right: 10px;
              background: #ff5722;
              color: white;
              padding: 2px 8px;
              border-radius: 10px;
              font-size: 12px;
              font-weight: bold;
              z-index: 1000;
            `;
            indicator.textContent = `Matched ${matchingSkillsCount} skills`;
            card.appendChild(indicator);
          }
          
          // Rating indicator for unrated jobs
          if (jobDetails.rating === null && config.minRating > 0) {
            let ratingNote = card.querySelector('.unrated-job-note');
            if (!ratingNote) {
              ratingNote = document.createElement('div');
              ratingNote.className = 'unrated-job-note';
              ratingNote.style.cssText = `
                position: absolute;
                top: 10px;
                right: ${matchingSkillsCount > 0 ? '140px' : '10px'};
                background: #607d8b;
                color: white;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 12px;
                z-index: 1000;
              `;
              ratingNote.textContent = 'No rating';
              card.appendChild(ratingNote);
            }
          }
          
          // Make sure it's visible if hiding non-matches
          card.style.display = '';
        } else if (config.hideMismatches) {
          // Hide non-matching cards
          card.style.display = 'none';
        } else {
          // Reset styles for non-matching visible cards
          card.style.backgroundColor = '';
          card.style.boxShadow = '';
          card.style.borderRadius = '';
          
          // Remove any indicators
          const indicator = card.querySelector('.matching-skills-indicator');
          if (indicator) indicator.remove();
          
          const ratingNote = card.querySelector('.unrated-job-note');
          if (ratingNote) ratingNote.remove();
          
          // Make sure it's visible
          card.style.display = '';
        }
      }
    });
    
    // Update stats display
    const statsDisplay = document.getElementById('filter-stats');
    if (statsDisplay) {
      statsDisplay.innerHTML = `
          <strong>Filters:</strong> 
          ${config.requiredSkills.length > 0 ? `Skills: ${config.requiredSkills.join(', ')}` : 'No skills filter'}
          ${config.minRating > 0 ? `, Min rating: ${config.minRating}` : ''}
          ${config.minRating > 0 ? ` (${config.includeUnratedJobs ? 'including' : 'excluding'} unrated)` : ''}
        </div>
      `;
    }
    
    // Store matching jobs data for export
    window.naukriMatchingJobs = matchingJobsData;
    
    return matchingJobsData;
  };
  
  // Navigate to the next page
  const goToNextPage = () => {
    const nextButton = document.querySelector('.styles_btn-secondary__2AsIP:not(.styles_previous__PobAs)');
    if (nextButton && !nextButton.hasAttribute('disabled')) {
      console.log('Navigating to next page...');
      nextButton.click();
      return true;
    } else {
      console.log('Next button not available or disabled');
      return false;
    }
  };
  
  // Get current page number
  const getCurrentPage = () => {
    const selectedPage = document.querySelector('.styles_selected__j3uvq');
    return selectedPage ? parseInt(selectedPage.textContent) : 1;
  };
  
  // Get max page number available
  const getMaxPages = () => {
    // Check if there's a hidden element or metadata with the total number of pages
    const totalPagesElement = document.querySelector('[data-total-pages]');
    if (totalPagesElement) {
      const totalPages = parseInt(totalPagesElement.getAttribute('data-total-pages'));
      if (!isNaN(totalPages)) {
        return totalPages;
      }
    }
  
    // Fallback to visible pagination links
    const pageLinks = document.querySelectorAll('.styles_pages__v1rAK a');
    let maxPage = 1;
  
    pageLinks.forEach(link => {
      const pageNum = parseInt(link.textContent);
      if (!isNaN(pageNum) && pageNum > maxPage) {
        maxPage = pageNum;
      }
    });
  
    return maxPage;
  };
  
  // Update progress display
  const updateProgress = (current, max) => {
    const progressContainer = document.getElementById('search-progress-container');
    const progressFill = document.getElementById('search-progress-fill');
    const progressText = document.getElementById('search-progress-text');
    
    if (progressContainer && progressFill && progressText) {
      progressContainer.style.display = 'block';
      const percentage = (current / max) * 100;
      progressFill.style.width = `${percentage}%`;
      progressText.textContent = `Searching page ${current} of ${max}...`;
    }
  };
  
  // Start the full search process
  const startFullSearch = () => {
    if (isSearching) {
      alert('Search is already in progress!');
      return;
    }
    
    // Update config from inputs
    updateConfigFromInputs();
    
    // Reset collected jobs
    config.collectedJobs = [];
    
    // Get the current page
    currentPage = getCurrentPage();
    
    // Update the full search button
    const fullSearchButton = document.getElementById('full-search-button');
    if (fullSearchButton) {
      fullSearchButton.textContent = 'Searching...';
      fullSearchButton.disabled = true;
      fullSearchButton.style.backgroundColor = '#9e9e9e';
    }
    
    // Show the progress bar
    const progressContainer = document.getElementById('search-progress-container');
    if (progressContainer) {
      progressContainer.style.display = 'block';
    }
    
    // Start searching
    isSearching = true;
    console.log(`Starting full search up to ${config.maxPagesToSearch} pages...`);
    
    // Start the search process
    searchCurrentPage(currentPage);
  };
  
  // Search the current page and then move to the next
  const searchCurrentPage = (currentPageNum) => {
    console.log(`Searching page ${currentPageNum}...`);
    
    // Update progress display
    updateProgress(currentPageNum, config.maxPagesToSearch);
    
    // Filter jobs on the current page
    const currentPageJobs = filterJobs();
    
    // Process the filtered jobs - here we just collect basic info
    const simplifiedJobs = currentPageJobs.map(job => {
      return {
        jobId: job.jobId,
        jobTitle: job.jobTitle,
        companyName: job.companyName,
        rating: job.rating,
        link: job.jobLink,
        pageFound: currentPageNum
      };
    });
    
    // Add to the collection
    config.collectedJobs = [...config.collectedJobs, ...simplifiedJobs];
    
    // Update total jobs collected display
    const totalJobsCollectedDisplay = document.getElementById('total-jobs-collected');
    if (totalJobsCollectedDisplay) {
      totalJobsCollectedDisplay.textContent = `Total Jobs Collected: ${config.collectedJobs.length}`;
    }
    
    console.log(`Found ${simplifiedJobs.length} matching jobs on page ${currentPageNum}`);
    console.log(`Total jobs collected so far: ${config.collectedJobs.length}`);
    
    // Check if we should continue
    if (currentPageNum < config.maxPagesToSearch) {
      // Try to go to the next page
      const hasNextPage = goToNextPage();
      
      if (hasNextPage) {
        // Wait for the page to load before searching again
        setTimeout(() => {
          searchCurrentPage(currentPageNum + 1);
        }, config.searchDelay);
      } else {
        // No more pages, finish the search
        finishFullSearch();
      }
    } else {
      // Reached the max pages to search, finish
      finishFullSearch();
    }
  };
  
  // Finish the full search process
  const finishFullSearch = () => {
    isSearching = false;
    
    // Update the button
    const fullSearchButton = document.getElementById('full-search-button');
    if (fullSearchButton) {
      fullSearchButton.textContent = 'Search Full';
      fullSearchButton.disabled = false;
      fullSearchButton.style.backgroundColor = '#2196F3';
    }
    
    // Update the progress text
    const progressText = document.getElementById('search-progress-text');
    if (progressText) {
      progressText.textContent = `Found ${config.collectedJobs.length} jobs across ${getCurrentPage()} pages!`;
    }
    
    // Show a completion alert
    alert(`Full search complete! Found ${config.collectedJobs.length} matching jobs across ${getCurrentPage()} pages.`);
    
    // Export the results automatically
    exportFullSearchResults();
  };
  
  // Export full search results
  const exportFullSearchResults = () => {
    const jobs = config.collectedJobs;
    
    if (!jobs || jobs.length === 0) {
      alert("No matching jobs were found during the full search");
      return;
    }
    
    // Get all unique fields from all job objects
    const allFields = new Set();
    
    jobs.forEach(job => {
      Object.keys(job).forEach(key => {
        allFields.add(key);
      });
    });
    
    // Create CSV header row
    const fields = Array.from(allFields);
    let csv = fields.join(',') + '\n';
    
    // Add job data rows
    jobs.forEach(job => {
      const row = fields.map(field => {
        // Escape quotes and wrap in quotes
        const value = job[field] !== undefined ? job[field] : '';
        return `"${String(value).replace(/"/g, '""')}"`;
      }).join(',');
      
      csv += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'full_search_results.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Exported ${jobs.length} jobs to full_search_results.csv`);
  };
  
  // Export matching jobs to CSV (for single page results)
  const exportMatchingJobs = () => {
    const jobs = window.naukriMatchingJobs || [];
    
    if (!jobs || jobs.length === 0) {
      alert("No matching jobs to export");
      return;
    }
    
    // Get all unique fields from all job objects
    const excludeFields = ['element', 'postedDate', 'combinedText'];
    const allFields = new Set();
    
    jobs.forEach(job => {
      Object.keys(job).forEach(key => {
        if (!excludeFields.includes(key)) {
          allFields.add(key);
        }
      });
    });
    
    // Create CSV header row
    const fields = Array.from(allFields);
    let csv = fields.join(',') + '\n';
    
    // Add job data rows
    jobs.forEach(job => {
      const row = fields.map(field => {
        if (field === 'skills') {
          // Join skills array with semicolons
          return `"${job.skills ? job.skills.join('; ') : ''}"`;
        } else {
          // Escape quotes and wrap in quotes
          const value = job[field] !== undefined ? job[field] : '';
          return `"${String(value).replace(/"/g, '""')}"`;
        }
      }).join(',');
      
      csv += row + '\n';
    });
    
    // Create download link
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', config.exportFilename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    console.log(`Exported ${jobs.length} jobs to ${config.exportFilename}`);
  };
  
  // Initialize
  createControlPanel();
  filterJobs();
  
  // Return public methods
  return {
    applyFilter: filterJobs,
    exportCSV: exportMatchingJobs,
    startFullSearch: startFullSearch,
    updateConfig: (newConfig) => {
      Object.assign(config, newConfig);
      filterJobs();
    }
  };
}

// Run the filter
const naukriFilter = naukriSkillsFilter();

// Instructions for console
console.log(`
--------------------------------------------------
Naukri Skills Filter - WITH FULL SEARCH CAPABILITY
--------------------------------------------------
Filter initialized! You should see a control panel in the top-right corner.

NEW FEATURE: "Search Full" button that will:
- Search through multiple pages (up to 50 or the last page)
- Collect matching jobs across all pages
- Export results automatically when complete

This filter shows jobs that have ALL of your specified skills.

Key Features:
- Case-insensitive skill matching
- Option to include jobs with no rating 
- Skill search also looks in job descriptions
- Better date parsing
- Multi-page search capability

You can also control it via console:

To start a full search:
  naukriFilter.startFullSearch();

To update filter settings:
  naukri`);