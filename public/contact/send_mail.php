<?php

require '../../vendor/autoload.php';
require '../../src/php/MailResults.php';

$logger = new Katzgrau\KLogger\Logger(dirname(dirname(dirname(__FILE__))).'/logs');

$config = json_decode(utf8_encode(file_get_contents('../../src/config/config.json')));

date_default_timezone_set('Etc/UTC');
header('Content-Type: application/json');


/**
 * Check referring origin to make sure we're not sending email from everyone out there.
 */
$acceptable_origins = array(
  'http://www.timmcduffie.com',
  'http://timmcduffie.com',
  'http://dev.timmcduffie.com',
  'http://127.0.0.1:3001'
);

if ($_SERVER['REQUEST_METHOD'] !== 'POST' || !in_array($_SERVER['HTTP_ORIGIN'], $acceptable_origins)) {
  if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
  }

  if (!in_array($_SERVER['HTTP_ORIGIN'], $acceptable_origins)) {
    http_response_code(403);
  }

  $access_details = array(
    'method' => $_SERVER['REQUEST_METHOD'],
    'origin' => $_SERVER['HTTP_ORIGIN']
  );

  $logger->warning('attempt to access from unapproved method or origin: ', $access_details);

  exit();
}


/**
 * Set appropriate headers and populate POST data/
 */
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

$mail->SMTPDebug = 0;
$mail->isSMTP();

$mail->SMTPAuth = true;
$mail->Port = 587;
$mail->SMTPSecure = 'tls';
$mail->Host = $config->email->host;
$mail->Username = $config->email->username;
$mail->Password = $config->email->password;

$mail->From = $config->email->fromemail;
$mail->FromName = 'tmcd.com Contact Form';
$mail->addAddress($config->email->recipient, 'Tim McDuffie');
$mail->addReplyTo($email, $name);
$mail->Subject = 'Website contact from: ' . $name . ' <' . $email . '>';
$mail->isHTML(false);
$mail->Body = $message;

http_response_code(200);


/**
 * Send response.
 */
if(!$mail->send())
{
  http_response_code(500);
  $results->addError('We encountered an unexpected are unable to send your message. Please try again.');
  $logger->error('Mail failed to send', array($mail->ErrorInfo));
}

echo $results->jsoninfy();