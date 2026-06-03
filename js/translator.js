const API_URL = "https://translate.googleapis.com/translate_a/single";
// the LANG_URL is for getting all available languages from the server
const LANG_URL =
  "https://translate.googleapis.com/translate_a/l?client=gtx&hl=en";

const srcLang = document.querySelector("#sourceLang");
const tgtLang = document.querySelector("#targetLang");
const srcText = document.querySelector("#sourceText");
const tgtText = document.querySelector("#translatedText");
const translateBtn = document.querySelector("#translateBtn");
const swapBtn = document.querySelector("#swapBtn");
const charCount = document.querySelector("#charCount");

// first fetch all supported languages from google and fill both dropdowns
async function loadLanguages() {
  const res = await fetch(LANG_URL);
  const data = await res.json();

  function fillDropdown(selectElement, langObject) {
    for (let code in langObject) {
      let option = document.createElement("option");
      option.value = code;
      option.textContent = langObject[code];
      selectElement.appendChild(option);
    }
  }
  fillDropdown(srcLang, data.sl);
  fillDropdown(tgtLang, data.tl);

  srcLang.value = "auto";
  tgtLang.value = "hi";
}

// translate the text
async function translate() {
  let text = srcText.value.trim();
  if (!text) {
    alert("Enter some text first.");
    return;
  }
  let from = srcLang.value;
  let to = tgtLang.value;

  if (from === to) {
    tgtText.value = text;
    return;
  }
  translateBtn.disabled = true;
  translateBtn.innerHTML =
    '<span class="spinner-border spinner-border-sm me-2"></span>Translating...';
  tgtText.value = "";

  let url = `${API_URL}?client=gtx&sl=${from}&tl=${to}&dt=t&q=${encodeURIComponent(text)}`;

  const res = await fetch(url);
  const data = await res.json();

  let translated = "";
  for (let i = 0; i < data[0].length; i++) {
    translated += data[0][i][0];
  }
  if (translated) {
    tgtText.value = translated;
  } else {
    tgtText.value = "Couldn't translate. Please try again.";
  }

  if (from === "auto" && data[2]) {
    let detected = data[2];
    for (let i = 0; i < srcLang.options.length; i++) {
      if (srcLang.options[i].value === detected) {
        srcLang.value = detected;
        break;
      }
    }
  }
  translateBtn.disabled = false;
  translateBtn.innerHTML = '<i class="bi bi-translate me-2"></i>Translate';
}

function swapLanguages() {
  if (srcLang.value === "auto") return;

  [srcLang.value, tgtLang.value] = [tgtLang.value, srcLang.value];
  [srcText.value, tgtText.value] = [tgtText.value, srcText.value];

  updateCharCount();
}
function updateCharCount() {
  charCount.textContent = srcText.value.length + " / 5000";
}

translateBtn.addEventListener("click", translate);
swapBtn.addEventListener("click", swapLanguages);
srcText.addEventListener("input", updateCharCount);
srcText.addEventListener("keydown", function (e) {
  if (e.ctrlKey && e.key === "Enter") {
    translate();
  }
});
loadLanguages();
