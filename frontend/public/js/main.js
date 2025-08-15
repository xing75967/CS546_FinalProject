document.addEventListener('DOMContentLoaded', function() {
    
    const bookmarkBtn = document.getElementById('bookmark-btn');

    if (bookmarkBtn) {
        bookmarkBtn.addEventListener('click', async function(event) {
            event.preventDefault();
            
            const toolId = this.dataset.toolId;
            const icon = this.querySelector('i');
            const text = this.querySelector('#bookmark-text');

            try {
                const response = await fetch(`/api/tools/${toolId}/bookmark`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-Requested-With': 'XMLHttpRequest'
                    }
                });

                if (!response.ok) {
                  
                    if (response.status === 401) {
                        window.location.href = '/users/login';
                    }
                    throw new Error('Server failed');
                }

                const result = await response.json();

                if (result.success) {
                   
                    if (result.bookmarked) {
                        this.classList.remove('btn-outline-success');
                        this.classList.add('btn-success');
                        icon.classList.remove('fa-regular');
                        icon.classList.add('fa-solid');
                        text.textContent = 'Bookmarked';
                    } else {
                        this.classList.remove('btn-success');
                        this.classList.add('btn-outline-success');
                        icon.classList.remove('fa-solid');
                        icon.classList.add('fa-regular');
                        text.textContent = 'Bookmark';
                    }
                }

            } catch (error) {
                console.error('Bookmark failed:', error);
            }
        });
    }
});
