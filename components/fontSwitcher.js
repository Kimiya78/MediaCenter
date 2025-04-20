// fontSwitcher.js
export function setFont(isRtl) {
    if (isRtl) {
      document.documentElement.style.setProperty('--font-family', "'IranYekanBakh', sans-serif");
    } else {
      document.documentElement.style.setProperty('--font-family', "'EnglishFont', sans-serif");
    }
  }