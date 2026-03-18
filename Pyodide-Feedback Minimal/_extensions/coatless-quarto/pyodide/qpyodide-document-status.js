// Declare startupMessageqpyodide globally
globalThis.qpyodideStartupMessage = document.createElement("p");

// Function to set the button text
globalThis.qpyodideSetInteractiveButtonState = function(buttonText, enableCodeButton = true) {
  document.querySelectorAll(".qpyodide-button-run").forEach((btn) => {
    btn.innerHTML = buttonText;
    btn.disabled = !enableCodeButton;
  });
  document.querySelectorAll(".qpyodide-button-feedback").forEach((btn) => {
    btn.disabled = !enableCodeButton;
  });
}

// Function to update the status message in non-interactive cells
globalThis.qpyodideUpdateStatusMessage = function(message) {
  document.querySelectorAll(".qpyodide-status-text.qpyodide-cell-needs-evaluation").forEach((elem) => {
    elem.innerText = message;
  });
}

// Function to update the status message
globalThis.qpyodideUpdateStatusHeader = function(message) {

  if (!qpyodideShowStartupMessage) return;

  qpyodideStartupMessage.innerHTML = message;
}

// Status header update with customized spinner message
globalThis.qpyodideUpdateStatusHeaderSpinner = function(message) {

  qpyodideUpdateStatusHeader(`
    <i class="fa-solid fa-spinner fa-spin qpyodide-icon-status-spinner"></i>
    <span>${message}</span>
  `);
}


// Function that attaches the document status message
function qpyodideDisplayStartupMessage(showStartupMessage) {
  if (!showStartupMessage) {
    return;
  }

  // Get references to header elements
  const headerHTML = document.getElementById("title-block-header");
  const headerRevealJS = document.getElementById("title-slide");

  // Create the outermost div element for metadata
  const quartoTitleMeta = document.createElement("div");
  quartoTitleMeta.classList.add("quarto-title-meta");

  // Create the first inner div element
  const firstInnerDiv = document.createElement("div");
  firstInnerDiv.setAttribute("id", "qpyodide-status-message-area");

  // Create the second inner div element for "Pyodide Status" heading and contents
  const secondInnerDiv = document.createElement("div");
  secondInnerDiv.setAttribute("id", "qpyodide-status-message-title");
  secondInnerDiv.classList.add("quarto-title-meta-heading");
  secondInnerDiv.innerText = "Pyodide Status";

  // Create another inner div for contents
  const secondInnerDivContents = document.createElement("div");
  secondInnerDivContents.setAttribute("id", "qpyodide-status-message-body");
  secondInnerDivContents.classList.add("quarto-title-meta-contents");

  // Create the third inner div element for "BaseUrl"
  const thirdInnerDiv = document.createElement("div");
  thirdInnerDiv.setAttribute("id", "qpyodide-enter-baseUrl");
  thirdInnerDiv.classList.add("quarto-title-meta-input");
  thirdInnerDiv.innerText = "";

  // Create the fourth inner div element for "ApiKey"
  const fourthInnerDiv = document.createElement("div");
  fourthInnerDiv.setAttribute("id", "qpyodide-enter-apiKey");
  fourthInnerDiv.classList.add("quarto-title-meta-input");
  fourthInnerDiv.innerText = "";

  if (globalThis.backend == "groq") {
    var apiKeyInput = document.createElement('input');
    apiKeyInput.type = 'text';
    apiKeyInput.id = `apiKeyInput`;
    apiKeyInput.placeholder = 'Enter your API Key';
    apiKeyInput.style.width = '600px';

    var saveButton = document.createElement('button');
    saveButton.id = 'saveApiKeyButton';
    saveButton.className = 'btn btn-default qpyodide-button qpyodide-button-saveKey';
    saveButton.type = 'button';
    saveButton.innerText = 'Save API Key';
    saveButton.style.margin = '10px';

    saveButton.addEventListener('click', function() {
      var groqApiKey = apiKeyInput.value;
      if (groqApiKey) {
        sessionStorage.setItem('groqApiKey', groqApiKey);
        alert('API Key saved successfully!');
        checkAndHideSettings();
      } else {
        alert('Please enter a valid API Key.');
      }
    });

    fourthInnerDiv.appendChild(apiKeyInput);
    fourthInnerDiv.appendChild(saveButton);

    var baseUrlInput = document.createElement('input');
    baseUrlInput.type = 'text';
    baseUrlInput.id = `baseUrlInput`;
    baseUrlInput.placeholder = 'Enter your Base Url';
    baseUrlInput.style.width = '600px';

    var saveButton2 = document.createElement('button');
    saveButton2.id = 'saveBaseUrlButton';
    saveButton2.className = 'btn btn-default qpyodide-button qpyodide-button-saveUrl';
    saveButton2.type = 'button';
    saveButton2.innerText = 'Save Base Url';
    saveButton2.style.margin = '10px';

    saveButton2.addEventListener('click', function() {
      var baseUrl = baseUrlInput.value;
      if (baseUrl) {
        sessionStorage.setItem('baseUrlInput', baseUrl);
        alert('Base Url saved successfully!');
        checkAndHideSettings();
      } else {
        alert('Please enter a valid base Url.');
      }
    });

    thirdInnerDiv.appendChild(baseUrlInput);
    thirdInnerDiv.appendChild(saveButton2);

    var settingsIcon = document.createElement('i');
    settingsIcon.classList.add('fa-solid', 'fa-gear');
    settingsIcon.id = 'settingsIcon';
    settingsIcon.style.fontSize = '20px';
    settingsIcon.style.cursor = 'pointer';
    settingsIcon.style.display = 'inline-block';
    settingsIcon.style.position = 'absolute';
    settingsIcon.style.right = '0';
    settingsIcon.addEventListener('click', toggleSettings);
    firstInnerDiv.appendChild(settingsIcon);

    function toggleSettings() {
      var isVisible = apiKeyInput.style.display !== 'none';
      apiKeyInput.style.display = isVisible ? 'none' : 'inline-block';
      saveButton.style.display = isVisible ? 'none' : 'inline-block';
      baseUrlInput.style.display = isVisible ? 'none' : 'inline-block';
      saveButton2.style.display = isVisible ? 'none' : 'inline-block';
    }

    function checkAndHideSettings() {
      var savedApiKey = sessionStorage.getItem('groqApiKey');
      var savedBaseUrl = sessionStorage.getItem('baseUrlInput');
      if (savedApiKey && savedBaseUrl) {
        toggleSettings();
      }
    }

    document.addEventListener('DOMContentLoaded', function() {
      var savedApiKey = sessionStorage.getItem('groqApiKey');
      var savedBaseUrl = sessionStorage.getItem('baseUrlInput');
      if (savedApiKey && savedBaseUrl) {
        apiKeyInput.value = savedApiKey;
        baseUrlInput.value = savedBaseUrl;
        toggleSettings();
      }
    });
  }

  // Describe the Pyodide state
  qpyodideStartupMessage.innerText = "🟡 Loading...";
  qpyodideStartupMessage.setAttribute("id", "qpyodide-status-message-text");
  // Add `aria-live` to auto-announce the startup status to screen readers
  qpyodideStartupMessage.setAttribute("aria-live", "assertive");

  // Append the startup message to the contents
  secondInnerDivContents.appendChild(qpyodideStartupMessage);

  // Combine the inner divs and contents
  firstInnerDiv.appendChild(secondInnerDiv);
  firstInnerDiv.appendChild(secondInnerDivContents);
  firstInnerDiv.appendChild(thirdInnerDiv);
  firstInnerDiv.appendChild(fourthInnerDiv);
  quartoTitleMeta.appendChild(firstInnerDiv);

  // Determine where to insert the quartoTitleMeta element
  if (headerHTML || headerRevealJS) {
    // Append to the existing "title-block-header" element or "title-slide" div
    (headerHTML || headerRevealJS).appendChild(quartoTitleMeta);
  } else {
    // If neither headerHTML nor headerRevealJS is found, insert after "Pyodide-monaco-editor-init" script
    const monacoScript = document.getElementById("qpyodide-monaco-editor-init");
    const header = document.createElement("header");
    header.setAttribute("id", "title-block-header");
    header.appendChild(quartoTitleMeta);
    monacoScript.after(header);
  }
}

qpyodideDisplayStartupMessage(qpyodideShowStartupMessage);