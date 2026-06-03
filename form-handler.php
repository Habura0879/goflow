<?php
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: https://goflow.co.il');
header('Access-Control-Allow-Methods: POST');

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
$body    = "שם: $name\nאימייל: $email\n\nהודעה:\n$message";

$headers  = "From: GoFlow Website <noreply@goflow.co.il>\r\n";
$headers .= "Reply-To: $email\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
$headers .= "Content-Transfer-Encoding: base64\r\n";

$sent = mail($to, $subject, base64_encode($body), $headers);

if ($sent) {
    echo json_encode(['ok' => true]);
} else {
    http_response_code(500);
    echo json_encode(['ok' => false, 'message' => 'שגיאה בשליחה, נסו שוב']);
}
