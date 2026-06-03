<?php
header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['ok' => false, 'message' => 'Method not allowed']);
    exit;
}

$name    = trim(strip_tags($_POST['name']    ?? ''));
$email   = trim(strip_tags($_POST['email']   ?? ''));
$message = trim(strip_tags($_POST['message'] ?? ''));

if (!$name || !$email || !$message) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'שדות חסרים']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['ok' => false, 'message' => 'כתובת אימייל לא תקינה']);
    exit;
}

$to      = 'avrams58@gmail.com';
$subject = '=?UTF-8?B?' . base64_encode('פנייה חדשה מאתר GoFlow — ' . $name) . '?=';

$body  = "פנייה חדשה מאתר GoFlow\n";
$body .= "==============================\n";
$body .= "שם:     $name\n";
$body .= "אימייל: $email\n";
$body .= "==============================\n\n";
$body .= "הודעה:\n$message\n";

// From חייב להיות כתובת שקיימת על השרת
$headers  = "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "From: avrams58@gmail.com\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";

$sent = mail($to, $subject, $body, $headers);

// לוג לאבחון
$log = date('Y-m-d H:i:s') . " | sent=$sent | name=$name | email=$email\n";
file_put_contents(__DIR__ . '/form.log', $log, FILE_APPEND);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'שגיאה בשליחה — נסו שוב או פנו בוואטסאפ']);
}
