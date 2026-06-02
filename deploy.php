<?php
// ============================================================
//  GitHub Webhook — Auto Deploy
//  מקם קובץ זה ב-public_html ואל תשתף את ה-SECRET עם אף אחד
// ============================================================

define('SECRET', 'mC5nySa6-RL=kO9B0Uj1u$TIgvwQr%l?V&NceZHd');
define('BRANCH', 'refs/heads/main');
define('LOG_FILE', __DIR__ . '/deploy.log');

// --- קבלת הבקשה ---
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Method Not Allowed');
}

$payload   = file_get_contents('php://input');
$signature = $_SERVER['HTTP_X_HUB_SIGNATURE_256'] ?? '';

// --- אימות חתימת GitHub ---
$expected = 'sha256=' . hash_hmac('sha256', $payload, SECRET);
if (!hash_equals($expected, $signature)) {
    http_response_code(403);
    log_msg('ERROR: Invalid signature');
    exit('Forbidden');
}

// --- פענוח ה-payload ---
$data = json_decode($payload, true);
$ref  = $data['ref'] ?? '';

if ($ref !== BRANCH) {
    http_response_code(200);
    log_msg("Skipped push to: $ref");
    exit('Not main branch, skipping.');
}

// --- הרצת git pull ---
$output = shell_exec('cd ' . escapeshellarg(__DIR__) . ' && git pull origin main 2>&1');
log_msg("Deploy triggered\n$output");

http_response_code(200);
echo 'Deployed successfully.';

// --- פונקציית לוג ---
function log_msg(string $msg): void {
    $line = '[' . date('Y-m-d H:i:s') . '] ' . $msg . PHP_EOL;
    file_put_contents(LOG_FILE, $line, FILE_APPEND);
}
