
document.addEventListener("DOMContentLoaded", () => {
  const reviewForm = document.getElementById("review-form");
  if (!reviewForm) return;

  reviewForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const content = reviewForm.querySelector("textarea[name='content']").value.trim();
    const functionality = parseInt(reviewForm.querySelector("input[name='functionality']").value);
    const usability = parseInt(reviewForm.querySelector("input[name='usability']").value);
    const value = parseInt(reviewForm.querySelector("input[name='value']").value);
    const urlParts = window.location.pathname.split("/");
    const toolId = urlParts[urlParts.length - 1];

    if (!content || !functionality || !usability || !value) {
      alert("Please fill all fields");
      return;
    }

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tool_id: toolId,
          content,
          ratings: { functionality, usability, value },
        }),
      });
      const result = await res.json();
      if (!res.ok) throw new Error(result.error || result.errors?.join(", ") || "Failed to submit review");
      alert("Review submitted");
      window.location.reload();
    } catch (err) {
      alert(err.message);
    }
  });
});
