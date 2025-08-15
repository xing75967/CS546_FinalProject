
// 简单的搜索和交互，可后续拓展
document.addEventListener("DOMContentLoaded", () => {
  const searchInput = document.getElementById("search-input");
  const searchBtn = document.getElementById("search-btn");

  if (searchBtn && searchInput) {
    searchBtn.addEventListener("click", () => {
      const query = searchInput.value.trim();
      window.location.href = `/tools?search=${encodeURIComponent(query)}`;
    });
  }
});
