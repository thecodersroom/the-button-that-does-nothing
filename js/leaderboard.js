// Supabase client initialization
const supabaseUrl = 'https://rpgvwfesyotrsqhubnbw.supabase.co';
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJwZ3Z3ZmVzeW90cnNxaHVibmJ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE0NDQyODAsImV4cCI6MjA3NzAyMDI4MH0.ca1gukJxmnfMPeR7dql5tPWbsfMLCFbQdsrTBwI0FLw"; // Replace with actual key
const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

// User management
let userId = localStorage.getItem('userId');
let userName = localStorage.getItem('userName');
let isGithubUser = localStorage.getItem('isGithubUser') === 'true';
let userAvatar = localStorage.getItem('userAvatar');
let highScore = localStorage.getItem('nothingHighScore') || 0;

// Generate UUID function
function generateUUID() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        const r = Math.random() * 16 | 0;
        const v = c === 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
}

// Initialize user ID if not exists
if (!userId) {
    userId = generateUUID();
    localStorage.setItem('userId', userId);
}

// Fetch GitHub avatar with timeout and fallback
async function fetchGithubAvatar(username) {
    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout

        const response = await fetch(`https://api.github.com/users/${username}`, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (response.ok) {
            const data = await response.json();
            return data.avatar_url;
        }
    } catch (error) {
        console.log('Error fetching GitHub avatar:', error);
    }
    
    // Fallback to default avatar
    return 'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png';
}

// Show username modal
function showUsernameModal() {
    const modal = document.getElementById('username-inline');
    const input = document.getElementById('username-input');
    const githubCheckbox = document.getElementById('is-github-username');
    const saveButton = document.getElementById('save-username');

    if (!userName) {
        modal.style.display = 'block';
        input.value = '';
        githubCheckbox.checked = false;

        saveButton.onclick = async () => {
            const name = input.value.trim();
            if (name) {
                userName = name;
                isGithubUser = githubCheckbox.checked;
                localStorage.setItem('userName', userName);
                localStorage.setItem('isGithubUser', isGithubUser);

                if (isGithubUser) {
                    userAvatar = await fetchGithubAvatar(userName);
                    localStorage.setItem('userAvatar', userAvatar);
                }

                modal.style.display = 'none';
                updateLeaderboard();
            }
        };
    }
}

// Format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Update leaderboard display
async function updateLeaderboard() {
    const leaderboardList = document.getElementById('leaderboard-list');
    
    try {
        const { data: scores, error } = await supabase
            .from('leaderboard')
            .select('*')
            .order('score', { ascending: false })
            .limit(10);

        if (error) throw error;

        // Keep only unique users with their highest score
        const uniqueScores = [];
        const seen = new Set();

        for (const entry of scores) {
        if (!seen.has(entry.user_id)) {
            seen.add(entry.user_id);
            uniqueScores.push(entry);
        }
        }

        // Take top 10 after filtering
        const topScores = uniqueScores.slice(0, 10);

    
        leaderboardList.innerHTML = topScores.map((entry, index) => `
            <div class="leaderboard-entry${entry.user_id === userId ? ' current-user' : ''}">
                <div class="leaderboard-rank">#${index + 1}</div>
                <img class="player-avatar" src="${
                    entry.github_username ? 
                    `https://github.com/${entry.github_username}.png` : 
                    'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'
                }" 
                onerror="this.src='https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png'"
                alt="${entry.name}'s avatar">
                <div class="player-info">
                    <div class="player-name">${entry.name}</div>
                    <div class="player-stats">
                        <span>Score: ${formatNumber(entry.score)}</span>
                        <span>Time: ${Math.floor(entry.time_spent / 60)}m ${entry.time_spent % 60}s</span>
                        <span>Accuracy: ${entry.accuracy}%</span>
                    </div>
                </div>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

// Submit score to leaderboard
export async function submitScore(score, accuracy, timeSpent) {
    if (!userName) {
        showUsernameModal();
        return;
    }

    try {
        if (!accuracy) {
            accuracy = 0;
        }
        
        const { error } = await supabase
            .from('leaderboard')
            .insert([{
                user_id: userId,
                name: userName,
                score: score,
                time_spent: timeSpent,
                accuracy: accuracy,
                github_username: isGithubUser ? userName : null
            }]);

        if (error) throw error;
        
        updateLeaderboard();
    } catch (error) {
        console.error('Error submitting score:', error);
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    if (!userName) {
        showUsernameModal();
    }
    updateLeaderboard();
});