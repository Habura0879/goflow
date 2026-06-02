<?php
// ============================================================
//  סקריפט הגדרה חד-פעמי — מחק קובץ זה מיד לאחר השימוש!
// ============================================================

define('SETUP_PASSWORD', 'goflow1234');
define('REPO_URL', 'https://github.com/Habura0879/goflow.git');
define('DIR', __DIR__);

// --- אימות סיסמה ---
$pass = $_GET['pass'] ?? '';
if (!hash_equals(SETUP_PASSWORD, $pass)) {
    http_response_code(403);
    exit('Forbidden. Usage: setup.php?pass=YOUR_PASSWORD');
}

$steps  = [];
$errors = [];

function run(string $cmd): string {
    return shell_exec($cmd . ' 2>&1') ?? '';
}

// --- בדיקת git ---
$gitVersion = run('git --version');
if (!str_contains($gitVersion, 'git version')) {
    exit('ERROR: git is not available on this server via shell_exec.');
}
$steps[] = "git version: $gitVersion";

// --- בדיקה אם כבר קיים .git ---
if (is_dir(DIR . '/.git')) {
    $steps[] = 'Git repo already initialized. Running git pull...';
    $out = run('cd ' . escapeshellarg(DIR) . ' && git pull origin main');
    $steps[] = $out;
} else {
    // --- אתחול ראשוני ---
    $steps[] = run('cd ' . escapeshellarg(DIR) . ' && git init');
    $steps[] = run('cd ' . escapeshellarg(DIR) . ' && git remote add origin ' . REPO_URL);
    $steps[] = run('cd ' . escapeshellarg(DIR) . ' && git fetch origin');
    $steps[] = run('cd ' . escapeshellarg(DIR) . ' && git checkout -b main origin/main 2>&1 || git checkout main');
}

// --- פלט ---
header('Content-Type: text/plain; charset=utf-8');
echo "=== Setup Results ===\n\n";
foreach ($steps as $s) {
    echo trim($s) . "\n\n";
}
echo "=== Done ===\n";
echo "IMPORTANT: Delete this file (setup.php) from the server immediately!\n";
