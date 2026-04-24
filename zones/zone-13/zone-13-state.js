const STORAGE_KEY = "ecart_zone10_state";

export function getZone10State() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      visits: 0,
      activated: false
    };
  } catch {
    return { visits: 0, activated: false };
  }
}

export function saveZone10State(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}