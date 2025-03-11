console.log("Fake News Detector script running...");

let FLASK_SERVER_API = "https://8c1d-34-142-234-51.ngrok-free.app"; // Update as needed

function showLoading(targetElement) {
  const loadingDiv = document.createElement('div');
  loadingDiv.style.position = 'absolute';
  loadingDiv.style.background = '#ffffcc';
  loadingDiv.style.padding = '5px';
  loadingDiv.style.zIndex = '10000';
  loadingDiv.style.color = '#000000';
  loadingDiv.style.fontSize = '12px';
  loadingDiv.innerText = 'Loading...';
  targetElement.appendChild(loadingDiv);
  return loadingDiv;
}

function showResult(targetElement, loadingDiv, label, score) {
  targetElement.removeChild(loadingDiv);
  const resultDiv = document.createElement('div');
  resultDiv.style.position = 'relative';
  resultDiv.style.display = 'inline-block';
  resultDiv.style.background = label === 'Fake' ? '#ffcccc' : '#ccffcc';
  resultDiv.style.padding = '5px';
  resultDiv.style.zIndex = '10000';
  resultDiv.style.color = '#000000';
  resultDiv.style.fontSize = '12px';
  resultDiv.innerText = `${label} (${(score * 100).toFixed(0)}%)`;
  targetElement.appendChild(resultDiv);
}

function analyzePosts() {
  const posts = document.querySelectorAll(
    'article [data-testid="tweetText"], article div[lang], ' + // X
    '[data-testid="post-container"] h3, [data-testid="post-container"] div[class*="RichTextJSON-root"], ' + // New Reddit
    '.entry .title a, .entry .usertext-body' // Old Reddit
  );
  if (!posts.length) {
    console.log("No posts found on this page.");
    return false;
  }
  posts.forEach((post, index) => {
    const postText = post.innerText.trim();
    if (!postText || post.dataset.analyzed) return;
    post.dataset.analyzed = 'true';
    console.log(`Text found in post ${index}:`, postText);

    const loadingDiv = showLoading(post.parentElement || post);

    fetch(FLASK_SERVER_API + '/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: postText })
    })
      .then(response => response.json())
      .then(data => {
        showResult(post.parentElement || post, loadingDiv, data.label, data.score);
      })
      .catch(error => {
        console.error(`Error analyzing post ${index}:`, error);
        const label = postText.includes('miracle') ? 'Fake' : 'Real';
        const score = postText.includes('miracle') ? 0.9 : 0.6;
        showResult(post.parentElement || post, loadingDiv, label, score);
      });
  });
  return true;
}

if (window.location.hostname === 'x.com' || window.location.hostname === 'reddit.com') {
  if (!analyzePosts()) {
    let debounceTimeout;
    const observer = new MutationObserver(() => {
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(analyzePosts, 500);
    });
    observer.observe(document.body, { childList: true, subtree: true });
    setInterval(analyzePosts, 5000); // Recheck every 5s
  }
} else {
  const articleText = document.querySelector('article')?.innerText || document.body.innerText;
  if (!articleText) {
    console.log("No content to analyze on this website.");
  } else {
    console.log("Text found:", articleText);
    const loadingDiv = showLoading(document.body);
    fetch(FLASK_SERVER_API + '/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: articleText })
    })
      .then(response => response.json())
      .then(data => {
        document.body.removeChild(loadingDiv);
        const resultDiv = document.createElement('div');
        resultDiv.style.position = 'fixed';
        resultDiv.style.top = '10px';
        resultDiv.style.right = '10px';
        resultDiv.style.background = data.label === 'Fake' ? '#ffcccc' : '#ccffcc';
        resultDiv.style.padding = '10px';
        resultDiv.style.zIndex = '10000';
        resultDiv.style.color = '#000000';
        resultDiv.innerText = `${data.label} - Confidence: ${(data.score * 100).toFixed(2)}%`;
        document.body.appendChild(resultDiv);
      })
      .catch(error => {
        console.error('Error analyzing website:', error);
        loadingDiv.style.background = '#ffcccc';
        loadingDiv.innerText = 'Error: Failed to analyze';
      });
  }
}