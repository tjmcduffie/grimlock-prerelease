<?php

require '../../vendor/autoload.php';
require '../../src/php/MailResults.php';

date_default_timezone_set('Etc/UTC');


/**
 * Check referring origin to make sure we're not sending email from everyone out there.
 */
$acceptable_origins = array(
  'http://www.timmcduffie.com',
  'http://timmcduffie.com',
  'http://dev.timmcduffie.com',
  'http://127.0.0.1:3001'
);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || in_array($_SERVER['HTTP_ORIGIN'], $acceptable_origins)) {
  // header($_SERVER["SERVER_PROTOCOL"]." 404 Not Found");
  http_response_code(404);
  exit();
}


/**
 * Set appropriate headers and populate POST data/
 */
header('Content-Type: application/json');

$name = filter_input(INPUT_POST, 'name', FILTER_SANITIZE_STRING);
$email = filter_input(INPUT_POST, 'email', FILTER_SANITIZE_EMAIL);
$message = filter_input(INPUT_POST, 'message', FILTER_SANITIZE_FULL_SPECIAL_CHARS);



/**
 * Create results object and throw errors if necessary.
 */
$results = new MailResults;

if (!$name)
{
  $results->addError('name');
}

if (!$email)
{
  $results->addError('email');
}

if (!$message)
{
  $results->addError('message');
}

if ($results->hasErrors() === true)
{
  echo $results->jsoninfy();
  exit();
}


/**
 * Configure and send the email
 */
$mail = new PHPMailer;
$mail->isSendmail();

$mail->setFrom($email, $name);
$mail->addAddress('contact@timmcduffie.com', 'Tim McDuffie');
$mail->Subject = 'Website contact from: ' . $name;
$mail->Body = $message;


/**
 * Send response.
 */
if(!$mail->send())
{
  $results->addError($mail->ErrorInfo);
}

echo $results->jsoninfy();