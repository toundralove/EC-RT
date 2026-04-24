window.Zone01Memory = (() => {
  const STORAGE_KEY = "ecart_zone01_attention_memory_v1";

  let data = {
    points: []
  };

  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.points)) data = saved;
    } catch {
      data = { points: [] };
    }
  }

  function save() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function addPoint(point) {
    data.points.push(point);
    save();
  }

  function updatePoint(index, patch) {
    if (!data.points[index]) return;
    data.points[index] = { ...data.points[index], ...patch };
    save();
  }

  function all() {
    return [...data.points];
  }

  function count() {
    return data.points.length;
  }

  function reset() {
    data = { points: [] };
    save();
  }

  load();

  return {
    addPoint,
    updatePoint,
    all,
    count,
    reset
  };
})();